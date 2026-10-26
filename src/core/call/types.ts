/** Other side of a call (runtime `ICallUser`). */
export interface ICallUser {
  id: string;
  alias: string;
  avatarUrl: string | null;
}

export type CallStatus =
  /** No call. */
  | 'idle'
  /** I'm calling, the other side rings. */
  | 'outgoing'
  /** Someone calls me, I ring. */
  | 'incoming'
  /** Accepted – PeerJS connection is being set up. */
  | 'connecting'
  /** Media flows. */
  | 'active'
  /** Short "call ended" screen. */
  | 'ended';

/** Reasons from the runtime (`call:ended`). */
export type CallRemoteEndReason =
  'declined' | 'canceled' | 'missed' | 'hangup' | 'disconnected' | 'answered_elsewhere';

/** Errors from `invite` / `accept` (runtime). */
export type CallInviteError =
  | 'unauthorized'
  | 'invalid_target'
  | 'not_friends'
  | 'offline'
  | 'busy'
  | 'no_peer'
  | 'rate_limited'
  | 'not_found'
  | 'handled';

/** Local reasons. */
export type CallLocalEndReason = 'self' | 'media_denied' | 'unavailable' | 'connection_failed';

export type CallEndReason = CallRemoteEndReason | CallInviteError | CallLocalEndReason;

export interface ICallPeerConfig {
  host: string | null;
  port: number;
  path: string;
  secure: boolean;
  iceServers?: RTCIceServer[];
}

export interface ICallConfigResult {
  peer: ICallPeerConfig | null;
  peerId: string;
}

export interface ICallInviteResult {
  success: boolean;
  error?: CallInviteError;
  callId?: string;
  to?: ICallUser;
}

export interface ICallAcceptResult {
  success: boolean;
  error?: CallInviteError;
  callId?: string;
  peerId?: string;
}

/** Events on the `call` channel (runtime apps/call). */
export interface ICallChannelEvents {
  'call:incoming': { callId: string; from: ICallUser; video: boolean };
  'call:accepted': { callId: string; peerId: string };
  'call:ended': { callId: string; reason: CallRemoteEndReason };
  'call:state': { callId: string; audio: boolean; video: boolean };
}

export type CallAction = 'config' | 'invite' | 'accept' | 'decline' | 'hangup' | 'update';

/** Selectable input devices (`MediaDeviceInfo.kind`). */
export type CallDeviceKind = 'audioinput' | 'videoinput';
