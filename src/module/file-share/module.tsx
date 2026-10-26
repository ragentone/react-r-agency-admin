import { Core } from '@core/core.api.ts';
import { lazyPage } from '@core/page/lazy.page.ts';
import { FolderDown } from 'lucide-react';
import { lazy } from 'react';

import type { IFileShareLatestBlockData } from './blocks/FileShareLatestBlock';
import { FILE_SHARE_LINK_ROUTE, FILE_SHARE_ROUTE } from './const';

// Own chunk. Backend: runtime apps/file-share.
const PageFileShare = lazyPage(
  () => import('./pages/PageFileShare.tsx').then(m => m.PageFileShare),
  'PageFileShare'
);
const PageFileShareLink = lazyPage(
  () => import('./pages/PageFileShareLink.tsx').then(m => m.PageFileShareLink),
  'PageFileShareLink'
);

// Public page – the backend only sends the files the caller may see.
Core.router.register({
  path: FILE_SHARE_ROUTE,
  target: 'index',
  page: PageFileShare,
  meta: { title: 'Downloads' },
});

// Share link: anybody with the link may download the file (any visibility, no login).
Core.router.register({
  path: FILE_SHARE_LINK_ROUTE,
  target: 'index',
  page: PageFileShareLink,
  meta: { title: 'Download' },
});

Core.menu.register({
  id: 'file-share',
  label: 'file-share:menu.label',
  description: 'file-share:menu.description',
  icon: FolderDown,
  to: FILE_SHARE_ROUTE,
  section: 'main',
  audience: 'all',
  sortOrder: 55,
});

// ---- Page block (core block registry): newest downloads on dynamic pages (admin → pages).
// Backend counterpart: runtime apps/file-share/boot.loader.ts (`site-page` → `collect_blocks`).
Core.blocks.register<IFileShareLatestBlockData>({
  type: 'file-share:latest',
  label: 'file-share:block.latest.label',
  description: 'file-share:block.latest.description',
  icon: FolderDown,
  defaults: () => ({ title: '', limit: '5', showDescription: true }),
  fields: [
    { key: 'title', kind: 'text', label: 'file-share:block.latest.titleField', max: 150 },
    {
      key: 'limit',
      kind: 'choice',
      label: 'file-share:block.latest.limitField',
      options: ['3', '5', '10', '20'].map(value => ({ value, label: value })),
    },
    { key: 'showDescription', kind: 'toggle', label: 'file-share:block.latest.descriptionField' },
  ],
  summary: data => data.title,
  render: lazy(() => import('./blocks/FileShareLatestBlock.tsx')),
  sortOrder: 20,
});
