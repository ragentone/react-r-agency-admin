# Source Code Structure (`src/`)

This document explains the organization of the `src/` directory in the r‑agency mesh platform. Understanding this layout helps you locate where specific concerns (routing, state, UI, feature logic) live and how they are wired together.

## Overview

```
src/
├── assets/          # static assets (images, icons, SVGs)
├── core/            # platform‑core APIs, services, providers, shared logic
├── module/          # feature‑specific modules (admin, dev, file‑share, messenger)
├── router/          # routing configuration (TanStack React Router)
├── ui/              # shared UI components (base primitives, lib, shadcn)
├── App.tsx          # root application component (providers + router)
├── main.tsx         # entry point (DOM bootstrapping, global imports)
├── index.css        # global CSS styles
├── App.css          # component‑level styles for App
├── vite-env.d.ts    # Vite type declarations
└── vue-shims.d.ts   # Vue‑JSX shims (if needed)
```

Each top‑level folder has a distinct responsibility, described below.

---

## 1. `main.tsx` – Application Bootstrap

- Loads global stylesheet (`./index.css`).
- Imports global initialization side‑effects:
  - `@core/i18n/index.ts` – i18n setup
  - `@core/imports.ts` – core barrel (see Core section)
  - `@module/imports.ts` – module auto‑imports
  - `@apps/imports.ts` – apps auto‑imports
- Creates a React root (`createRoot`) and renders `<App />`.

## 2. `App.tsx` – Root Component

Wraps the application with a series of **providers** (state, theme, i18n, mesh, notifications, events, geo, etc.) using `ProviderComposer` from `@core/components`. Inside the providers:

- `<ApplicationProvider>` – placeholder for app‑level providers (currently empty).
- `<RouterProvider router={router} />` – supplies the TanStack router instance defined in `src/router/router.instance.ts`.
- The whole tree is guarded by `<ErrorBoundary>` from `@core/error` to catch runtime errors.

## 3. `core/` – Platform Core

The core contains all reusable building blocks that apps, modules, and the platform itself depend on. It is exported via a barrel file (`src/core/index.ts`) which re‑exports every sub‑folder plus the `Core` singleton and `CoreVariables`.

Key subfolders (brief purpose):

| Folder | Purpose |
|--------|---------|
| `account/` | User account management (profile, settings, etc.) |
| `admin/` | Admin‑panel utilities, routes, components |
| `app/` | Application lifecycle hooks (boot, mount, unmount) |
| `auth/` | Authentication logic (login, token handling, guards) |
| `blocks/` | CMS block definitions & registries |
| `call/` | Audio/video calling utilities (WebRTC, SIP) |
| `cms/` | Content‑management system (page, block, template handling) |
| `components/` | Generic, reusable UI components (buttons, modals, drawers, etc.) |
| `developer/` | Tools for developers (debug panels, logs, etc.) |
| `dock/` | Dock‑panel UI (side panels that can be pinned) |
| `editor/` | Rich‑text / code editor integrations |
| `error/` | Error boundaries, fallback UI, error reporting |
| `event/` | Global event bus (publish/subscribe) for loose‑coupled communication |
| `extension/` | Mechanisms for loading/registering extensions (plugins) |
| `friends/` | Social graph, friend requests, etc. |
| `geo/` | Geolocation services, maps, place lookup |
| `hooks/` | Custom React hooks shared across the codebase |
| `i18n/` | Internationalization (message loading, locale switching) |
| `layout/` | Layout components (header, footer, sidebar, etc.) |
| `media/` | Media handling (image upload, video playback, file previews) |
| `menu/` | Menu configuration (sidebar, context‑menus, toolbar) |
| `mesh/` | Wrapper around the r‑agency mesh client (GraphQL/REST) |
| `native/` | Native‑bridge wrappers (if targeting Capacitor/Electron) |
| `notify/` | Notification system (toast, snack bar, in‑app alerts) |
| `page/` | Page‑level abstractions (route‑based pages, layout containers) |
| `pages/` | Concrete page components (login, dashboard, settings, etc.) |
| `profile/` | User profile UI and data fetching |
| `provider/` | Context providers (theme, i18n, mesh, etc.) |
| `push/` | Push‑notification handling (Web Push, FCM) |
| `pwa/` | Progressive‑Web‑App specifics (service worker, manifest) |
| `search/` | Search infrastructure (indices, query parsing, results) |
| `theme/` | Theme management (light/dark, CSS variables, token system) |
| `utils/` | General‑purpose helper functions (date, string, object, validation) |
| `core.api.ts` | Definition of the `Core` singleton (registration points for router, menu, cms, blocks, search, links, roles, provider, etc.) |
| `core.variables.ts` | Runtime‑configurable variables (feature flags, environment‑derived values) |
| `types.ts` | Shared TypeScript interfaces and types used across core |

Apps and modules import from core using aliases like `@core/core.api.ts`, `@core/components/Button.tsx`, `@core/hooks/useAuth.ts`, etc.

---

## 4. `module/` – Feature Modules

Each module represents a self‑contained feature area that can be enabled/disabled independently. Like apps, modules expose a `module.tsx` entry point that is auto‑imported via `@module/imports.ts` (generated by `vite-plugin-auto-import`).

### Example structure (e.g., `src/module/file-share/`)

