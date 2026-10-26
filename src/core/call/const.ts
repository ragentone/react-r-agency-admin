/** 1:1 calls between friends – media P2P over PeerJS, signaling: runtime apps/call (ws `call`). */

export const CALL_PEER_OPEN_TIMEOUT_MS = 10_000;
/** Accepted, but no remote stream after this time → give up. */
export const CALL_CONNECT_TIMEOUT_MS = 20_000;
/** Websocket action without response → treat as failed. */
export const CALL_ACTION_TIMEOUT_MS = 10_000;
/** How long the "call ended" screen stays before the overlay closes. */
export const CALL_ENDED_SCREEN_MS = 1_800;
/** Fixed id → the incoming-call notification can be removed again. */
export const CALL_NOTIFICATION_ID = 73_100;
/** localStorage – last chosen mic / camera. */
export const CALL_DEVICES_STORAGE_KEY = 'call.devices';
/** Optional override of the peer server host sent by the runtime (same as Meet). */
export const CALL_PEER_HOST_OVERRIDE: string | undefined = import.meta.env.VITE_PEER_SERVER_HOST;

export const CALL_AUDIO: MediaTrackConstraints = {
  echoCancellation: true,
  noiseSuppression: true,
  autoGainControl: true,
};

export const CALL_VIDEO: MediaTrackConstraints = {
  width: { ideal: 1280 },
  height: { ideal: 720 },
  frameRate: { ideal: 24, max: 30 },
};
