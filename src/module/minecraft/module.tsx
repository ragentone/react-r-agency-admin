import { Core } from '@core/core.api.ts';
import { lazyPage } from '@core/page/lazy.page.ts';
import { Gamepad2 } from 'lucide-react';
import { lazy } from 'react';

import { registerMonitorSection } from '../admin-monitor/registry';
import { ADMIN_MINECRAFT_ROLES, ADMIN_MINECRAFT_ROUTE } from './const';

// Own chunk. Backend: runtime apps/minecraft (`adminMinecraft*`, admin only).
const PageAdminMinecraft = lazyPage(
  () => import('./pages/PageAdminMinecraft.tsx').then(m => m.PageAdminMinecraft),
  'PageAdminMinecraft'
);

// Section "Minecraft" in the admin monitor (runtime registers `minecraft` in `registerModule`).
registerMonitorSection(
  'minecraft',
  lazy(() =>
    import('./components/MonitorMinecraftSection.tsx').then(m => ({
      default: m.MonitorMinecraftSection,
    }))
  )
);

Core.router.register({
  path: ADMIN_MINECRAFT_ROUTE,
  target: 'admin',
  page: PageAdminMinecraft,
  meta: { title: 'Admin' },
});

Core.menu.register({
  id: 'minecraft',
  label: 'minecraft:menu.label',
  description: 'minecraft:menu.description',
  icon: Gamepad2,
  to: ADMIN_MINECRAFT_ROUTE,
  section: 'admin',
  roles: ADMIN_MINECRAFT_ROLES,
  sortOrder: 42,
});
