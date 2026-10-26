import { useFriendsStore } from '@core/friends/store';
import { type ReactNode, useEffect } from 'react';

import { useAuth } from '../../auth/components/use.auth.ts';
import { callChannel } from '../api';
import { callEventHandlers, shutdownCall } from '../call.engine';
import { useCallStore } from '../store';
import type { ICallChannelEvents } from '../types';
import { CallOverlay } from './CallOverlay';

const EVENTS = Object.keys(callEventHandlers) as (keyof ICallChannelEvents)[];

/** Listens for calls while signed in + renders the call screen. */
export const CallProvider = ({ children }: { children: ReactNode }) => {
  const { authorized, userMeta } = useAuth();
  const signedIn = Boolean(authorized && userMeta?.id);

  useEffect(() => {
    if (!signedIn) return;
    const channel = callChannel();
    const offs = EVENTS.map(event =>
      channel.on(event, ({ payload }) =>
        (callEventHandlers[event] as (data: unknown) => void)(payload)
      )
    );
    const onPageHide = () => shutdownCall();
    window.addEventListener('pagehide', onPageHide);
    return () => {
      offs.forEach(off => off());
      window.removeEventListener('pagehide', onPageHide);
      shutdownCall();
    };
  }, [signedIn]);

  // Incoming call → the friends drawer (modal) would block the call screen.
  useEffect(
    () =>
      useCallStore.subscribe((state, prev) => {
        if (state.status === 'incoming' && prev.status !== 'incoming') {
          useFriendsStore.getState().closeDrawer();
        }
      }),
    []
  );

  return (
    <>
      {children}
      {signedIn && <CallOverlay />}
    </>
  );
};
