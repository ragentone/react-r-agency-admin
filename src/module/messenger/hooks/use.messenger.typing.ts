import { useCallback, useEffect, useRef } from 'react';

import { messengerAction } from '../api.ts';
import { MESSENGER_TYPING_IDLE_MS, MESSENGER_TYPING_THROTTLE_MS } from '../const.ts';

/**
 * Typing indicator for the other side: `typing: true` at most every 3 s while typing,
 * `typing: false` after a pause, on send and when the chat closes.
 */
export const useMessengerTypingSender = (peerId: string) => {
  const lastSent = useRef(0);
  const active = useRef(false);
  const idle = useRef<number | undefined>(undefined);

  const stop = useCallback(() => {
    window.clearTimeout(idle.current);
    if (!active.current) return;
    active.current = false;
    lastSent.current = 0;
    void messengerAction('typing', { peerId, typing: false });
  }, [peerId]);

  const typed = useCallback(() => {
    const now = Date.now();
    if (!active.current || now - lastSent.current > MESSENGER_TYPING_THROTTLE_MS) {
      active.current = true;
      lastSent.current = now;
      void messengerAction('typing', { peerId, typing: true });
    }
    window.clearTimeout(idle.current);
    idle.current = window.setTimeout(stop, MESSENGER_TYPING_IDLE_MS);
  }, [peerId, stop]);

  useEffect(() => stop, [stop]);

  return { typed, stop };
};
