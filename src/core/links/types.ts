import type { RoleQuery } from '@core/auth/roles/roles.ts';
import type { IMenuContext, MenuAudience, MenuIcon } from '@core/menu/types.ts';
import type { ComponentType } from 'react';

/** What a link is about – sets the default group and icon. */
export type LinkKind = 'imprint' | 'terms' | 'privacy' | 'custom';

/** Props of a content component rendered on the link page (`/link/<id>`). */
export interface ILinkContentProps {
  link: ILinkEntry;
  /** Leaves the link page (back in the history or to the start page). */
  close: () => void;
}

export type LinkContentComponent = ComponentType<ILinkContentProps>;

/**
 * Content of a link:
 * - `component` – React component, rendered on the link page.
 * - `lazy` – component loaded on first open (own chunk).
 * - `html` – HTML string or (async) loader per language; sanitized before rendering.
 * - `url` – external page, opened in a new tab (no link page).
 */
export type LinkContent =
  | { type: 'component'; component: LinkContentComponent }
  | { type: 'lazy'; load: () => Promise<{ default: LinkContentComponent }> }
  | { type: 'html'; html: string | ((lang: string) => string | Promise<string>) }
  | { type: 'url'; url: string };

export interface ILinkEntry {
  /**
   * Unique id – also the route (`/link/<id>`). Registering the same id again replaces
   * the entry. Apps should prefix their ids (`timeline:terms`).
   */
  id: string;
  /** Default `custom`. */
  kind?: LinkKind;
  /** Translation key (`ns:key`) or plain text. */
  label: string;
  /** Second line in the links menu (`ns:key` or plain). */
  description?: string;
  /** Defaults to an icon for the kind. */
  icon?: MenuIcon;
  /**
   * Group in the links menu. Default: `legal` for imprint / terms / privacy, `links` otherwise.
   * Apps can register their own group (`Core.links.registerGroup('timeline', …)`).
   */
  group?: string;
  content: LinkContent;
  /** Lower first (within the group). */
  sortOrder?: number;
  /** Who sees the link (default `all`). */
  audience?: MenuAudience;
  /** Required roles, e.g. `'admin:user'`. Implies a logged-in user. */
  roles?: RoleQuery;
  /** Additional visibility rule, e.g. only inside an app: `ctx => ctx.pathname.startsWith('/timeline')`. */
  visible?: (ctx: IMenuContext) => boolean;
  /** "Last updated" shown under the page title (ISO date or plain text). */
  updatedAt?: string;
}

export interface ILinkGroupConfig {
  /** Translation key (`ns:key`) or plain text. */
  label: string;
  sortOrder: number;
}

export interface ILinkManager {
  /** Register (or replace) a link. Returns an unregister function. */
  register(entry: ILinkEntry): () => void;
  unregister(id: string): void;
  get(id: string): ILinkEntry | undefined;
  /** All links, sorted by `sortOrder`. */
  getEntries(): ILinkEntry[];
  /** Register (or replace) a group heading of the links menu. */
  registerGroup(id: string, config: ILinkGroupConfig): void;
  getGroups(): Record<string, ILinkGroupConfig>;
  /** Opens a link: page `/link/<id>` or – for `url` links – a new tab. */
  open(id: string): void;
  subscribe(listener: () => void): () => void;
  /** Internal snapshot version for `useSyncExternalStore`. */
  getVersion(): number;
}
