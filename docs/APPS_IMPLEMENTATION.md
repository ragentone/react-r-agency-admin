# Apps Implementation in the r-agency Mesh Platform

## Overview

Each app in the `apps/` directory is a self-contained plugin that extends the core functionality of the r-agency mesh platform. Apps follow a consistent pattern: they expose an `app.tsx` entry point that registers various capabilities with the Core system (`@core/core.api.ts`).

## Directory Structure

```
apps/
├── chat/
├── file-transfer/
├── forum/
├── meet/
├── news/
├── resume/
├── shop/
├── shop-v2/
├── test/
├── timeline/
└── imports.ts   # auto-generated, imports each app's app.tsx
```

Each app folder typically contains:
- `app.tsx` – entry point that registers the app with Core
- `pages/` – React components for routes (optional)
- `components/` – shared UI components
- `provider/` – React Context providers (if needed)
- `store/` – state management (e.g., Zustand stores)
- `blocks/` – CMS block registrations
- `utils/` – helper constants and types
- `const.ts` – route/path constants
- `legal/` – HTML files for links (optional)

## The `app.tsx` Entry Point

The `app.tsx` file is the central registration point. It imports the Core API and uses it to extend the platform:

```tsx
import { Core } from '@core/core.api.ts';
// ... other imports (components, providers, utils, etc.)

// Register routes
Core.router.register({
  path: SOME_ROUTE,
  target: 'index',
  page: SomePageComponent,
  meta: { title: 'App Name' },
});

// Register menu entries
Core.menu.register({
  id: 'app-id',
  label: 'app:menu.label',
  description: 'app:menu.description',
  icon: SomeIcon,
  to: SOME_ROUTE,
  section: 'apps',
  audience: 'user' | 'all',
  roles: [...],
  sortOrder: 10,
});

// Register a provider (e.g., for state or auth)
Core.provider.add({
  alias: 'app-id',
  target: 'route',
  sortOrder: 0,
  config: { provider: AppProvider },
});

// Register CMS components (blocks that appear in the page editor)
Core.cms.register('block-name', {
  component: SomeBlockComponent,
  sortOrder: 0,
  position: 'after',
});

// Register search groups and handlers
Core.search.registerGroup({
  name: 'app-id',
  label: 'search:groups.app-id',
  icon: SomeIcon,
  sortOrder: 10,
});
Core.search.registerHandler({
  emit: 'app-id::some-action',
  handle: (item) => { /* ... */ },
});

// Register reusable UI blocks (for dynamic page composition)
Core.blocks.register<IAppBlockData>({
  type: 'app-id:block-type',
  label: 'app-id:block.label',
  description: 'app-id:block.description',
  icon: SomeIcon,
  defaults: () => ({ /* default values */ }),
  fields: [/* field definitions */],
  summary: data => data.someField,
  render: lazy(() => import('./blocks/SomeBlock.tsx')),
  sortOrder: 5,
});

// Register links (e.g., legal documents)
Core.links.registerGroup('app-id', { label: 'app-id:links.group', sortOrder: 50 });
Core.links.register({
  id: 'app-id:terms',
  kind: 'custom',
  group: 'app-id',
  icon: FileText,
  label: 'app-id:links.terms',
  description: 'app-id:links.termsDescription',
  content: { type: 'html', html: htmlFromModules(importMeta.glob('./legal/*.html', { query: '?raw', import: 'default' }), 'terms') },
  updatedAt: '2026-10-15',
});

// Register roles (for admin UI)
Core.roles.registerGroup('app-id', { label: 'app-id:roles.group', sortOrder: 50 });
Core.roles.register({
  role: APP_ROLE_MODERATOR,
  label: 'app-id:roles.moderator.label',
  description: 'app-id:roles.moderator.description',
  group: 'app-id',
});
```

### Key Registration Points

