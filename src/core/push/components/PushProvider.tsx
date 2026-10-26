import { useMeshState } from '@core/mesh';
import { type ReactNode, useEffect, useRef } from 'react';

import { useAuth } from '../../auth/components/use.auth.ts';
import { PUSH_CLICK_EVENT } from '../const';
import { usePushStore } from '../push';
import type { IPushClick } from '../types';

/**
 * Keeps this device's push subscription in sync with the signed-in user and forwards taps on
 * notifications (service worker → `push:click`) as a window event (`onPushClick`).
 */
export const PushProvider = ({ children }: { children: ReactNode }) => {
  const { authorized, userMeta } = useAuth();
  const userId = authorized ? (userMeta?.id ?? null) : null;
  const { connected } = useMeshState();
  const lastUser = useRef<string | null>(null);

  useEffect(() => {
    if (userId && connected) void usePushStore.getState().sync();
    // Signed out → this browser must not get the last user's notifications anymore.
    if (!userId && lastUser.current) void usePushStore.getState().reset();
    lastUser.current = userId;
  }, [userId, connected]);

  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;
    const onMessage = (event: MessageEvent) => {
      const message = event.data as ({ type?: string } & IPushClick) | null;
      if (message?.type !== 'push:click') return;
      window.dispatchEvent(
        new CustomEvent<IPushClick>(PUSH_CLICK_EVENT, {
          detail: { url: message.url, data: message.data ?? null },
        })
      );
    };
    navigator.serviceWorker.addEventListener('message', onMessage);
    return () => navigator.serviceWorker.removeEventListener('message', onMessage);
  }, []);

  return <>{children}</>;
};
