/** Wait for a closing drawer / menu (back-button history) before opening the next layer. */
export const NOTIFY_LAYER_DELAY_MS = 320;
/** Page size of the inbox (backend max. 50). */
export const NOTIFY_PAGE_SIZE = 20;
/** Fallback refresh of the counters (the websocket keeps them live in between). */
export const NOTIFY_STATE_INTERVAL_MS = 120_000;
/** Undo window for deleting a notification before it hits the backend. */
export const NOTIFY_UNDO_MS = 5_000;
/** Live toast of an incoming notification. */
export const NOTIFY_TOAST_MS = 6_000;

/**
 * Websocket events of the runtime (`shared/user/services/notify/types.ts` → USER_NOTIFY_EVENTS).
 */
export const NOTIFY_EVENTS = {
  incoming: 'user::incoming:flash_notify',
  remove: 'user::remove:notify',
  state: 'user::update:notify_state',
} as const;
