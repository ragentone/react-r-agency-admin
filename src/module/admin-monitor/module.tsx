import { Core } from '@core/core.api.ts';
import { lazyPage } from '@core/page/lazy.page.ts';
import { Activity } from 'lucide-react';

import { ADMIN_MONITOR_ROLES, ADMIN_MONITOR_ROUTE } from './const';

// Own chunk. Backend: runtime shared/monitor (`adminMonitorSnapshot`, admin only).
const PageAdminMonitor = lazyPage(
  () => import('./pages/PageAdminMonitor.tsx').then(m => m.PageAdminMonitor),
  'PageAdminMonitor'
);

Core.router.register({
  path: ADMIN_MONITOR_ROUTE,
  target: 'admin',
  page: PageAdminMonitor,
  meta: { title: 'Admin' },
});

Core.menu.register({
  id: 'admin-monitor',
  label: 'admin-monitor:menu.label',
  description: 'admin-monitor:menu.description',
  icon: Activity,
  to: ADMIN_MONITOR_ROUTE,
  section: 'admin',
  roles: ADMIN_MONITOR_ROLES,
  sortOrder: 41,
});
