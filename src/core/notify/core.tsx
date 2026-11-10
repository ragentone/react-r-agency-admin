import { Core } from '@core/core.api.ts';
import { ProviderManager } from '@core/provider';
import { Bell } from 'lucide-react';

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
