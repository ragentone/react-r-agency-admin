import { Core } from '@core/core.api.ts';
import { ProviderManager } from '@core/provider';

import { NotifyCenterProvider } from './components/NotifyCenterProvider';
import { NotifySoundSettingsSwitch } from './components/NotifySoundSettingsSwitch';

// Notification center: counters (dock + menu badge), live events, drawer.
ProviderManager.add({
  alias: 'notify-center',
  target: 'route',
  sortOrder: 21,
  config: { provider: NotifyCenterProvider },
});

// Settings drawer: notification sound on / off (default: false).
Core.menu.registerComponent({
  id: 'notify-sound-switch',
  component: NotifySoundSettingsSwitch,
  placement: 'settings',
  sortOrder: 30,
});
