import { cancelNotification, showNotification } from '@core/native';
import i18n from 'i18next';
import type { MediaConnection, Peer } from 'peerjs';
import { toast } from 'sonner';

import { callAction } from './api';
import {
  CALL_AUDIO,
  CALL_CONNECT_TIMEOUT_MS,
  CALL_DEVICES_STORAGE_KEY,
  CALL_ENDED_SCREEN_MS,
  CALL_NOTIFICATION_ID,
  CALL_PEER_HOST_OVERRIDE,
  CALL_PEER_OPEN_TIMEOUT_MS,
  CALL_VIDEO,
} from './const';
import { primeRingAudio, startRing, stopRing } from './ringer';
import { CALL_INITIAL_STATE, type ICallState, isCallBusy, useCallStore } from './store';
import type {
  CallDeviceKind,
  CallEndReason,
  ICallAcceptResult,
  ICallChannelEvents,
  ICallConfigResult,
  ICallInviteResult,
  ICallUser,
} from './types';

/**
 * One 1:1 call at a time (module singleton, state in `useCallStore`).
 *
 * Outgoing: media → `config` (peer id) → open peer → `invite` → ringback …
 *           `call:accepted` (callee peer id) → `peer.call()` → stream → active.
 * Incoming: `call:incoming` → ring … accept: media → `config` → open peer → `accept` →
 *           the caller dials → `peer.on('call')` → answer → stream → active.
 */

let peer: Peer | null = null;
let connection: MediaConnection | null = null;
let localStream: MediaStream | null = null;
let connectTimer = 0;
let endedTimer = 0;
/** Bumped on every reset – async steps of an old call stop when it changed. */
let generation = 0;

const set = useCallStore.setState;
const get = useCallStore.getState;
const t = (key: string, options?: Record<string, unknown>) => i18n.t(`call:${key}`, options);

// ---- media ---------------------------------------------------------------------

type DevicePrefs = Partial<Record<CallDeviceKind, string>>;

/** Last chosen mic / camera – remembered per browser. */
const readPrefs = (): DevicePrefs => {
  try {
    return JSON.parse(window.localStorage.getItem(CALL_DEVICES_STORAGE_KEY) ?? '{}') ?? {};
  } catch {
    return {};
  }
};

const writePref = (kind: CallDeviceKind, deviceId: string) => {
  try {
    window.localStorage.setItem(
      CALL_DEVICES_STORAGE_KEY,
      JSON.stringify({ ...readPrefs(), [kind]: deviceId })
    );
  } catch {
    // Private mode / blocked storage – the choice just isn't remembered.
  }
};

const audioConstraints = (deviceId?: string): MediaTrackConstraints =>
  deviceId ? { ...CALL_AUDIO, deviceId: { ideal: deviceId } } : CALL_AUDIO;

const videoConstraints = (facing: 'user' | 'environment', deviceId?: string) =>
  // A remembered camera wins, otherwise front / back.
  deviceId
    ? { ...CALL_VIDEO, deviceId: { ideal: deviceId } }
    : { ...CALL_VIDEO, facingMode: facing };

const getLocalMedia = async (video: boolean, facing: 'user' | 'environment') => {
  const devices = navigator.mediaDevices;
  if (!devices?.getUserMedia) throw new Error('getUserMedia unsupported');
  const prefs = readPrefs();
  if (video) {
    try {
      return await devices.getUserMedia({
        audio: audioConstraints(prefs.audioinput),
        video: videoConstraints(facing, prefs.videoinput),
      });
    } catch (error) {
      // No / blocked camera → at least talk.
      console.warn('[call] camera unavailable, audio only', error);
    }
  }
  return devices.getUserMedia({ audio: audioConstraints(prefs.audioinput), video: false });
};

const trackKind = (kind: CallDeviceKind) => (kind === 'audioinput' ? 'audio' : 'video');

