import { Core } from '@core/core.api.ts';
import { ProviderManager } from '@core/provider';

import { PushProvider } from './components/PushProvider';
import { PushSettingsSwitch } from './components/PushSettingsSwitch';

// Web Push (runtime src/shared/push, service worker public/push-sw.js): subscription of this
// device for the signed-in user + taps on notifications.
ProviderManager.add({
  alias: 'push',
  target: 'route',
  sortOrder: 23,
  config: { provider: PushProvider },
});

// Settings drawer: on / off for this device (hidden where push isn't available).
Core.menu.registerComponent({
  id: 'push-switch',
  component: PushSettingsSwitch,
  placement: 'settings',
  audience: 'user',
  sortOrder: 20,
});