| Method | Purpose |
|--------|---------|
| `Core.router.register` | Defines URL routes (`path`) and maps them to lazy-loaded page components (`page`). |
| `Core.menu.register` | Adds entries to the sidebar/app menu, with optional sub-items, icons, and access control. |
| `Core.provider.add` | Provides React context (e.g., authentication, theme) that wraps routes or the whole app. |
| `Core.cms.register` | Registers components that can be inserted into CMS‑managed areas (e.g., page header/footer). |
| `Core.search.registerGroup` / `registerHandler` | Enables global search to find app‑specific content and define actions on search results. |
| `Core.blocks.register` | Allows the app to provide reusable blocks that page editors can drop into dynamic pages. |
| `Core.links.register` | Manages collections of links (e.g., legal, documentation) shown in the footer or settings. |
| `Core.roles.register` | Defines role‑based access control for administrative interfaces (`/admin`). |

## How Apps Are Loaded

- The Vite plugin `vite-plugin-auto-import` scans the `apps/` directory and generates `apps/imports.ts`, which contains a series of `import "./<app>/app.tsx";` statements.
- During application startup (both `dev` and `build`), each imported `app.tsx` executes, performing its registrations with the Core system.
- Because registrations are additive, the platform accumulates routes, menu items, providers, etc., from all apps without requiring changes to the core code.

## Example: Minimal App (`shop/app.tsx`)

A very simple app might only register a route and a menu entry:

```tsx
import { Core } from '@core/core.api.ts';
import { lazyPage } from '@core/page/lazy.page.ts';
import { ShoppingBag } from 'lucide-react';
import { SHOP_ROUTE } from './const';

const ShopPage = lazyPage(() => import('./pages/ShopPage.tsx').then(m => m.ShopPage), 'ShopPage');

Core.router.register({
  path: SHOP_ROUTE,
  target: 'index',
  page: ShopPage,
  meta: { title: 'Shop' },
});

Core.menu.register({
  id: 'shop',
  label: 'shop:menu.label',
  description: 'shop:menu.description',
  icon: ShoppingBag,
  to: SHOP_ROUTE,
  section: 'apps',
  audience: 'all',
  sortOrder: 15,
});
```

## Example: Feature‑Rich App (`timeline/app.tsx`)

A more complex app demonstrates many registration points:
- Routes for entry details and page creation/editing
- Menu with sub‑actions (compose, manager)
- Provider for timeline‑specific state
- CMS components (`page-index`, `page-profile`)
- Search integration (forwarding from search to entry/page)
- Custom blocks (`timeline:best`, `timeline:page`)
- Links to legal documents
- Role definitions (moderator, admin)

## Best Practices

1. **Lazy‑load pages** – Use `lazyPage` from `@core/page/lazy.page.ts` to split code per route.
2. **Keep `app.tsx` focused on registration** – Move UI logic into separate components (`pages/`, `components/`, `blocks/`).
3. **Define constants** – Put route strings, role IDs, and block types in a `const.ts` file to avoid typos.
4. **Provide TypeScript interfaces** – Export types (e.g., `ITimelinePageBlockData`) from a `types.ts` or within the app folder so other apps or core can reference them if needed.
5. **Use the Core APIs** – Avoid direct DOM manipulation or reliance on global state; interact with the platform exclusively through the Core registration points.
6. **Handle optional features** – Guard registrations with environment variables or feature flags if the app should only be active in certain modes.
7. **Add documentation** – Include a README inside the app folder describing its purpose, configuration, and extension points.

## Where to Find Examples

- **Simple:** `apps/shop/app.tsx`
- **Medium:** `apps/file-transfer/app.tsx` (if exists)
- **Complex:** `apps/timeline/app.tsx`, `apps/forum/app.tsx`, `apps/meet/app.tsx`

These files illustrate the full spectrum of what an app can contribute to the mesh platform.

## Summary

Apps are plug‑in modules that declaratively extend the platform via the Core registration API. By placing an `app.tsx` in the `apps/` folder and letting the auto‑import mechanism load it, developers can add new routes, menu items, providers, CMS blocks, search capabilities, reusable UI blocks, links, and roles—all without touching the core source code. This keeps the platform extensible, maintainable, and clear about where each feature originates.

--- 

*Documentation generated on 2026-10-15.* 