import { useEffect, useRef } from 'react';

import { callNative, isNativeApp, NativeBridgeError, onNativeEvent } from './bridge';
import type { INativeNotification, INativeNotificationTap } from './types';

const WEB_TAP_EVENT = 'r-agency-notification-tap';

export type NotificationPermissionResult = 'granted' | 'denied' | 'unsupported';

export const requestNotificationPermission = async (): Promise<NotificationPermissionResult> => {
  if (isNativeApp()) {
    const { granted } = await callNative('notifications.requestPermission');
    return granted ? 'granted' : 'denied';
  }
  if (typeof Notification === 'undefined') return 'unsupported';
  const result = await Notification.requestPermission();
  return result === 'granted' ? 'granted' : 'denied';
};

export const showNotification = async (
  notification: INativeNotification
): Promise<number | null> => {
  if (isNativeApp()) {
    try {
      const { id } = await callNative('notifications.show', notification);
      return id;
    } catch (err) {
      if (err instanceof NativeBridgeError && err.code === 'PERMISSION_DENIED') return null;
      throw err;
    }
  }

  if (typeof Notification === 'undefined') return null;
  if (Notification.permission === 'default') await Notification.requestPermission();
  if (Notification.permission !== 'granted') return null;

  const id = notification.id ?? Date.now() % 2 ** 31;
  const web = new Notification(notification.title, {
    body: notification.body,
    silent: notification.silent,
    tag: String(id),
    data: notification.data,
  });
  web.onclick = () => {
    window.focus();
    window.dispatchEvent(
      new CustomEvent<INativeNotificationTap>(WEB_TAP_EVENT, {
        detail: { id, data: notification.data ?? null },
      })
    );
    web.close();
  };
  return id;
};

export const cancelNotification = async (id: number): Promise<void> => {
  if (isNativeApp()) await callNative('notifications.cancel', { id });
};

export const cancelAllNotifications = async (): Promise<void> => {
  if (isNativeApp()) await callNative('notifications.cancelAll');
};

let launchTap: Promise<INativeNotificationTap | null> | null = null;
const takeLaunchTapOnce = () =>
  (launchTap ??= callNative('notifications.takeLaunchTap')
    .then(tap => tap ?? null)
    .catch(() => null));

export const useNotificationTap = (callback: (tap: INativeNotificationTap) => void): void => {
  const ref = useRef(callback);

  useEffect(() => {
    ref.current = callback;
  }, [callback]);

  useEffect(() => {
    const handle = (tap: INativeNotificationTap) => ref.current(tap);

    if (!isNativeApp()) {
      const listener = (e: Event) => handle((e as CustomEvent<INativeNotificationTap>).detail);
      window.addEventListener(WEB_TAP_EVENT, listener);
      return () => window.removeEventListener(WEB_TAP_EVENT, listener);
    }

    let active = true;
    void takeLaunchTapOnce().then(tap => {
      if (active && tap) handle(tap);
    });
    const off = onNativeEvent('notification.tap', handle);
    return () => {
      active = false;
      off();
    };
  }, []);
};
