import { Core } from '@core/core.api.ts';
import { lazyPage } from '@core/page/lazy.page.ts';
import { Bug } from 'lucide-react';

import { ADMIN_DEBUG_ROLES, ADMIN_DEBUG_ROUTE } from './const';

// Own chunk. Backend: runtime shared/debug (`debugReportList`, admin only).
const PageAdminDebug = lazyPage(
  () => import('./pages/PageAdminDebug.tsx').then(m => m.PageAdminDebug),
  'PageAdminDebug'
);

Core.router.register({
  path: ADMIN_DEBUG_ROUTE,
  target: 'admin',
  page: PageAdminDebug,
  meta: { title: 'Admin' },
});

Core.menu.register({
  id: 'admin-debug',
  label: 'admin-debug:menu.label',
  description: 'admin-debug:menu.description',
  icon: Bug,
  to: ADMIN_DEBUG_ROUTE,
  section: 'admin',
  roles: ADMIN_DEBUG_ROLES,
  sortOrder: 42,
});
