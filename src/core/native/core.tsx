import { Core } from '@core/core.api.ts';
import { NativeControl } from '@core/native/components/NativeControl.tsx';
import { ProviderManager } from '@core/provider';

import { NativeProvider } from './components/NativeProvider';

ProviderManager.add({
  alias: 'native',
  target: 'route',
  sortOrder: -5,
  config: { provider: NativeProvider },
});

Core.menu.registerComponent({
  id: 'native-control',
  component: NativeControl,
  placement: 'settings',
  sortOrder: 999,
});
