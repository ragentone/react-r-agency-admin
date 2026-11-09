import { Core } from '@core/core.api.ts';
import { lazyPage } from '@core/page/lazy.page.ts';
import { Kanban } from 'lucide-react';

import { DEV_KANBAN_ROLES, DEV_KANBAN_ROUTE } from './const';

// Eigener Chunk. Backend: developerTodoList / Create / Update (admin only).
const PageDeveloper = lazyPage(
  () => import('./pages/PageDeveloper.tsx').then(m => m.PageDeveloper),
  'PageDeveloper'
);

Core.router.register({
  path: DEV_KANBAN_ROUTE,
  target: 'admin',
  page: PageDeveloper,
  meta: { title: 'Dev-Todos' },
});

Core.menu.register({
  id: 'dev-kanban',
  label: 'dev-kanban:menu.label',
  description: 'dev-kanban:menu.description',
  icon: Kanban,
  to: DEV_KANBAN_ROUTE,
  section: 'admin',
  roles: DEV_KANBAN_ROLES,
  sortOrder: 43,
});
