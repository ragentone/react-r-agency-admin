import { Core } from '@core/core.api.ts';
import { CoreVariables } from '@core/core.variables.ts';
import { DockMenu, DockScrollTopButton } from '@core/dock/components';
import { DOCK_ORDER_FIRST, DOCK_ORDER_LAST } from '@core/dock/types.ts';
import { LinkProvider } from '@core/links/components';
import { LINK_ROUTE } from '@core/links/const.ts';
import { openLinksMenu } from '@core/links/store.ts';
import { htmlFromUrl } from '@core/links/utils.ts';
import {
  MenuDockButton,
  MenuLocaleSwitch,
  MenuSettingsDockButton,
  MenuThemeSwitch,
  MenuUserCard,
  MenuUserDockButton,
} from '@core/menu/components';
import { lazyPage } from '@core/page/lazy.page.ts';
import { PageManager } from '@core/page/page.manager.tsx';
import { Page404, PageIndex } from '@core/pages';
import { ProfileProvider } from '@core/profile/components/ProfileDialogHost.tsx';
import { getProfilePath, PROFILE_ROUTE } from '@core/profile/const.ts';
import { openProfileDrawer } from '@core/profile/hooks/use.profile.drawer.ts';
import {
  CircleUserRound,
  House,
  Link,
  LogIn,
  LogOut,
  ShieldCheck,
  UserCog,
  UserRound,
} from 'lucide-react';
import React from 'react';

// Pages are loaded on demand (own chunks) – only the home page and 404 are in the start bundle.
const PageAccount = lazyPage(
  () => import('./account/pages/PageAccount.tsx').then(m => m.PageAccount),
  'PageAccount'
);
const PageAuth = lazyPage(
  () => import('./auth/pages/PageAuth.tsx').then(m => m.PageAuth),
  'PageAuth'
);
const PageProfile = lazyPage(
  () => import('./profile/pages/PageProfile.tsx').then(m => m.PageProfile),
  'PageProfile'
);
const PageUserConfirm = lazyPage(
  () => import('./auth/pages/PageUserConfirm.tsx').then(m => m.PageUserConfirm),
  'PageUserConfirm'
);
const PageLink = lazyPage(
  () => import('./links/pages/PageLink.tsx').then(m => m.PageLink),
  'PageLink'
);
const PagePasswordCreate = lazyPage(
  () => import('./auth/pages/PagePasswordCreate.tsx').then(m => m.PagePasswordCreate),
  'PagePasswordCreate'
);

Core.page.setPage('index', PageIndex);
Core.page.setPage('404', Page404);
Core.page.setPage('account', PageAccount);
Core.page.setPage('auth', PageAuth);
Core.page.setPage('profile', PageProfile);

const RegisteredProfilePage: React.FC = () => React.createElement(PageManager.getPage('profile'));

Core.router.register({
  path: PROFILE_ROUTE,
  target: 'auth',
  page: () => React.createElement(RegisteredProfilePage),
  meta: { title: 'Profile' },
});

// Confirm link from the "user created" e-mail: /user/confirm?token=… (backend: user.service createConfirmUrl).
Core.router.register({
  path: '/user/confirm',
  page: PageUserConfirm,
  target: 'index',
  async loader({ search }) {
    return search;
  },
});

Core.router.register({
  path: '/user/password/create',
  page: PagePasswordCreate,
  target: 'index',
  async loader({ search }) {
    return search;
  },
});

// Profile dialog host: `?profile=<id>` (masked as /profile/<id>) opens the profile over any page.
Core.provider.add({
  alias: 'profile',
  target: 'route',
  sortOrder: 10,
  config: { provider: ProfileProvider },
});

// ---- Mobile dock (src/core/dock) – floating bar below `md`. Pages add buttons via `useDockButton`.
// Left: main menu.
Core.dock.register({
  id: 'menu',
  component: MenuDockButton,
  align: 'left',
  sortOrder: DOCK_ORDER_FIRST,
});

// Left, after the menu: avatar → user drawer (profile, account, administration, logout).
// Hidden for guests.
Core.dock.register({
  id: 'user',
  component: MenuUserDockButton,
  align: 'left',
  sortOrder: 0,
});

// Right, always first: dropdown menu – items via `Core.dock.registerMenuItem`
// (none yet → hidden).
Core.dock.register({
  id: 'dock-menu',
  component: DockMenu,
  align: 'right',
  sortOrder: DOCK_ORDER_FIRST,
});

// … scroll-top always last.
Core.dock.register({
  id: 'scroll-top',
  component: DockScrollTopButton,
  align: 'right',
  sortOrder: DOCK_ORDER_LAST,
});

// Links menu (imprint, terms, privacy, app links) – always reachable on phones.
Core.dock.register({
  id: 'links',
  label: 'links:menu.title',
  icon: Link,
  onClick: openLinksMenu,
  align: 'right',
  sortOrder: 5,
});