/** Device ids (and facing) of the tracks that are actually used. */
const deviceState = (stream: MediaStream): Partial<ICallState> => {
  const audio = stream.getAudioTracks()[0]?.getSettings();
  const video = stream.getVideoTracks()[0]?.getSettings();
  const facing = video?.facingMode;
  return {
    audioDeviceId: audio?.deviceId ?? null,
    videoDeviceId: video?.deviceId ?? null,
    ...(facing === 'user' || facing === 'environment' ? { facing } : {}),
  };
};

const applyLocal = (stream: MediaStream) => {
  localStream = stream;
  const hasCamera = stream.getVideoTracks().length > 0;
  stream.getAudioTracks().forEach(track => (track.enabled = get().micOn));
  stream.getTracks().forEach(watchTrack);
  set({
    localStream: stream,
    hasCamera,
    camOn: hasCamera && get().camOn,
    ...deviceState(stream),
  });
};

const stopLocal = () => {
  localStream?.getTracks().forEach(track => track.stop());
  localStream = null;
};

/** Opens one track. Phones often allow only one camera at a time → free the old one and retry. */
const openTrack = async (kind: CallDeviceKind, constraints: MediaTrackConstraints) => {
  const request: MediaStreamConstraints =
    kind === 'audioinput'
      ? { audio: constraints, video: false }
      : { audio: false, video: constraints };
  try {
    const fresh = await navigator.mediaDevices.getUserMedia(request);
    return fresh.getTracks()[0];
  } catch (error) {
    if ((error as DOMException)?.name !== 'NotReadableError' || !localStream) throw error;
    localStream.getTracks().forEach(track => {
      if (track.kind === trackKind(kind)) track.stop();
    });
    const fresh = await navigator.mediaDevices.getUserMedia(request);
    return fresh.getTracks()[0];
  }
};

/** Swaps the mic / camera track – locally and in the running peer connection (no renegotiation). */
const replaceLocalTrack = async (track: MediaStreamTrack) => {
  if (!localStream) {
    track.stop();
    return;
  }
  track.enabled = track.kind === 'audio' ? get().micOn : get().camOn;
  const pc = connection?.peerConnection;
  const sender =
    pc?.getSenders().find(item => item.track?.kind === track.kind) ??
    pc?.getTransceivers().find(item => item.receiver.track?.kind === track.kind)?.sender;
  await sender?.replaceTrack(track);
  localStream.getTracks().forEach(old => {
    if (old.kind !== track.kind) return;
    old.stop();
    localStream?.removeTrack(old);
  });
  localStream.addTrack(track);
  watchTrack(track);
  // New object → preview re-renders.
  const stream = new MediaStream(localStream.getTracks());
  localStream = stream;
  set({ localStream: stream, ...deviceState(stream) });
};

let switching = false;

/** Device unplugged (headset, USB camera) → fall back to the system default. */
function watchTrack(track: MediaStreamTrack) {
  const run = generation;
  track.addEventListener('ended', () => {
    if (run !== generation || switching || !localStream?.getTracks().includes(track)) return;
    const kind: CallDeviceKind = track.kind === 'audio' ? 'audioinput' : 'videoinput';
    switching = true;
    const constraints =
      kind === 'audioinput' ? CALL_AUDIO : { ...CALL_VIDEO, facingMode: get().facing };
    openTrack(kind, constraints)
      .then(fresh => (run === generation ? replaceLocalTrack(fresh) : fresh.stop()))
      .then(() => toast(t(kind === 'audioinput' ? 'devices.micLost' : 'devices.cameraLost')))
      .catch(error => console.warn('[call] device fallback failed', error))
      .finally(() => (switching = false));
  });
}

// ---- peer ----------------------------------------------------------------------

