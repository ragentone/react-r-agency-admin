import { isNativeApp, showNotification } from '@core/native';
import { getRegistration } from '@core/push/push.ts';

import type { IMessengerMessage, IMessengerUser } from './types.ts';

/** Data of messenger notifications (push from the runtime uses the same shape). */
export interface IMessengerNotificationData {
  type: 'messenger';
  peerId: string;
  alias?: string;
  avatarUrl?: string | null;
}

export const isMessengerNotification = (data: unknown): data is IMessengerNotificationData =>
  !!data &&
  typeof data === 'object' &&
  (data as { type?: unknown }).type === 'messenger' &&
  typeof (data as { peerId?: unknown }).peerId === 'string';

/** Stable numeric id per chat → a new message replaces the previous notification (native). */
const idOf = (peerId: string) => {
  let hash = 0;
  for (const char of peerId) hash = (hash * 31 + char.charCodeAt(0)) | 0;
  return 74_000_000 + (Math.abs(hash) % 1_000_000);
};

/**
 * App in the background but still connected (tab hidden, app paused): the runtime doesn't send
 * a push then – show the system notification ourselves (service worker → tap = `push:click`).
 */
export const notifyIncomingMessage = async (peer: IMessengerUser, message: IMessengerMessage) => {
  const title = peer.alias ? `@${peer.alias}` : 'Messenger';
  const data: IMessengerNotificationData = {
    type: 'messenger',
    peerId: peer.id,
    alias: peer.alias,
    avatarUrl: peer.avatarUrl,
  };
  try {
    if (isNativeApp()) {
      await showNotification({
        id: idOf(peer.id),
        title,
        body: message.body,
        data,
        group: 'messenger',
      });
      return;
    }
    if (typeof Notification === 'undefined' || Notification.permission !== 'granted') return;
    const registration = await getRegistration();
    if (registration) {
      await registration.showNotification(title, {
        body: message.body,
        tag: `messenger:${peer.id}`,
        icon: '/android-chrome-192x192.png',
        badge: '/favicon-32x32.png',
        data: { url: `/?messenger=${encodeURIComponent(peer.id)}`, data },
      });
      return;
    }
    await showNotification({ title, body: message.body, data });
  } catch (error) {
    console.warn('[messenger] notification failed', error);
  }
};