```
module/
└── file-share/
    ├── module.tsx          # registration point (similar to app.tsx)
    ├── components/         # UI specific to this feature
    ├── utils.ts            # feature‑specific helpers
    ├── const.ts            # constants (routes, roles, etc.)
    └── ...                 # other sub‑folders (store, hooks, etc.)
```

The `module.tsx` typically registers routes, menu items, providers, blocks, etc., with the Core system – mirroring the pattern used in `apps/`.

Current modules:
- `admin/` – administration dashboard & tools
- `dev/` – developer utilities (log viewer, performance monitor)
- `file-share/` – file upload/download, sharing links
- `messenger/` – real‑time chat / messaging

Each module’s `module.tsx` can be inspected for concrete registration examples.

---

## 5. `router/` – Routing (TanStack React Router)

The platform uses **TanStack React Router** (`@tanstack/react-router`) for type‑safe, file‑based routing with lazy‑loading.

Key files:
- `router.instance.ts` – creates and exports the router instance (`BaseRouter`) and the `createBaseRouter` function. It:
  - Initializes the mesh client.
  - Defines `registerRoute` to dynamically add routes from apps/modules.
  - Builds the route tree from the generated `routeTree.tsx` (produced by `@tanstack/router-plugin/vite`).
  - Configures not‑found and error components.
- `routes/` – contains the *file‑based* route definitions that the plugin picks up (not shown directly because they are generated).
- `components/` – UI components used by the router (layouts, outlets, etc.).
- `handlers.tsx` – route‑level loaders / actions (data fetching, redirects).
- `utils.tsx` – helpers for creating dynamic routes, parsing params, etc.
- `route.title.ts` – utilities for setting document title based on route meta.
- `types.ts` – TypeScript interfaces for route registration.

Apps and modules register routes by calling `Core.router.register` (from `@core/core.api.ts`) which internally uses the router’s `registerRoute` function. The router then incorporates them into the tree on the next render.

---

## 6. `ui/` – Shared UI Components

The `ui/` folder holds reusable, presentational components that are **not** tied to any specific feature.

### Subfolders

- `base/` – Low‑level, unstyled or minimally styled primitive components (e.g., `BaseButton`, `BaseInput`, `BaseModal`, `BaseAccordion`). Each primitive often ships with a corresponding React hook (`use.base-accordion.ts`) and a context file for state management.
- `lib/` – Utilities for styling, theming, or UI helpers (e.g., `cn.ts` for class‑name merging, `responsive.ts` for breakpoint helpers).
- `shad-cn/` – Components sourced from or inspired by [shadcn/ui](https://ui.shadcn.com/) (radix‑primitives based, fully accessible, tailwind‑styled). These provide ready‑made UI like `DropdownMenu`, `Command`, `Tooltip`, etc., adapted to the project’s design system.
- `index.ts` – barrel export that re‑exports the most commonly used UI primitives for convenience (`export * from './base'; export * from './lib'; export * from './shad-cn';`).

These components are consumed throughout core, modules, and apps via imports like `@ui/base/BaseButton.tsx` or `@ui/lib/cn.ts`.

---

## 7. `assets/` – Static Assets

Contains images, icons, SVGs, and other binary assets that are imported directly in JSX or CSS.

Notable files:
- `logo.png` – primary application logo.
- `react.svg` – React logo (used in documentation or demos).
- `404.webp` – illustration shown on the not‑found page.
- `dev.jpg` – background image for development screens (large file).

Assets are referenced with relative imports (`import logo from '@/assets/logo.png';`) or via URL in CSS.

---

## 8. Stylesheets

- `index.css` – Global CSS (reset, base typography, CSS variables for theme, layout).
- `App.css` – Styles scoped to the `<App>` component (mainly layout wrappers).
- These are imported in `main.tsx` (`./index.css`) and `App.tsx` (`./App.css`, `./index.css` again for good measure).

The platform heavily relies on **CSS variables** defined in `:root` (or `body`) for theming; these are updated by the `ThemeProvider` from `@core/theme`.

---

## 9. Type Declaration Files

- `vite-env.d.ts` – Vite‑specific declarations (e.g., `import.meta.env`).
- `vue-shims.d.ts` – Allows Vue JSX syntax in `.tsx` files (legacy support; can be removed if unused).

---

## How the Pieces Fit Together

1. **Bootstrap** (`main.tsx`) → loads globals and renders `<App />`.
2. **App** (`App.tsx`) → sets up all providers (theme, i18n, mesh, notifications, events, geo, etc.) and provides the router.
3. **Router** (`src/router/`) → holds the master route tree. Apps and modules call `Core.router.register` to inject their routes (pages, components) lazily loaded via `lazyPage`.
4. **Core** (`src/core/`) → supplies the registration API (`Core.router`, `Core.menu`, `Core.provider`, `Core.cms`, `Core.search`, `Core.blocks`, `Core.links`, `Core.roles`, etc.). Every app or module uses these APIs to plug into the platform.
5. **Modules** (`src/module/`) → similar to apps but represent optional feature bundles; they also register with Core.
6. **Apps** (`src/apps/`) → each app is a standalone plugin that registers its UI, routes, and capabilities with Core (see `docs/APPS_IMPLEMENTATION.md` for details).
7. **UI** (`src/ui/`) → provides the primitive building blocks used by core, modules, and apps to construct consistent interfaces.
8. **Assets** → static media referenced by components or CSS.

Because registration is **additive** and happens at startup, the platform can grow by simply adding new folders under `apps/` or `module/` without touching the core source code.

--- 

*Documentation generated on 2026-10-15.* 