const openPeer = async (config: ICallConfigResult) => {
  if (!config.peer) throw new Error('no peer server');
  const { Peer } = await import('peerjs');
  const settings = config.peer;
  return new Promise<Peer>((resolve, reject) => {
    const instance = new Peer(config.peerId, {
      host: CALL_PEER_HOST_OVERRIDE || settings.host || window.location.hostname,
      port: settings.port,
      path: settings.path,
      secure: settings.secure,
      config: {
        iceServers: settings.iceServers ?? [],
        iceTransportPolicy: 'all',
      },
      debug: 1,
    });
    peer = instance;
    let opened = false;
    const timer = window.setTimeout(() => {
      if (opened) return;
      instance.destroy();
      reject(new Error('peer timeout'));
    }, CALL_PEER_OPEN_TIMEOUT_MS);

    instance.on('open', () => {
      opened = true;
      window.clearTimeout(timer);
      resolve(instance);
    });
    instance.on('call', onPeerCall);
    instance.on('disconnected', () => {
      // Signaling socket lost – the media connection keeps running.
      if (!instance.destroyed && get().status === 'active') instance.reconnect();
    });
    instance.on('error', error => {
      if (!opened) {
        window.clearTimeout(timer);
        instance.destroy();
        reject(error);
        return;
      }
      console.warn('[call] peer error', error.type, error);
      if (error.type === 'peer-unavailable' && get().status === 'connecting') {
        void endCall('connection_failed', true);
      }
    });
  });
};

const bindConnection = (conn: MediaConnection) => {
  connection = conn;
  const isCurrent = () => connection === conn;

  conn.on('stream', stream => {
    if (!isCurrent()) return;
    window.clearTimeout(connectTimer);
    set({ remoteStream: stream, status: 'active', startedAt: get().startedAt ?? Date.now() });
  });
  const onEnd = () => {
    if (isCurrent() && get().status !== 'ended') void endCall('disconnected', true);
  };
  conn.on('close', onEnd);
  conn.on('error', onEnd);

  const watchIce = () => {
    const pc = conn.peerConnection;
    pc?.addEventListener('iceconnectionstatechange', () => {
      if (pc.iceConnectionState === 'failed' && isCurrent()) {
        void endCall('connection_failed', true);
      }
    });
  };
  if (conn.peerConnection) watchIce();
  else window.setTimeout(watchIce, 0);

  window.clearTimeout(connectTimer);
  connectTimer = window.setTimeout(() => {
    if (isCurrent() && get().status === 'connecting') void endCall('connection_failed', true);
  }, CALL_CONNECT_TIMEOUT_MS);
};

/** Callee side: the caller dials after `accept`. */
const onPeerCall = (conn: MediaConnection) => {
  const callId = (conn.metadata as { callId?: string } | undefined)?.callId;
  const state = get();
  if (!localStream || callId !== state.callId || state.status !== 'connecting') {
    conn.close();
    return;
  }
  conn.answer(localStream);
  bindConnection(conn);
};

// ---- lifecycle -----------------------------------------------------------------

const teardown = () => {
  window.clearTimeout(connectTimer);
  stopRing();
  void cancelNotification(CALL_NOTIFICATION_ID).catch(() => undefined);
  connection?.close();
  connection = null;
  peer?.destroy();
  peer = null;
  stopLocal();
};

const reset = () => {
  generation += 1;
  window.clearTimeout(endedTimer);
  teardown();
  set({ ...CALL_INITIAL_STATE });
};

/** Reasons that need no "call ended" screen. */
const SILENT_END = new Set<CallEndReason>(['answered_elsewhere']);

/**
 * Ends the call locally. `notify` → tell the runtime (hang up / cancel) so the other side ends too.
 */
const endCall = async (reason: CallEndReason, notify: boolean) => {
  const { callId, status } = get();
  if (status === 'idle' || status === 'ended') return;
  generation += 1;
  teardown();
  if (notify && callId) void callAction('hangup', { callId });
  if (SILENT_END.has(reason)) {
    reset();
    return;
  }
  set({ status: 'ended', endReason: reason, remoteStream: null, localStream: null });
  window.clearTimeout(endedTimer);
  endedTimer = window.setTimeout(() => {
    if (get().status === 'ended') reset();
  }, CALL_ENDED_SCREEN_MS);
};

const sendState = () => {
  const { callId, micOn, camOn, status } = get();
  if (callId && (status === 'active' || status === 'connecting')) {
    void callAction('update', { callId, audio: micOn, video: camOn });
  }
};

// ---- public API ----------------------------------------------------------------

