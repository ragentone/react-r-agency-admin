/** Wait for a closing drawer / menu (back-button history) before opening the next layer. */
export const FRIENDS_LAYER_DELAY_MS = 320;
/** Page size of the relation lists (backend max. 25). */
export const FRIENDS_PAGE_SIZE = 20;
/** How often the open request counter (menu badge) is refreshed. */
export const FRIENDS_COUNT_INTERVAL_MS = 60_000;
/** Undo window for reversible actions (decline, withdraw, remove) before they hit the backend. */
export const FRIENDS_UNDO_MS = 5_000;
/** Coalesce reloads after quick consecutive actions (e.g. accepting several requests). */
export const FRIENDS_RELOAD_DEBOUNCE_MS = 400;
/** After a tab switch the list waits this long (skeleton visible) – no flicker on fast taps. */
export const FRIENDS_TAB_DELAY_MS = 250;
