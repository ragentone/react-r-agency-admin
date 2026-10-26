import { Core } from '@core/core.api.ts';
import { lazyPage } from '@core/page/lazy.page.ts';
import { ProviderManager } from '@core/provider';
import { Coins, Gem } from 'lucide-react';
import React from 'react';

import { CreditsMenuBalance } from './components/CreditsMenuBalance.tsx';
import { CreditsProfileButton } from './components/CreditsProfileButton.tsx';
import { CreditsProvider } from './components/CreditsProvider.tsx';
import { CREDITS_ADMIN_ROLES, CREDITS_ADMIN_ROUTE, CREDITS_ROUTE } from './const.ts';
import { markCreditsActive } from './feature.ts';
import { CreditsRegistry } from './registry.ts';

// Credits – core feature (runtime src/shared/credits): wallet, history, tips, admin area.
markCreditsActive();

const PageCredits = lazyPage(
  () => import('./pages/PageCredits.tsx').then(m => m.PageCredits),
  'PageCredits'
);

const PageCreditsAdmin = lazyPage(
  () => import('./pages/PageCreditsAdmin.tsx').then(m => m.PageCreditsAdmin),
  'PageCreditsAdmin'
);

CreditsRegistry.registerApp({ app: 'core', label: 'credits:apps.core', icon: Coins, sortOrder: 0 });

ProviderManager.add({
  alias: 'credits',
  target: 'route',
  sortOrder: 24,
  config: { provider: CreditsProvider },
});

Core.router.register({
  path: CREDITS_ROUTE,
  target: 'auth',
  page: PageCredits,
  meta: { title: 'Credits' },
});

// `admin` target → `_admin` layout route: guests go to login, non-admins back home.
Core.router.register({
  path: CREDITS_ADMIN_ROUTE,
  target: 'admin',
  page: PageCreditsAdmin,
  meta: { title: 'Credits' },
});

// "User" group: wallet with the balance next to it.
Core.menu.register({
  id: 'credits',
  label: 'credits:menu.label',
  description: 'credits:menu.description',
  icon: Coins,
  to: CREDITS_ROUTE,
  exact: true,
  parent: 'user',
  audience: 'user',
  sortOrder: 10,
  trailing: React.createElement(CreditsMenuBalance),
});

Core.menu.register({
  id: 'admin-credits',
  label: 'credits:menu.adminLabel',
  description: 'credits:menu.adminDescription',
  icon: Gem,
  to: CREDITS_ADMIN_ROUTE,
  parent: 'administration',
  roles: CREDITS_ADMIN_ROLES,
  sortOrder: 30,
});

// Profile header of a friend: send credits (next to message / call).
Core.cms.register('profile-call-buttons', {
  component: CreditsProfileButton,
  sortOrder: 20,
});
