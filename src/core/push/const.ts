/** localStorage: the user turned push off on this device → don't re-subscribe automatically. */
export const PUSH_OPT_OUT_KEY = 'push.optOut';
/** localStorage: the hint in the messenger was dismissed. */
export const PUSH_HINT_DISMISSED_KEY = 'push.hintDismissed';
/** Window event with the tapped notification (`IPushClick`). */
export const PUSH_CLICK_EVENT = 'r-agency-push-click';
export const PUSH_ACTION_TIMEOUT_MS = 10_000;
/** Service worker registration is only waited for this long (not registered in dev). */
export const PUSH_SW_TIMEOUT_MS = 4_000;
