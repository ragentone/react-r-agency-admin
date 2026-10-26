import { Core } from '@core/core.api.ts';
import { lazyPage } from '@core/page/lazy.page.ts';
import { SearchCheck } from 'lucide-react';

import { ADMIN_SEO_ROUTE, SEO_ADMIN_ROLES } from './const';

// Own chunk. Backend: runtime shared/seo (`adminSeo*`). Head on every page: core/seo.
const PageAdminSeo = lazyPage(
  () => import('./pages/PageAdminSeo.tsx').then(m => m.PageAdminSeo),
  'PageAdminSeo'
);

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
