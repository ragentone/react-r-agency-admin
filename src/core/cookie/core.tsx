import { Core } from '@core/core.api.ts';

import { CookieConsentProvider } from './components/CookieConsentProvider.tsx';
import { MenuCookieSwitch } from './components/MenuCookieSwitch.tsx';

// Register global cookie consent provider
Core.provider.add({
  alias: 'cookie-consent',
  target: 'route',
  sortOrder: 25,
  config: { provider: CookieConsentProvider },
});

// Register in menu quick settings drawer
Core.menu.registerComponent({
  id: 'cookie-switch',
  component: MenuCookieSwitch,
  placement: 'settings',
  sortOrder: -999,
});
