import { Core } from '@core/core.api.ts';
import { lazyPage } from '@core/page/lazy.page.ts';
import { Store } from 'lucide-react';

import { ADMIN_SHOP_ROLES, ADMIN_SHOP_ROUTE } from './const';

// Own chunk. Backend: runtime apps/shop (`shopGet`, `shopSave`, `shopItem*`, `shopRequest*`).
const PageAdminShop = lazyPage(
  () => import('./pages/PageAdminShop.tsx').then(m => m.PageAdminShop),
  'PageAdminShop'
);

Core.router.register({
  path: ADMIN_SHOP_ROUTE,
  target: 'admin',
  page: PageAdminShop,
  meta: { title: 'Admin' },
});

Core.menu.register({
  id: 'admin-shop',
  label: 'admin-shop:menu.label',
  description: 'admin-shop:menu.description',
  icon: Store,
  to: ADMIN_SHOP_ROUTE,
  section: 'admin',
  roles: ADMIN_SHOP_ROLES,
  sortOrder: 43,
});
