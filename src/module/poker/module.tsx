import { Core } from '@core/core.api.ts';
import { lazyPage } from '@core/page/lazy.page.ts';
import { Spade } from 'lucide-react';

import { POKER_ADMIN_ROLES, POKER_ADMIN_ROUTE } from './const.ts';

// Poker admin (runtime apps/poker, ws `poker-admin`): live tables, settings, hands, checks.
const PagePokerAdmin = lazyPage(
  () => import('./pages/PagePokerAdmin.tsx').then(m => m.PagePokerAdmin),
  'PagePokerAdmin'
);

Core.router.register({
  path: POKER_ADMIN_ROUTE,
  target: 'admin',
  page: PagePokerAdmin,
  meta: { title: 'Poker' },
});

Core.menu.register({
  id: 'admin-poker',
  label: 'poker:menu.adminLabel',
  description: 'poker:menu.adminDescription',
  icon: Spade,
  to: POKER_ADMIN_ROUTE,
  section: 'admin',
  roles: POKER_ADMIN_ROLES,
  sortOrder: 31,
});
