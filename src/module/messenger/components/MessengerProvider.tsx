import { useMeshState } from '@core/mesh';
import { useNotificationTap } from '@core/native';
import { onPushClick } from '@core/push/events.ts';
import { useRouter } from '@tanstack/react-router';
import { type ReactNode, useEffect } from 'react';
import { toast } from 'sonner';

import { useAuth } from '@core/auth/components/use.auth.ts';
import { onFriendPresence } from '@core/friends/utils.ts';
import { messengerChannel } from '../api.ts';
import { i18nT } from '../i18n.ts';
import { isMessengerNotification, notifyIncomingMessage } from '../notify.ts';
import { myId, openMessenger, useMessengerStore } from '../store.ts';

/** `?messenger=<userId>` (link from a push notification) opens that chat. */
const MESSENGER_PARAM = 'messenger';
import { MessengerDrawer } from './MessengerDrawer.tsx';

/** Live events + unread badge while signed in; renders the messenger drawer. */
export const MessengerProvider = ({ children }: { children: ReactNode }) => {
  const { authorized, userMeta } = useAuth();
  const signedIn = Boolean(authorized && userMeta?.id);
  const { connected } = useMeshState();
  const router = useRouter();

  // Tap on a notification: push while the app was open (service worker) or native app.
  useNotificationTap(({ data }) => {
    if (signedIn && isMessengerNotification(data)) {
      openMessenger({
        id: data.peerId,
        alias: data.alias ?? '',
        avatarUrl: data.avatarUrl ?? null,
      });
    }
  });
  useEffect(() => {
    if (!signedIn) return;
    return onPushClick(({ data }) => {
      if (isMessengerNotification(data)) {
        openMessenger({
          id: data.peerId,
          alias: data.alias ?? '',
          avatarUrl: data.avatarUrl ?? null,
        });
      }
    });
  }, [signedIn]);

  // App started from a push notification (`/?messenger=<userId>`).
  useEffect(() => {
    if (!signedIn) return;
    const { pathname, searchStr, hash } = router.state.location;
    const params = new URLSearchParams(searchStr);
    const peerId = params.get(MESSENGER_PARAM);
    if (!peerId) return;
    params.delete(MESSENGER_PARAM);
    const search = params.toString();
    router.history.replace(`${pathname}${search ? `?${search}` : ''}${hash ? `#${hash}` : ''}`);
    openMessenger({ id: peerId, alias: '', avatarUrl: null });
  }, [signedIn, router]);

  // Unread badge – again after a reconnect / when the app comes back.
  useEffect(() => {
    if (!signedIn) {
      useMessengerStore.getState().clear();
      return;
    }
    if (!connected) return;
    const store = useMessengerStore.getState();
    void store.refreshUnread();
    // Reconnect: the drawer may show stale data → reload the open parts.
    if (store.conversationsLoaded) void store.loadConversations();
    if (store.open && store.activePeerId) void store.loadThread(store.activePeerId, true);
    const onVisible = () => {
      if (document.visibilityState !== 'visible') return;
      const { refreshUnread, open, activePeerId, markRead } = useMessengerStore.getState();
      void refreshUnread();
      if (open && activePeerId) void markRead(activePeerId);
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, [signedIn, connected]);

  useEffect(() => {
    if (!signedIn) return;
    const channel = messengerChannel();
    const offs = [
      channel.on('messenger:message', ({ payload }) => {
        if (!payload?.message || !payload.peer) return;
        const store = useMessengerStore.getState();
        const incoming = payload.message.recipientId === myId();
        const watching =
          store.open &&
          store.activePeerId === payload.peer.id &&
          document.visibilityState === 'visible';
        store.onMessage(payload);
        // App in the background (still connected → no push from the runtime): system notification.
        if (incoming && document.visibilityState === 'hidden' && !payload.message.deleted) {
          void notifyIncomingMessage(payload.peer, payload.message);
        }
        // Messenger closed / other chat open → small hint with "Open".
        if (incoming && !watching && !payload.message.deleted) {
          const peer = payload.peer;
          toast(i18nT('toast.newMessage', { name: peer.alias || i18nT('unknown') }), {
            id: `messenger-${peer.id}`,
            description: payload.message.body.slice(0, 120),
            action: {
              label: i18nT('toast.open'),
              onClick: () => useMessengerStore.getState().openMessenger(peer),
            },
          });
        }
      }),
      channel.on('messenger:read', ({ payload }) => {
        if (payload) useMessengerStore.getState().onRead(payload);
      }),
      channel.on('messenger:typing', ({ payload }) => {
        if (payload?.userId) useMessengerStore.getState().onTyping(payload);
      }),
      channel.on('messenger:deleted', ({ payload }) => {
        if (payload?.messageId) useMessengerStore.getState().onDeleted(payload);
      }),
      // Chat deleted (by the friend or on another own device).
      channel.on('messenger:cleared', ({ payload }) => {
        if (payload?.peerId) useMessengerStore.getState().onCleared(payload);
      }),
    ];
    // Friends' online state (runtime `user_relation` presence) → green dots.
    const offPresence = onFriendPresence(presence => {
      if (presence?.userId)
        useMessengerStore.getState().setOnline(presence.userId, !!presence.online);
    });
    return () => {
      offs.forEach(off => off());
      offPresence();
    };
  }, [signedIn]);

  return (
    <>
      {children}
      {signedIn && <MessengerDrawer />}
    </>
  );
};
