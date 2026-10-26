import {
  callNative,
  cancelNotification,
  isNativeApp,
  requestNotificationPermission,
  showNotification,
} from '@core/native';
import { create } from 'zustand';

/**
 * System notifications + app icon badge for the notification center.
 *
 * - Flutter app (`isNativeApp()`): native notifications + badge through the bridge
 *   (flutter-app `lib/notifications.dart`, `lib/app_badge.dart`).
 * - Browser: Web Notifications API (fallback inside `showNotification`) + Badging API (PWA).
 *
 * Only after the user switched them on in the drawer – no permission prompt out of nowhere.
 */

/** `data.type` of our system notifications (tap → `useNotificationTap`). */
export const NOTIFY_SYSTEM_TYPE = 'user.notify';
/** Android `groupKey` / iOS + macOS thread – bundles all notifications of the inbox. */
const GROUP = 'user-notify';
const STORAGE_KEY = 'notify:system';

type SystemSetting = 'on' | 'off' | 'dismissed';

const readSetting = (): SystemSetting => {
  try {
    const value = window.localStorage.getItem(STORAGE_KEY);
    return value === 'on' || value === 'dismissed' ? value : 'off';
  } catch {
    return 'off';
  }
};

const writeSetting = (value: SystemSetting) => {
  try {
    window.localStorage.setItem(STORAGE_KEY, value);
  } catch {
    // Private mode etc. – the setting only lasts for this page load.
  }
};

/** Can this client show system notifications at all? */
const supported = () => isNativeApp() || typeof Notification !== 'undefined';

/** Browser: permission withdrawn in the browser settings → treat as off. */
const permitted = () =>
  isNativeApp() || (typeof Notification !== 'undefined' && Notification.permission === 'granted');

interface ISystemNotifyStore {
  setting: SystemSetting;
  /** Permission was refused (browser / OS) – the banner explains how to change it. */
  denied: boolean;
  enable: () => Promise<boolean>;
  dismiss: () => void;
}

export const useSystemNotifyStore = create<ISystemNotifyStore>(set => ({
  setting: typeof window === 'undefined' ? 'off' : readSetting(),
  denied:
    typeof Notification !== 'undefined' && !isNativeApp() && Notification.permission === 'denied',
  async enable() {
    let result: Awaited<ReturnType<typeof requestNotificationPermission>> = 'unsupported';
    try {
      result = await requestNotificationPermission();
    } catch (error) {
      console.warn('[notify] permission failed', error);
    }
    if (result === 'granted') {
      writeSetting('on');
      set({ setting: 'on', denied: false });
      return true;
    }
    set({ denied: result === 'denied' });
    return false;
  },
  dismiss() {
    writeSetting('dismissed');
    set({ setting: 'dismissed' });
  },
}));

/** State for the drawer banner ("get notifications on this device"). */
export const useSystemNotify = () => {
  const setting = useSystemNotifyStore(state => state.setting);
  const denied = useSystemNotifyStore(state => state.denied);
  const enabled = setting === 'on' && permitted();
  return {
    supported: supported(),
    enabled,
    denied,
    /** Show the banner: supported, not on, not dismissed. */
    offer: supported() && !enabled && setting !== 'dismissed',
    enable: useSystemNotifyStore.getState().enable,
    dismiss: useSystemNotifyStore.getState().dismiss,
  };
};

/** Stable 31-bit id per notification (FNV-1a) – the same id cancels it again. */
export const systemNotifyId = (notifyId: string) => {
  let hash = 0x811c9dc5;
  for (let i = 0; i < notifyId.length; i += 1) {
    hash ^= notifyId.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  // Keep clear of small fixed ids used elsewhere (e.g. the call notification).
  return ((hash >>> 1) % 2_000_000_000) + 100_000;
};

/** Ids shown during this page load – cancelled when read / deleted. */
const shown = new Map<string, number>();

/**
 * Shows a system notification for a new inbox entry – only when switched on and the app is
 * not in the foreground (in the foreground the in-app popup is enough).
 */
export const showSystemNotify = async (notifyId: string, title: string, body?: string) => {
  if (useSystemNotifyStore.getState().setting !== 'on' || !permitted()) return;
  if (typeof document !== 'undefined' && document.visibilityState === 'visible') return;
  const id = systemNotifyId(notifyId);
  try {
    const shownId = await showNotification({
      id,
      title,
      body: body || undefined,
      group: GROUP,
      data: { type: NOTIFY_SYSTEM_TYPE, notifyId },
    });
    if (shownId !== null) shown.set(notifyId, shownId);
  } catch (error) {
    console.warn('[notify] system notification failed', error);
  }
};

/** Removes system notifications (read / deleted, also on another device). No ids → all. */
export const cancelSystemNotify = (notifyIds?: string[]) => {
  if (!isNativeApp()) return;
  const ids = notifyIds ?? [...shown.keys()];
  ids.forEach(notifyId => {
    const id = shown.get(notifyId) ?? systemNotifyId(notifyId);
    shown.delete(notifyId);
    void cancelNotification(id).catch(() => undefined);
  });
};

type BadgeNavigator = Navigator & {
  setAppBadge?: (count?: number) => Promise<void>;
  clearAppBadge?: () => Promise<void>;
};

let lastBadge = -1;

/** Unread counter on the app icon: Flutter bridge (iOS / macOS) or Badging API (PWA). */
export const setAppBadge = (count: number) => {
  const value = Math.max(0, count);
  if (value === lastBadge) return;
  lastBadge = value;

  if (isNativeApp()) {
    // Older app builds don't know the method → ignore.
    void callNative('app.setBadge', { count: value }).catch(() => undefined);
    return;
  }
  const nav = navigator as BadgeNavigator;
  try {
    if (value > 0) void nav.setAppBadge?.(value)?.catch(() => undefined);
    else void nav.clearAppBadge?.()?.catch(() => undefined);
  } catch {
    // Not supported.
  }
};