/** Call a friend (`video: false` → voice call). */
export const startCall = async (user: ICallUser, video = true) => {
  if (isCallBusy()) {
    toast.error(t('errors.alreadyInCall'));
    return;
  }
  reset();
  primeRingAudio();
  const run = generation;
  const stale = () => run !== generation;
  set({ status: 'outgoing', direction: 'out', peer: user, video, micOn: true, camOn: video });

  let stream: MediaStream;
  try {
    stream = await getLocalMedia(video, 'user');
  } catch (error) {
    console.warn('[call] media failed', error);
    if (!stale()) void endCall('media_denied', false);
    return;
  }
  if (stale()) return stream.getTracks().forEach(track => track.stop());
  applyLocal(stream);

  const config = await callAction<ICallConfigResult>('config');
  if (stale()) return;
  if (!config.success || !config.data?.peerId) return void endCall('unavailable', false);
  try {
    await openPeer(config.data);
  } catch (error) {
    console.warn('[call] peer failed', error);
    if (!stale()) void endCall('unavailable', false);
    return;
  }
  if (stale()) return;

  const invite = await callAction<ICallInviteResult>('invite', { targetId: user.id, video });
  const callId = invite.data?.callId;
  if (stale()) {
    // Hung up while the invite was on its way.
    if (callId) void callAction('hangup', { callId });
    return;
  }
  if (!invite.success || !callId) {
    console.warn('[call] invite failed', invite.data?.error ?? invite);
    return void endCall(invite.data?.error ?? 'unavailable', false);
  }
  set({
    callId,
    peer: { ...user, ...invite.data?.to, alias: invite.data?.to?.alias || user.alias },
  });
  startRing('outgoing');
};

/** Pick up the ringing call. */
export const acceptCall = async () => {
  const { status, callId, video } = get();
  if (status !== 'incoming' || !callId) return;
  const run = generation;
  const stale = () => run !== generation;
  primeRingAudio();
  stopRing();
  void cancelNotification(CALL_NOTIFICATION_ID).catch(() => undefined);
  set({ status: 'connecting', micOn: true, camOn: video });

  let stream: MediaStream;
  try {
    stream = await getLocalMedia(video, 'user');
  } catch (error) {
    console.warn('[call] media failed', error);
    if (!stale()) {
      void callAction('decline', { callId });
      void endCall('media_denied', false);
    }
    return;
  }
  if (stale()) return stream.getTracks().forEach(track => track.stop());
  applyLocal(stream);

  const config = await callAction<ICallConfigResult>('config');
  if (stale()) return;
  if (!config.success || !config.data?.peerId) return void endCall('unavailable', true);
  try {
    await openPeer(config.data);
  } catch (error) {
    console.warn('[call] peer failed', error);
    if (!stale()) void endCall('unavailable', true);
    return;
  }
  if (stale()) return;

  const result = await callAction<ICallAcceptResult>('accept', { callId });
  if (stale()) return;
  if (!result.success) {
    console.warn('[call] accept failed', result.data?.error ?? result);
    return void endCall(result.data?.error ?? 'unavailable', false);
  }
  window.clearTimeout(connectTimer);
  connectTimer = window.setTimeout(() => {
    if (!stale() && get().status === 'connecting') void endCall('connection_failed', true);
  }, CALL_CONNECT_TIMEOUT_MS);
  sendState();
};

/** Reject the ringing call. */
export const declineCall = () => {
  const { status, callId } = get();
  if (status !== 'incoming') return;
  if (callId) void callAction('decline', { callId });
  reset();
};

/** Hang up (or cancel an outgoing call that still rings). */
export const hangupCall = () => {
  if (get().status === 'incoming') return declineCall();
  void endCall('self', true);
};

/** Close the "call ended" screen right away. */
export const dismissCall = () => {
  if (get().status === 'ended') reset();
};

export const toggleMic = () => {
  const micOn = !get().micOn;
  localStream?.getAudioTracks().forEach(track => (track.enabled = micOn));
  set({ micOn });
  sendState();
};

export const toggleCamera = () => {
  if (!get().hasCamera) return;
  const camOn = !get().camOn;
  localStream?.getVideoTracks().forEach(track => (track.enabled = camOn));
  set({ camOn });
  sendState();
};

