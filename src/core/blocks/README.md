# Page blocks (`Core.blocks`)

Dynamic pages (admin → **Seiten verwalten**, public at `/p/<slug>`) are built from blocks.
Besides the built-in blocks (banner, text, image, cards …) every app can add its own.

An app block has two halves with the **same type name** `<app>:<name>`:

| Side | What it does |
|---|---|
| Backend (runtime) | Registers the **fields** – the page service validates / cleans them on save. Unknown types are refused. |
| Frontend (`app.tsx`) | Registers **label, icon, defaults, editor fields and the render component**. The component loads its own data through the app's own API. |

The page only stores the block **settings** (e.g. "6 entries of the last month"), never the
data itself – the block always shows live data.

## 1. Backend – `boot.loader.ts` of the app

```ts
canBus.channel('site-page').listen('collect_blocks', (args, next) => {
  args.data.collector.add('timeline:best', {
    title: { kind: 'text', max: 150 },
    period: { kind: 'enum', values: ['month', 'week', 'year', 'all'] }, // first = default
    limit: { kind: 'enum', values: ['6', '3', '9', '12'] },
    showMore: { kind: 'bool', default: true },
  });
  next();
});
```

Field kinds: `text` (max), `html` (max), `url`, `image`, `enum` (values), `bool` (default),
`items` (max, fields). See `runtime/src/apps/site-page/types/blocks.ts`.

## 2. Frontend – `app.tsx` of the app

```ts
import { Core } from '@core/core.api.ts';
import { Trophy } from 'lucide-react';
import { lazy } from 'react';

Core.blocks.register({
  type: 'timeline:best',
  label: 'timeline:block.best.label',
  description: 'timeline:block.best.description',
  icon: Trophy,
  defaults: () => ({ title: '', period: 'month', limit: '6', showMore: true }),
  fields: [
    { key: 'title', kind: 'text', label: 'timeline:block.best.title', max: 150 },
    {
      key: 'period',
      kind: 'choice',
      label: 'timeline:block.best.period',
      options: [{ value: 'week', label: 'timeline:block.best.week' } /* … */],
    },
    { key: 'showMore', kind: 'toggle', label: 'timeline:block.best.showMore' },
  ],
  summary: data => String(data.title ?? ''),
  // Own chunk – only loaded on pages that use the block.
  render: lazy(() => import('./blocks/TimelineBestBlock.tsx')),
});
```

Editor field kinds: `text`, `textarea`, `url`, `image` (upload), `choice`, `toggle` – keep the
keys and allowed values in sync with the backend.

The render component gets `{ data, id, first }`. It sits in the reading column (720 px) –
set `fullWidth: true` to span the page like the banner.

Reference implementation: `apps/timeline/blocks/TimelineBestBlock.tsx` and
`runtime/src/apps/timeline/boot.loader.ts`.
