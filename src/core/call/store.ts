import { create } from 'zustand';

import type { CallEndReason, CallStatus, ICallUser } from './types';

export interface ICallState {
  status: CallStatus;
  /** Who started the call. */
  direction: 'in' | 'out' | null;
  callId: string | null;
  peer: ICallUser | null;
  /** Video call (otherwise voice only). */
  video: boolean;
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  micOn: boolean;
  camOn: boolean;
  /** The local stream has a camera track (camera can be toggled / flipped). */
  hasCamera: boolean;
  facing: 'user' | 'environment';
  /** Device ids of the mic / camera in use (device picker). */
  audioDeviceId: string | null;
  videoDeviceId: string | null;
  /** Mic / camera flags of the other side (`call:state`). */
  remoteMicOn: boolean;
  remoteCamOn: boolean;
  /** When media started flowing (call timer). */
  startedAt: number | null;
  endReason: CallEndReason | null;
}

export const CALL_INITIAL_STATE: ICallState = {
  status: 'idle',
  direction: null,
  callId: null,
  peer: null,
  video: true,
  localStream: null,
  remoteStream: null,
  micOn: true,
  camOn: true,
  hasCamera: false,
  facing: 'user',
  audioDeviceId: null,
  videoDeviceId: null,
  remoteMicOn: true,
  remoteCamOn: true,
  startedAt: null,
  endReason: null,
};

/** State of the current call – written only by `call.engine.ts`. */
export const useCallStore = create<ICallState>(() => ({ ...CALL_INITIAL_STATE }));

/** A call is running or ringing (new calls are refused). */
export const isCallBusy = () => {
  const status = useCallStore.getState().status;
  return status !== 'idle' && status !== 'ended';
};
