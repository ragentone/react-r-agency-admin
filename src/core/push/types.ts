/** Web Push – backend: runtime src/shared/push (ws `push`), service worker: public/push-sw.js. */

/**
 * - `unsupported`: no service worker / Push API (dev server, native app, old browser)
 * - `disabled`: runtime has no VAPID keys
 * - `default` | `denied`: browser permission
 * - `off`: allowed, but this device is not subscribed (user turned it off)
 * - `on`: subscribed
 */
export type PushStatus =
  'unknown' | 'unsupported' | 'disabled' | 'default' | 'denied' | 'off' | 'on';

/** What the service worker sends to the app on a notification tap. */
export interface IPushClick {
  url: string;
  data: Record<string, unknown> | null;
}
