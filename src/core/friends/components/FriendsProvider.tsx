import { getMeshClient } from 'r-agency-mesh-client-v1/release';
import { type ReactNode, useEffect } from 'react';

import { useAuth } from '../../auth/components/use.auth.ts';
import { FRIENDS_COUNT_INTERVAL_MS, FRIENDS_RELOAD_DEBOUNCE_MS } from '../const';
import { useFriendsStore } from '../store';
import type { IFriendsLiveEvents } from '../types';
import { emitFriendPresence, emitFriendsChanged, onFriendsChanged } from '../utils';
import { FriendsDrawer } from './FriendsDrawer';

/** Keeps the friend counters (menu badge, sections) fresh while signed in + renders the drawer. */
export const FriendsProvider = ({ children }: { children: ReactNode }) => {
  const { authorized, userMeta } = useAuth();
  const signedIn = Boolean(authorized && userMeta?.id);

  useEffect(() => {
    const { refreshCounts, clear } = useFriendsStore.getState();
    if (!signedIn) {
      clear();
      useFriendsStore.getState().closeDrawer();
      return;
    }
    void refreshCounts();
    const refreshIfVisible = () => {
      if (document.visibilityState === 'visible') void refreshCounts();
    };
    const timer = window.setInterval(refreshIfVisible, FRIENDS_COUNT_INTERVAL_MS);
    // Back in the app (tab / PWA resumed) → don't wait for the next interval.
    document.addEventListener('visibilitychange', refreshIfVisible);
    // Counters were changed optimistically – confirm them once the burst of actions is over.
    let debounce = 0;
    const off = onFriendsChanged(() => {
      window.clearTimeout(debounce);
      debounce = window.setTimeout(() => void refreshCounts(), FRIENDS_RELOAD_DEBOUNCE_MS);
    });
    // Live updates from the runtime: relation changed (other user / own other device) → lists,
    // buttons and counters reload in the background; presence → only the online dot.
    const channel = getMeshClient().websocket.channel<IFriendsLiveEvents>('user_relation');
    const offLive = [
      channel.on('relation:changed', ({ payload }) => {
        if (payload?.userId) emitFriendsChanged({ userId: payload.userId });
      }),
      channel.on('relation:presence', ({ payload }) => {
        if (payload?.userId) emitFriendPresence(payload);
      }),
    ];
    return () => {
      window.clearInterval(timer);
      window.clearTimeout(debounce);
      document.removeEventListener('visibilitychange', refreshIfVisible);
      off();
      offLive.forEach(offEvent => offEvent());
    };
  }, [signedIn]);

  return (
    <>
      {children}
      {signedIn && <FriendsDrawer />}
    </>
  );
};
