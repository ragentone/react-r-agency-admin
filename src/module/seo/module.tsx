import { Core } from '@core/core.api.ts';
import { lazyPage } from '@core/page/lazy.page.ts';
import { SearchCheck } from 'lucide-react';

import {
  ADMIN_SEO_ITEM_ROUTE,
  ADMIN_SEO_NEW_ROUTE,
  ADMIN_SEO_ROUTE,
  SEO_ADMIN_ROLES,
} from './const';

// Own chunk. Backend: runtime shared/seo (`adminSeo*`). Head on every page: core/seo.
const PageAdminSeo = lazyPage(
  () => import('./pages/PageAdminSeo.tsx').then(m => m.PageAdminSeo),
  'PageAdminSeo'
);

const PageAdminSeoRoute = lazyPage(
  () => import('./pages/PageAdminSeoRoute.tsx').then(m => m.PageAdminSeoRoute),
  'PageAdminSeoRoute'
);

// Create / edit one entry on its own page (no drawer). `new` is static, so it wins over `$routeId`.
Core.router.register({
  path: ADMIN_SEO_NEW_ROUTE,
  target: 'admin',
  page: PageAdminSeoRoute,
  meta: { title: 'SEO' },
});

Core.router.register({
  path: ADMIN_SEO_ITEM_ROUTE,
  target: 'admin',
  page: PageAdminSeoRoute,
  meta: { title: 'SEO' },
});

Core.router.register({
  path: ADMIN_SEO_ROUTE,
  target: 'admin',
  page: PageAdminSeo,
  meta: { title: 'SEO' },
});

Core.menu.register({
  id: 'admin-seo',
  label: 'seo:menu.label',
  description: 'seo:menu.description',
  icon: SearchCheck,
  to: ADMIN_SEO_ROUTE,
  section: 'admin',
  roles: SEO_ADMIN_ROLES,
  sortOrder: 25,
});
