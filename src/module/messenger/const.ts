/** Websocket action without response → treat as failed. */
export const MESSENGER_ACTION_TIMEOUT_MS = 10_000;
export const MESSENGER_MAX_LENGTH = 2000;
export const MESSENGER_PAGE_SIZE = 30;
/** Send `typing: true` at most this often while typing … */
export const MESSENGER_TYPING_THROTTLE_MS = 3_000;
/** … and `typing: false` after this pause. */
export const MESSENGER_TYPING_IDLE_MS = 4_000;
/** The other side's indicator disappears when no update came in for this long. */
export const MESSENGER_TYPING_TTL_MS = 6_000;
/** New bubble group / time separator after this gap. */
export const MESSENGER_GROUP_GAP_MS = 60_000;
export const MESSENGER_TIME_GAP_MS = 15 * 60_000;
/** Delay after closing another drawer before the messenger opens (back-button history). */
export const MESSENGER_LAYER_DELAY_MS = 320;
/** "Like" button (empty composer) sends this. */
export const MESSENGER_LIKE = '👍';

/** Facebook Messenger look. */
export const MESSENGER_PRIMARY_COLOR = '#212527';
export const MESSENGER_ONLINE = '#31a24c';
export const MESSENGER_USER_ROLE = ['messenger:user'];
