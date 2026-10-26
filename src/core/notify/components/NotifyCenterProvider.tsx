import { useDockButton } from '@core/dock';
import { useNotificationTap } from '@core/native';
import i18n from 'i18next';
import { Bell } from 'lucide-react';
import { useMesh } from 'r-agency-mesh-client-v1/release';
import { type ReactNode, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { useAuth } from '../../auth/components/use.auth.ts';
import { NotifyActions } from '../actions';
import { useNotifyActivityStore } from '../activity';
import { NOTIFY_EVENTS, NOTIFY_STATE_INTERVAL_MS, NOTIFY_TOAST_MS } from '../const';
import { playNotifySoundIfEnabled } from '../sound';
import { useNotifyBadge, useNotifyStore } from '../store';
import { cancelSystemNotify, NOTIFY_SYSTEM_TYPE, setAppBadge, showSystemNotify } from '../system';
import type { INotifyRaw, INotifyStateEvent } from '../types';
import { notifyView } from '../utils';
import { NotifyDrawer } from './NotifyDrawer';
import { NotifyToast } from './NotifyToast';

/**
 * Notification center while signed in: counters (dock + menu badge), live events of the
 * runtime (new / removed / read on another device), popup for new notifications and the drawer.
 */
export const NotifyCenterProvider = ({ children }: { children: ReactNode }) => {
  const { authorized, userMeta } = useAuth();
  const { onEvent } = useMesh();
  const { t } = useTranslation('notify');
  const signedIn = Boolean(authorized && userMeta?.id);
  const unread = useNotifyStore(state => state.state.unread);
  /** Bell: unread notifications + new / finished live activities. */
  const badge = useNotifyBadge();
  const drawerOpen = useNotifyStore(state => state.drawerOpen);

  // Counters: on sign-in, when the app comes back to the foreground and as a slow fallback.
  useEffect(() => {
    const { refreshState, reset } = useNotifyStore.getState();
    if (!signedIn) {
      reset();
      useNotifyActivityStore.getState().reset();
      return;
    }
    void refreshState();
    const refreshIfVisible = () => {
      if (document.visibilityState === 'visible') void refreshState();
    };
    const timer = window.setInterval(refreshIfVisible, NOTIFY_STATE_INTERVAL_MS);
    document.addEventListener('visibilitychange', refreshIfVisible);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener('visibilitychange', refreshIfVisible);
    };
  }, [signedIn]);

  // Live events (runtime shared/user/services/notify → USER_NOTIFY_EVENTS).
  useEffect(() => {
    if (!signedIn) return;
    const store = useNotifyStore.getState;

    const offIncoming = onEvent(NOTIFY_EVENTS.incoming, (payload?: { notify?: INotifyRaw }) => {
      if (!payload?.notify) return;
      const item = store().receive(payload.notify);
      if (!item) return;
      playNotifySoundIfEnabled(item.type);
      // App in the background (Flutter app / other tab) → system notification, if switched on.
      if (!item.flash) {
        const { title, message } = notifyView(i18n.t, i18n, item);
        void showSystemNotify(item.id, title || message, title ? message : undefined);
      }
      // Drawer open → the new entry appears at the top of the list, no popup needed.
      if (store().drawerOpen && !item.flash) return;
      const id = `notify-${item.id}`;
      const close = () => toast.dismiss(id);
      toast.custom(
        () => (
          <NotifyToast
            item={item}
            onClose={close}
            onOpen={
              item.flash
                ? undefined
                : () => {
                    close();
                    store().openDrawer();
                  }
            }
          />
        ),
        {
          id,
          duration: item.actions.some(action => NotifyActions.has(action.emit))
            ? NOTIFY_TOAST_MS * 2
            : NOTIFY_TOAST_MS,
          unstyled: true,
        }
      );
    });

    const offRemove = onEvent(NOTIFY_EVENTS.remove, (payload?: { id?: string }) => {
      if (payload?.id) {
        store().applyRemoved([payload.id]);
        cancelSystemNotify([payload.id]);
        toast.dismiss(`notify-${payload.id}`);
      }
    });

    const offState = onEvent(NOTIFY_EVENTS.state, (payload?: INotifyStateEvent) => {
      if (!payload) return;
      store().applyStateEvent(payload);
      // Read / deleted (also on another device) → the system notification goes away too.
      if (payload.seenAll || payload.cleared) cancelSystemNotify();
      else cancelSystemNotify([...(payload.seenIds ?? []), ...(payload.removedIds ?? [])]);
    });

    return () => {
      offIncoming?.();
      offRemove?.();
      offState?.();
    };
    // `onEvent` is a new function on every render (same event bus) – not a dependency.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signedIn]);

  // Unread counter on the app icon (Flutter app: iOS / macOS, browser: installed PWA).
  useEffect(() => {
    setAppBadge(signedIn ? unread : 0);
  }, [signedIn, unread]);

  // Tap on a system notification (also when it started the app) → drawer + mark as read.
  useNotificationTap(({ data }) => {
    const tap = data as { type?: string; notifyId?: string } | null;
    if (tap?.type !== NOTIFY_SYSTEM_TYPE) return;
    const { openDrawer, markSeen } = useNotifyStore.getState();
    openDrawer();
    if (tap.notifyId) void markSeen(tap.notifyId);
  });

  // Mobile dock: bell with the unread counter (right, after search).
  useDockButton(
    signedIn && {
      id: 'notify',
      label: t('title'),
      icon: Bell,
      badge: badge > 0 ? badge : undefined,
      active: drawerOpen,
      align: 'right',
      sortOrder: 2,
      onClick: () => useNotifyStore.getState().openDrawer(),
    }
  );

  return (
    <>
      {children}
      {signedIn && <NotifyDrawer />}
    </>
  );
};