/** Front ↔ back camera (phones): new track, replaced in the peer connection. */
export const flipCamera = async () => {
  const { hasCamera, facing } = get();
  if (!hasCamera || !localStream || switching) return;
  const next = facing === 'user' ? 'environment' : 'user';
  const run = generation;
  switching = true;
  try {
    const track = await openTrack('videoinput', { ...CALL_VIDEO, facingMode: { exact: next } });
    if (run !== generation) return track.stop();
    await replaceLocalTrack(track);
    set({ facing: next });
  } catch (error) {
    console.warn('[call] flip failed', error);
    toast.error(t('errors.flip'));
  } finally {
    switching = false;
  }
};

/** Use another microphone / camera – during the call, remembered for the next calls. */
export const selectDevice = async (kind: CallDeviceKind, deviceId: string) => {
  const state = get();
  const current = kind === 'audioinput' ? state.audioDeviceId : state.videoDeviceId;
  if (!localStream || switching || deviceId === current) return;
  if (kind === 'videoinput' && !state.hasCamera) return;
  const run = generation;
  switching = true;
  try {
    const base = kind === 'audioinput' ? CALL_AUDIO : CALL_VIDEO;
    const track = await openTrack(kind, { ...base, deviceId: { exact: deviceId } });
    if (run !== generation) return track.stop();
    await replaceLocalTrack(track);
    writePref(kind, deviceId);
  } catch (error) {
    console.warn('[call] device switch failed', error);
    toast.error(t(kind === 'audioinput' ? 'errors.mic' : 'errors.camera'));
    // The old track may have been freed for the new one – get any working device back.
    if (
      run === generation &&
      localStream &&
      !localStream
        .getTracks()
        .some(track => track.kind === trackKind(kind) && track.readyState === 'live')
    ) {
      const constraints =
        kind === 'audioinput' ? CALL_AUDIO : { ...CALL_VIDEO, facingMode: get().facing };
      await openTrack(kind, constraints)
        .then(replaceLocalTrack)
        .catch(() => undefined);
    }
  } finally {
    switching = false;
  }
};

// ---- runtime events (wired by CallProvider) --------------------------------------

export const callEventHandlers: {
  [E in keyof ICallChannelEvents]: (payload: ICallChannelEvents[E]) => void;
} = {
  'call:incoming': ({ callId, from, video }) => {
    if (isCallBusy()) {
      // Runtime prevents this – just in case (e.g. two tabs of the same user).
      void callAction('decline', { callId });
      return;
    }
    reset();
    set({ status: 'incoming', direction: 'in', callId, peer: from, video: video !== false });
    startRing('incoming');
    if (typeof document !== 'undefined' && document.visibilityState !== 'visible') {
      void showNotification({
        id: CALL_NOTIFICATION_ID,
        title: t(video ? 'notification.video' : 'notification.voice', { name: from.alias }),
        body: t('notification.body'),
        data: { type: 'call.incoming', callId },
        // The ringer makes the sound.
        silent: true,
      }).catch(() => undefined);
    }
  },
  'call:accepted': ({ callId, peerId }) => {
    const state = get();
    if (state.callId !== callId || state.status !== 'outgoing' || !peer || !localStream) return;
    stopRing();
    set({ status: 'connecting' });
    const conn = peer.call(peerId, localStream, { metadata: { callId } });
    if (!conn) return void endCall('connection_failed', true);
    bindConnection(conn);
    sendState();
  },
  'call:ended': ({ callId, reason }) => {
    if (get().callId !== callId) return;
    void endCall(reason, false);
  },
  'call:state': ({ callId, audio, video }) => {
    if (get().callId !== callId) return;
    set({ remoteMicOn: audio !== false, remoteCamOn: video !== false });
  },
};

/** Signed out / provider unmounted → end everything. */
export const shutdownCall = () => {
  const { callId, status } = get();
  if (callId && status !== 'idle' && status !== 'ended') {
    void callAction(status === 'incoming' ? 'decline' : 'hangup', { callId });
  }
  reset();
};