// Settings drawer (right side): language, theme … (`placement: 'settings'`).
Core.dock.register({
  id: 'settings',
  component: MenuSettingsDockButton,
  align: 'right',
  sortOrder: 10,
});

// ---- Main menu (src/core/menu) – apps add their own entries from `app.tsx`.
Core.menu.register({
  id: 'home',
  label: 'menu:items.home',
  icon: House,
  to: CoreVariables.routePathHome,
  section: 'main',
  exact: true,
  sortOrder: 0,
});

// "User" group – everything around the own account. Other modules add entries with
// `parent: 'user'` (profile, friends, account …). Guests don't see it (no visible children).
// `display: 'drawer'` → one row in the main menu, profile, friends, account … open in the
// bottom drawer (centered) with the user card on top.
Core.menu.register({
  id: 'user',
  label: 'menu:items.user',
  description: 'menu:items.userDescription',
  icon: UserRound,
  section: 'account',
  audience: 'user',
  display: 'drawer',
  drawerHeader: MenuUserCard,
  sortOrder: 900,
});

// "Administration" group – developer, role management, page builder (modules add their
// entries with `parent: 'administration'` + `roles`). Part of the user drawer (own heading
// below the user entries). Hidden when no child is visible.
Core.menu.register({
  id: 'administration',
  label: 'menu:items.administration',
  description: 'menu:items.administrationDescription',
  icon: ShieldCheck,
  parent: 'user',
  audience: 'user',
  // Before logout (1000) → logout stays the last row of the drawer.
  sortOrder: 900,
});

Core.menu.register({
  id: 'profile',
  label: 'menu:items.profile',
  description: 'menu:items.profileDescription',
  icon: CircleUserRound,
  to: ({ user }) => (user?.id ? getProfilePath(user.id) : undefined),
  parent: 'user',
  audience: 'user',
  sortOrder: 0,
});

Core.menu.register({
  id: 'account',
  label: 'menu:items.account',
  description: 'menu:items.accountDescription',
  icon: UserCog,
  to: CoreVariables.routePathAccount,
  parent: 'user',
  audience: 'user',
  sortOrder: 20,
});

// Logout (last in the user group) – opens the confirm dialog of `AuthProvider`.
Core.menu.register({
  id: 'logout',
  label: 'menu:items.logout',
  description: 'menu:items.logoutDescription',
  icon: LogOut,
  onSelect: () => void Core.events.core.emit('auth:logout:request'),
  parent: 'user',
  audience: 'user',
  sortOrder: 1000,
});

Core.menu.register({
  id: 'login',
  label: 'menu:items.login',
  description: 'menu:items.loginDescription',
  icon: LogIn,
  to: CoreVariables.routePathAuth,
  section: 'account',
  audience: 'guest',
  sortOrder: 920,
});

// Settings drawer on the right (opened from the dock / sidebar).
Core.menu.registerComponent({
  id: 'locale-switch',
  component: MenuLocaleSwitch,
  placement: 'settings',
  sortOrder: 0,
});

Core.menu.registerComponent({
  id: 'theme-switch',
  component: MenuThemeSwitch,
  placement: 'settings',
  sortOrder: 10,
});

// ---- Link manager (src/core/links): links menu via the dock button, content as a regular
// page (`/link/<id>`). Apps register their own links / groups with `Core.links.register(…)`.
// Public route (target `index`) – imprint, terms and privacy must be readable without login.
Core.router.register({
  path: LINK_ROUTE,
  target: 'index',
  page: PageLink,
  meta: { title: 'Links' },
});

Core.provider.add({
  alias: 'links',
  target: 'route',
  sortOrder: 20,
  config: { provider: LinkProvider },
});

// Legal texts as HTML files in `public/legal/<id>.<lang>.html` → editable without a build.
Core.links.register({
  id: 'imprint',
  kind: 'imprint',
  label: 'links:items.imprint',
  description: 'links:items.imprintDescription',
  content: { type: 'html', html: htmlFromUrl('/legal/imprint.{lang}.html') },
  sortOrder: 0,
});

Core.links.register({
  id: 'terms',
  kind: 'terms',
  label: 'links:items.terms',
  description: 'links:items.termsDescription',
  content: { type: 'html', html: htmlFromUrl('/legal/terms.{lang}.html') },
  sortOrder: 10,
});

Core.links.register({
  id: 'privacy',
  kind: 'privacy',
  label: 'links:items.privacy',
  description: 'links:items.privacyDescription',
  content: { type: 'html', html: htmlFromUrl('/legal/privacy.{lang}.html') },
  sortOrder: 20,
});

// Search: people hits open the profile as drawer (no routing, back closes it).
Core.search.registerGroup({
  name: 'user',
  label: 'search:groups.user',
  icon: UserRound,
  roundImage: true,
  sortOrder: 0,
});
Core.search.registerHandler({
  emit: 'user::show_profile',
  handle: item => {
    const id = item.payload?.id;
    if (typeof id === 'string') openProfileDrawer(id);
  },
});
