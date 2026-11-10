import { type ReactNode, useEffect } from 'react';

import { useAuth } from '../../auth/components/use.auth.ts';
import { callChannel } from '../api';
import { callEventHandlers, shutdownCall } from '../call.engine';
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

  return (
    <>
      {children}
      {signedIn && <CallOverlay />}
    </>
  );
};
