/* eslint-disable */
// Web Push handler – loaded into the generated service worker (vite.config.ts → workbox.importScripts).
// Payload from the runtime (src/shared/push): { title, body, tag, url, icon, data }.
// Tap: focuses an open app window and tells it what to open (`push:click`), or opens `url`.

const APP_ICON = '/android-chrome-192x192.png';
const BADGE_ICON = '/favicon-32x32.png';

self.addEventListener('push', event => {
  let payload = {};
  try {
    payload = event.data ? event.data.json() : {};
  } catch (error) {
    payload = { title: event.data ? event.data.text() : '' };
  }
  const title = payload.title || 'r-agency';
  const icon = payload.icon && /^https?:\/\//.test(payload.icon) ? payload.icon : APP_ICON;

  event.waitUntil(
    (async () => {
      // App open and visible → it shows its own hint, no system notification needed.
      const windows = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
      if (windows.some(client => client.visibilityState === 'visible' && client.focused)) return;
      await self.registration.showNotification(title, {
        body: payload.body || '',
        tag: payload.tag || undefined,
        renotify: Boolean(payload.tag),
        icon,
        badge: BADGE_ICON,
        timestamp: Date.now(),
        data: { url: payload.url || '/', data: payload.data || null },
      });
    })()
  );
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  const info = event.notification.data || {};
  const url = new URL(info.url || '/', self.location.origin).href;

  event.waitUntil(
    (async () => {
      const windows = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
      const client =
        windows.find(c => new URL(c.url).origin === self.location.origin && c.focused) ||
        windows.find(c => new URL(c.url).origin === self.location.origin);
      if (client) {
        await client.focus();
        client.postMessage({ type: 'push:click', url: info.url || '/', data: info.data || null });
        return;
      }
      await self.clients.openWindow(url);
    })()
  );
});

// Browser renewed the subscription (keys rotated) → the app re-subscribes on its next start.
self.addEventListener('pushsubscriptionchange', () => undefined);
