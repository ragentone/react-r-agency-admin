import { Core } from '@core/core.api.ts';
import { lazyPage } from '@core/page/lazy.page.ts';
import { Clock } from 'lucide-react';

import { ADMIN_CRON_ROLES, ADMIN_CRON_ROUTE } from './const';

// Own chunk. Backend: runtime shared/cron (`adminCronList`, `adminCronRuns`, `adminCronRun`).
const PageAdminCron = lazyPage(
  () => import('./pages/PageAdminCron.tsx').then(m => m.PageAdminCron),
  'PageAdminCron'
);

Core.router.register({
  path: ADMIN_CRON_ROUTE,
  target: 'admin',
  page: PageAdminCron,
  meta: { title: 'Admin' },
});

Core.menu.register({
  id: 'admin-cron',
  label: 'admin-cron:menu.label',
  description: 'admin-cron:menu.description',
  icon: Clock,
  to: ADMIN_CRON_ROUTE,
  section: 'admin',
  roles: ADMIN_CRON_ROLES,
  sortOrder: 42,
});
