import { Core } from '@core/core.api.ts';
import { lazyPage } from '@core/page/lazy.page.ts';
import { ChartNoAxesCombined, FileText, Server, UsersRound } from 'lucide-react';

import { SitePageMenuLoader } from './components/SitePageMenuLoader';
import {
  ADMIN_PAGES_ROUTE,
  ADMIN_ROLES,
  ADMIN_ROUTE,
  ADMIN_STATS_ROUTE,
  ADMIN_SYSTEM_ROUTE,
  SITE_PAGE_ROUTE,
} from './const';

// Own chunks. Backend: runtime shared/admin (users / roles) + apps/site-page (pages).
const PageAdmin = lazyPage(
  () => import('./pages/PageAdmin.tsx').then(m => m.PageAdmin),
  'PageAdmin'
);
const PageAdminPages = lazyPage(
  () => import('./pages/PageAdminPages.tsx').then(m => m.PageAdminPages),
  'PageAdminPages'
);
const PageAdminStats = lazyPage(
  () => import('./pages/PageAdminStats.tsx').then(m => m.PageAdminStats),
  'PageAdminStats'
);
const PageAdminSystem = lazyPage(
  () => import('./pages/PageAdminSystem.tsx').then(m => m.PageAdminSystem),
  'PageAdminSystem'
);
// Public dynamic pages (created in the admin area).
const PageSite = lazyPage(() => import('./pages/PageSite.tsx').then(m => m.PageSite), 'PageSite');

// `admin` target → `_admin` layout route: guests go to login, non-admins back home.
Core.router.register({
  path: ADMIN_ROUTE,
  target: 'admin',
  page: PageAdmin,
  meta: { title: 'Admin' },
});

Core.router.register({
  path: ADMIN_PAGES_ROUTE,
  target: 'admin',
  page: PageAdminPages,
  meta: { title: 'Admin' },
});

Core.router.register({
  path: ADMIN_STATS_ROUTE,
  target: 'admin',
  page: PageAdminStats,
  meta: { title: 'Admin' },
});

Core.router.register({
  path: ADMIN_SYSTEM_ROUTE,
  target: 'admin',
  page: PageAdminSystem,
  meta: { title: 'Admin' },
});

// Public: published pages for everybody, drafts only for `admin:user` (preview + edit).
Core.router.register({
  path: SITE_PAGE_ROUTE,
  target: 'index',
  page: PageSite,
  meta: { title: 'Page' },
});

// Admin area – role management + page builder in the "Administration" group.
Core.menu.register({
  id: 'admin',
  label: 'admin:menu.label',
  description: 'admin:menu.description',
  icon: UsersRound,
  to: ADMIN_ROUTE,
  exact: true,
  parent: 'administration',
  roles: ADMIN_ROLES,
  sortOrder: 10,
});

Core.menu.register({
  id: 'admin-pages',
  label: 'admin:menu.pagesLabel',
  description: 'admin:menu.pagesDescription',
  icon: FileText,
  to: ADMIN_PAGES_ROUTE,
  parent: 'administration',
  roles: ADMIN_ROLES,
  sortOrder: 20,
});

Core.menu.register({
  id: 'admin-stats',
  label: 'admin:menu.statsLabel',
  description: 'admin:menu.statsDescription',
  icon: ChartNoAxesCombined,
  to: ADMIN_STATS_ROUTE,
  parent: 'administration',
  roles: ADMIN_ROLES,
  sortOrder: 5,
});

Core.menu.register({
  id: 'admin-system',
  label: 'admin:menu.systemLabel',
  description: 'admin:menu.systemDescription',
  icon: Server,
  to: ADMIN_SYSTEM_ROUTE,
  parent: 'administration',
  roles: ADMIN_ROLES,
  sortOrder: 30,
});

// Published pages → own group "Pages" in the main menu (reloaded after admin changes).
Core.extension.add({ component: SitePageMenuLoader, sortOrder: 100 });
