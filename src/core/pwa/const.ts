/** Install hint: shown after this delay on a page view … */
export const PWA_INSTALL_PROMPT_DELAY_MS = 25_000;
/** … and not again for this long after "Not now". */
export const PWA_INSTALL_DISMISS_DAYS = 14;
/** Check for a new service worker version this often. */
export const PWA_UPDATE_INTERVAL_MS = 60 * 60 * 1000;

export const PWA_STORAGE_DISMISSED = 'pwa:install-dismissed-at';

/** Websocket channel of the runtime `system` broadcast (`version` after a frontend build). */
export const PWA_LIVE_CHANNEL = 'system';
/** Spread the service worker checks of all clients over this window after a new version. */
export const PWA_VERSION_JITTER_MS = 20_000;
/** Second check if the first one found nothing yet (service worker still being written). */
export const PWA_VERSION_RECHECK_MS = 60_000;

/** Missing lazy chunk after a deploy: reload at most once in this window (no reload loop). */
export const PWA_PRELOAD_RELOAD_GAP_MS = 60_000;
export const PWA_STORAGE_PRELOAD_RELOAD = 'pwa:preload-reload-at';
/** Ask the runtime for the live build at most this often when the tab comes back. */
export const PWA_VERSION_ASK_GAP_MS = 60_000;

/** Toast id: "update on its way" → replaced by "new version" (one toast per tab). */
export const PWA_DEPLOY_TOAST_ID = 'pwa-deploy';
/** "Update on its way" closes itself after this long without a new version (failed build). */
export const PWA_DEPLOY_TOAST_MAX_MS = 15 * 60 * 1000;
/** After `version`: wait this long for the new service worker before giving up on the toast. */
export const PWA_DEPLOY_READY_MAX_MS = 2 * 60 * 1000;

/** Required update: reload by itself after this long … */
export const PWA_REQUIRED_RELOAD_MS = 60_000;
/** … and, while something is being edited, try again this often. */
export const PWA_REQUIRED_RETRY_MS = 15_000;
/** Last version this browser has seen ("What's new" once per version). */
export const PWA_STORAGE_SEEN_VERSION = 'pwa:seen-version';
