import { isNativeApp } from '@core/native';

/** Sent with every sign-in → the device list can say "installed app". */
export const clientDevice = () => ({
  ua: typeof navigator !== 'undefined' ? navigator.userAgent : null,
  standalone:
    isNativeApp() ||
    (typeof window !== 'undefined' &&
      (window.matchMedia?.('(display-mode: standalone)').matches ||
        (navigator as Navigator & { standalone?: boolean }).standalone === true)),
});
