import { Core } from '@core/core.api.ts';
import { lazyPage } from '@core/page/lazy.page.ts';
import { Rocket, SquareTerminal } from 'lucide-react';
import { lazy } from 'react';

import type { IDevRoadmapBlockData } from './blocks/DevRoadmapBlock';
import { DEV_ROLES, DEV_ROUTE, ROADMAP_ROUTE } from './const';

// Own chunks. Backend: runtime apps/developer.
const PageDev = lazyPage(() => import('./pages/PageDev.tsx').then(m => m.PageDev), 'PageDev');
const PageRoadmap = lazyPage(
  () => import('./pages/PageRoadmap.tsx').then(m => m.PageRoadmap),
  'PageRoadmap'
);

// Dev area: todos + reviewing user tickets – only admin:user / dev:user.
Core.router.register({
  path: DEV_ROUTE,
  target: 'auth',
  page: PageDev,
  meta: { title: 'Dev' },
});

Core.menu.register({
  id: 'dev',
  label: 'dev:menu.label',
  description: 'dev:menu.description',
  icon: SquareTerminal,
  to: DEV_ROUTE,
  // "Administration" group (src/core/core.tsx), first entry.
  parent: 'administration',
  roles: DEV_ROLES,
  sortOrder: 0,
});

// Public: what is being built (everyone) + tickets (signed-in users).
Core.router.register({
  path: ROADMAP_ROUTE,
  target: 'index',
  page: PageRoadmap,
  meta: { title: 'Roadmap' },
});

Core.menu.register({
  id: 'roadmap',
  label: 'dev:roadmap.menu.label',
  description: 'dev:roadmap.menu.description',
  icon: Rocket,
  to: ROADMAP_ROUTE,
  section: 'main',
  audience: 'all',
  sortOrder: 50,
  roles: DEV_ROLES,
});

// ---- Page block (core block registry): public roadmap on dynamic pages (admin → pages).
// Backend counterpart: runtime apps/developer/boot.loader.ts (`site-page` → `collect_blocks`).
Core.blocks.register<IDevRoadmapBlockData>({
  type: 'dev:roadmap',
  label: 'dev:block.roadmap.label',
  description: 'dev:block.roadmap.description',
  icon: Rocket,
  defaults: () => ({ title: '', filter: 'active', limit: '10' }),
  fields: [
    { key: 'title', kind: 'text', label: 'dev:block.roadmap.titleField', max: 150 },
    {
      key: 'filter',
      kind: 'choice',
      label: 'dev:block.roadmap.filterField',
      options: ['active', 'done', 'all'].map(value => ({
        value,
        label: `dev:block.roadmap.filter.${value}`,
      })),
    },
    {
      key: 'limit',
      kind: 'choice',
      label: 'dev:block.roadmap.limitField',
      options: ['5', '10', '20'].map(value => ({ value, label: value })),
    },
  ],
  summary: data => data.title,
  render: lazy(() => import('./blocks/DevRoadmapBlock.tsx')),
  sortOrder: 30,
});
