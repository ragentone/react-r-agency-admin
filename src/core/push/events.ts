import { PUSH_CLICK_EVENT } from './const';
import type { IPushClick } from './types';

/** Tap on a push notification while the app was open (service worker → app). */
export const onPushClick = (fn: (click: IPushClick) => void) => {
  const listener = (event: Event) => fn((event as CustomEvent<IPushClick>).detail);
  window.addEventListener(PUSH_CLICK_EVENT, listener);
  return () => window.removeEventListener(PUSH_CLICK_EVENT, listener);
};
