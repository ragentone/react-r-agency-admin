import { useSyncExternalStore } from 'react';

export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    onChange => {
      const list = window.matchMedia(query);
      list.addEventListener('change', onChange);
      return () => list.removeEventListener('change', onChange);
    },
    () => window.matchMedia(query).matches,
    () => false
  );
}

/** Phone-sized viewport: pickers open as bottom sheets. */
export const MOBILE_QUERY = '(max-width: 639px)';
/** Touch is the primary input (phones, tablets). */
export const TOUCH_QUERY = '(pointer: coarse)';

export const useIsMobile = () => useMediaQuery(MOBILE_QUERY);
export const useIsTouch = () => useMediaQuery(TOUCH_QUERY);
