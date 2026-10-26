import type { RoleQuery } from '@core/auth/roles/roles.ts';
import type { IUserMetaData } from '@core/auth/types/config.ts';
import type { ComponentType } from 'react';

export type DockAlign = 'left' | 'center' | 'right';

/**
 * Fixed positions: `first` / `last` win over any `sortOrder` of other entries (logo left,
 * menu first on the right, scroll-top last on the right).
 */
export const DOCK_ORDER_FIRST = Number.MIN_SAFE_INTEGER;
export const DOCK_ORDER_LAST = Number.MAX_SAFE_INTEGER;

interface IDockEntryBase {
  /** Unique id – registering the same id again replaces the entry. */
  id: string;
  /** Position in the bar (default `center`). */
  align?: DockAlign;
  /** Order inside its group, left → right, ascending (default 0). */
  sortOrder?: number;
  tooltip?: string;
}

/** Simple icon button – the dock renders it. */
export interface IDockButtonEntry extends IDockEntryBase {
  /** Accessible label: i18n key (`ns:key`) or plain text. */
  label: string;
  icon: ComponentType<{ className?: string }>;
  onClick: () => void;
  /** `primary` = filled, the main action of the page (e.g. "new post"). */
  variant?: 'default' | 'primary';
  /** Number (count, 99+) or `true` (dot) in the top right corner. */
  badge?: number | boolean;
  active?: boolean;
  disabled?: boolean;
}

/** Own component (e.g. the menu trigger with avatar + drawer). May return `null`. */
export interface IDockComponentEntry extends IDockEntryBase {
  component: ComponentType;
}

export type IDockEntry = IDockButtonEntry | IDockComponentEntry;

/** Who sees a dock menu item. */
export type DockMenuVisibility = 'always' | 'authenticated' | 'guest';

/** Context handed to dynamic values (`to`, `onClick`). */
export interface IDockMenuContext {
  authorized: boolean;
  user?: IUserMetaData | null;
  pathname: string;
}

/**
 * Entry of the dock dropdown menu (left in the dock). Action – one of (or combined, run in
 * this order): `onClick`, `emit` (custom event, `Core.events.custom`), `to` (navigation).
 */
export interface IDockMenuItem {
  /** Unique id – registering the same id again replaces the item. */
  id: string;
  /** Translation key (`ns:key`) or plain text. */
  label: string;
  /** Second line (`ns:key` or plain). */
  description?: string;
  icon?: ComponentType<{ className?: string }>;
  /** `always` (default), `authenticated` = signed-in users only, `guest` = signed-out only. */
  visibility?: DockMenuVisibility;
  /** Required roles, e.g. `'admin:user'` or `['admin:user', 'dev:user']`. Implies signed in. */
  roles?: RoleQuery;
  /** Route to navigate to, or a resolver (e.g. own profile). */
  to?: string | ((ctx: IDockMenuContext) => string | undefined);
  /** Custom action. */
  onClick?: (ctx: IDockMenuContext) => void;
  /** Name of a custom event (`Core.events.custom`) emitted on click. */
  emit?: string;
  /** Payload of the emitted event. */
  payload?: unknown;
  /** Items with another group are separated by a line. Groups are sorted by their first item. */
  group?: string;
  /** Lower first. */
  sortOrder?: number;
  /** Red text (e.g. logout). */
  destructive?: boolean;
}

export interface IDockManager {
  /** Register (or replace) an entry. Returns an unregister function. */
  register(entry: IDockEntry): () => void;
  unregister(id: string): void;
  getEntries(): IDockEntry[];
  /** Register (or replace) an item of the dock dropdown menu. Returns an unregister function. */
  registerMenuItem(item: IDockMenuItem): () => void;
  unregisterMenuItem(id: string): void;
  /** All dropdown items, sorted (unfiltered – see `useDockMenu`). */
  getMenuItems(): IDockMenuItem[];
  /** Hide the dock (e.g. fullscreen pages). Nested calls are counted. */
  hide(): () => void;
  isHidden(): boolean;
  subscribe(listener: () => void): () => void;
  /** Internal snapshot version for `useSyncExternalStore`. */
  getVersion(): number;
}
