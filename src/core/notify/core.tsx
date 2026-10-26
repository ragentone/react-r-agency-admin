import { useAuthStore } from '@core/auth/auth.store.tsx';
import { Core } from '@core/core.api.ts';
import { FriendsApi } from '@core/friends/api';
import { useFriendsStore } from '@core/friends/store';
import { emitFriendsChanged } from '@core/friends/utils';
import { ProviderManager } from '@core/provider';
import i18n from 'i18next';
import { Bell } from 'lucide-react';

import { NotifyActions } from './actions';
import { NotifyCenterProvider } from './components/NotifyCenterProvider';
import { NotifySoundSettingsSwitch } from './components/NotifySoundSettingsSwitch';
import { NOTIFY_LAYER_DELAY_MS } from './const';
import { useNotifyBadge, useNotifyStore } from './store';

// Notification center: counters (dock + menu badge), live events, drawer.
ProviderManager.add({
  alias: 'notify-center',
  target: 'route',
  sortOrder: 21,
  config: { provider: NotifyCenterProvider },
});

// Main menu (like X): "Notifications" right below home – opens the drawer.
Core.menu.register({
  id: 'notify',
  label: 'notify:menu.label',
  description: 'notify:menu.description',
  icon: Bell,
  section: 'main',
  audience: 'user',
  sortOrder: 5,
  // Mobile: the menu drawer closes first (back-button history), then the drawer opens.
  onSelect: () =>
    window.setTimeout(() => useNotifyStore.getState().openDrawer(), NOTIFY_LAYER_DELAY_MS),
  useBadge: () => {
    const badge = useNotifyBadge();
    return badge > 0 ? badge : null;
  },
});

// Settings drawer: notification sound on / off (default: false).
Core.menu.registerComponent({
  id: 'notify-sound-switch',
  component: NotifySoundSettingsSwitch,
  placement: 'settings',
  sortOrder: 30,
});

// ---- Buttons of the friend request notification
// (runtime shared/user/relation/services/request → `actions[].emit`).
const relationId = (payload: Record<string, unknown>) =>
  typeof payload.id === 'string' ? payload.id : null;

/** Friends drawer / buttons / counters reload after a relation changed from here. */
const friendsChanged = (userId?: string) => {
  emitFriendsChanged(userId ? { userId } : undefined);
  void useFriendsStore.getState().refreshCounts();
};

NotifyActions.register('user_relation::accept', async (payload, { item }) => {
  const id = relationId(payload);
  if (!id) return false;
  // Refused by the runtime → the request isn't open anymore (answered / withdrawn).
  if (!(await FriendsApi.accept(id))) return 'stale';
  friendsChanged(item.from?.id);
  return true;
});

NotifyActions.register('user_relation::reject', async (payload, { item }) => {
  const id = relationId(payload);
  if (!id) return false;
  if (!(await FriendsApi.reject(id))) return 'stale';
  friendsChanged(item.from?.id);
  return true;
});

NotifyActions.register(
  'user_relation::block',
  async (payload, { item }) => {
    const meId = useAuthStore.getState().userMeta?.id;
    // The requester is the other user (`sourceId`), the signed-in user is the target.
    const otherId =
      item.from?.id ?? (typeof payload.sourceId === 'string' ? payload.sourceId : undefined);
    if (!meId || !otherId || otherId === meId) return false;
    const result = await FriendsApi.block(meId, otherId);
    if (!result?.success) return false;
    friendsChanged(otherId);
    return true;
  },
  {
    // Same dialog as in the friends drawer – blocking also ends an existing friendship.
    confirm: ({ item }) => {
      const name = item.from?.alias ?? '';
      return {
        title: i18n.t('friends:confirm.block.title', { name }),
        text: i18n.t('friends:confirm.block.text', { name }),
        action: i18n.t('friends:confirm.block.action'),
        destructive: true,
      };
    },
  }
);
