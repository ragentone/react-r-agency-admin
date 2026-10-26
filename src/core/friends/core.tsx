import { Core } from '@core/core.api.ts';
import { ProviderManager } from '@core/provider';
import { Users } from 'lucide-react';

import { FriendsProvider } from './components/FriendsProvider';
import { FRIENDS_LAYER_DELAY_MS } from './const';
import { useFriendsStore } from './store';

// Counters (menu badge, tabs) + the friends drawer.
ProviderManager.add({
  alias: 'friends',
  target: 'route',
  sortOrder: 20,
  config: { provider: FriendsProvider },
});

// Menu: opens the friends drawer (bottom sheet) instead of a page.
Core.menu.register({
  id: 'friends',
  label: 'friends:menu.label',
  description: 'friends:menu.description',
  icon: Users,
  // "User" group (src/core/core.tsx): between profile (0) and account (20).
  parent: 'user',
  audience: 'user',
  sortOrder: 10,
  // Mobile: the menu drawer closes first (back-button history), then the friends drawer opens.
  onSelect: () =>
    window.setTimeout(() => useFriendsStore.getState().openDrawer(), FRIENDS_LAYER_DELAY_MS),
  // Open friend requests.
  useBadge: () => useFriendsStore(state => state.counts.incoming),
});
