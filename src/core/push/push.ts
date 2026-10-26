import { isNativeApp } from '@core/native';
import { create } from 'zustand';

import { pushAction } from './api';
import { PUSH_OPT_OUT_KEY, PUSH_SW_TIMEOUT_MS } from './const';
import type { PushStatus } from './types';

const storage = {
  get: (key: string) => {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  set: (key: string, value: string | null) => {
    try {
      if (value === null) localStorage.removeItem(key);
      else localStorage.setItem(key, value);
    } catch {
      /* storage blocked */
    }
  },
};

export const pushStorage = storage;

/** Push API available? (Not inside the Flutter app – it needs FCM / APNs.) */
export const isPushSupported = () =>
  typeof window !== 'undefined' &&
  !isNativeApp() &&
  'serviceWorker' in navigator &&
  'PushManager' in window &&
  typeof Notification !== 'undefined';

/** Registration of the app's service worker – null when there is none (dev server). */
export const getRegistration = async (): Promise<ServiceWorkerRegistration | null> => {
  if (!('serviceWorker' in navigator)) return null;
  const existing = await navigator.serviceWorker.getRegistration();
  if (existing?.active) return existing;
  return Promise.race([
    navigator.serviceWorker.ready,
    new Promise<null>(resolve => window.setTimeout(() => resolve(null), PUSH_SW_TIMEOUT_MS)),
  ]);
};

const toKey = (base64url: string) => {
  const padded = `${base64url}${'='.repeat((4 - (base64url.length % 4)) % 4)}`
    .replace(/-/g, '+')
    .replace(/_/g, '/');
  const raw = atob(padded);
  return Uint8Array.from(raw, char => char.charCodeAt(0));
};

const sameKey = (subscription: PushSubscription, key: Uint8Array) => {
  const current = subscription.options.applicationServerKey;
  if (!current) return false;
  const bytes = new Uint8Array(current);
  return bytes.length === key.length && bytes.every((b, i) => b === key[i]);
};

let publicKey: string | null | undefined;

const loadPublicKey = async () => {
  if (publicKey !== undefined) return publicKey;
  const result = await pushAction<{ enabled?: boolean; publicKey?: string | null }>('config');
  if (!result.success) return null; // try again next time
  publicKey = result.data?.enabled ? (result.data.publicKey ?? null) : null;
  return publicKey;
};

interface IPushStore {
  status: PushStatus;
  busy: boolean;
  /** Reads permission + subscription; re-sends an existing subscription to the runtime. */
  sync: () => Promise<void>;
  /** Asks for permission (needs a user gesture) and subscribes this device. */
  enable: () => Promise<PushStatus>;
  /** Unsubscribes this device (stays off until enabled again). */
  disable: () => Promise<void>;
  /** Sign-out: the browser subscription is dropped (the runtime removes it on the next push). */
  reset: () => Promise<void>;
}

export const usePushStore = create<IPushStore>((set, get) => {
  const finish = (status: PushStatus) => {
    set({ status, busy: false });
    return status;
  };

  const subscribe = async (registration: ServiceWorkerRegistration, key: string) => {
    const applicationServerKey = toKey(key);
    let subscription = await registration.pushManager.getSubscription();
    // Runtime got new VAPID keys → the old subscription can't be used anymore.
    if (subscription && !sameKey(subscription, applicationServerKey)) {
      await subscription.unsubscribe().catch(() => undefined);
      subscription = null;
    }
    subscription ??= await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey,
    });
    const result = await pushAction('subscribe', { subscription: subscription.toJSON() });
    return result.success;
  };

  return {
    status: 'unknown',
    busy: false,

    async sync() {
      if (!isPushSupported()) return set({ status: 'unsupported' });
      const registration = await getRegistration();
      if (!registration) return set({ status: 'unsupported' });
      const key = await loadPublicKey();
      if (!key) return set({ status: 'disabled' });
      const permission = Notification.permission;
      if (permission !== 'granted')
        return set({ status: permission === 'denied' ? 'denied' : 'default' });
      if (storage.get(PUSH_OPT_OUT_KEY) === '1') return set({ status: 'off' });
      try {
        // Allowed and not opted out → (re-)subscribe, so the runtime knows this device for
        // the signed-in user (also after switching accounts).
        set({ status: (await subscribe(registration, key)) ? 'on' : 'off' });
      } catch (error) {
        console.warn('[push] sync failed', error);
        set({ status: 'off' });
      }
    },

    async enable() {
      if (get().busy) return get().status;
      if (!isPushSupported()) {
        set({ status: 'unsupported' });
        return 'unsupported';
      }
      set({ busy: true });
      try {
        const registration = await getRegistration();
        const key = await loadPublicKey();
        if (!registration) return finish('unsupported');
        if (!key) return finish('disabled');
        const permission = await Notification.requestPermission();
        if (permission !== 'granted') return finish(permission === 'denied' ? 'denied' : 'default');
        storage.set(PUSH_OPT_OUT_KEY, null);
        return finish((await subscribe(registration, key)) ? 'on' : 'off');
      } catch (error) {
        console.warn('[push] enable failed', error);
        return finish('off');
      }
    },

    async disable() {
      set({ busy: true });
      storage.set(PUSH_OPT_OUT_KEY, '1');
      try {
        const registration = await getRegistration();
        const subscription = await registration?.pushManager.getSubscription();
        if (subscription) {
          await pushAction('unsubscribe', { endpoint: subscription.endpoint });
          await subscription.unsubscribe().catch(() => undefined);
        }
      } finally {
        set({ busy: false, status: Notification.permission === 'granted' ? 'off' : get().status });
      }
    },

    async reset() {
      if (!isPushSupported()) return;
      const registration = await getRegistration();
      const subscription = await registration?.pushManager.getSubscription();
      await subscription?.unsubscribe().catch(() => undefined);
      set({ status: 'unknown' });
    },
  };
});
