/** Wallet page of the signed-in user. */
export const CREDITS_ROUTE = '/credits';
/** Public leaderboard (the three richest users). */
export const CREDITS_TOP_ROUTE = '/credits/top';
/** Admin area (`admin:user`). */
export const CREDITS_ADMIN_ROUTE = '/admin/credits';
export const CREDITS_ADMIN_ROLES = 'super:admin:user';

/** Websocket action without response → treat as failed. */
export const CREDITS_ACTION_TIMEOUT_MS = 10_000;
export const CREDITS_PAGE_SIZE = 30;
/** Same as the runtime `CREDITS_LIMITS.note`. */
export const CREDITS_NOTE_MAX = 140;
/** Preset amounts of the tip sheet. */
export const CREDITS_TIP_PRESETS = [1, 5, 10, 25];
/** Delay after closing a menu before a sheet opens (back-button history). */
export const CREDITS_LAYER_DELAY_MS = 320;
