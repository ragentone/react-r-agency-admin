import { Core } from '@core/core.api.ts';

import {
  PwaMenuInstall,
  PwaProvider,
  PwaSettingsUpdate,
  PwaSettingsVersion,
  usePwaUpdateAttention,
} from './components';
import { installPreloadErrorReload } from './preload.error.ts';

// Missing lazy chunk after a deploy → reload once (see preload.error.ts).
installPreloadErrorReload();

// PWA control: service worker updates, offline state, install prompt (inside the router → sheets can use back-close).
Core.provider.add({
  alias: 'pwa',
  target: 'route',
  sortOrder: -10,
  config: { provider: PwaProvider },
});

// "Install app" in the menu settings area (renders nothing when not installable).
Core.menu.registerComponent({
  id: 'pwa-install',
  component: PwaMenuInstall,
  placement: 'footer',
  sortOrder: 50,
});

// New version: no drawer – blinking dot on the settings button (dock / sidebar), the update
// itself is started from the settings drawer (top entry, only while a version is waiting).
Core.menu.registerComponent({
  id: 'pwa-update',
  component: PwaSettingsUpdate,
  placement: 'settings',
  sortOrder: -100,
  useAttention: usePwaUpdateAttention,
});

// Bottom of the settings drawer: "Version 1.0.2" (internal version of the runtime).
Core.menu.registerComponent({
  id: 'pwa-version',
  component: PwaSettingsVersion,
  placement: 'settings',
  sortOrder: 2000,
});
