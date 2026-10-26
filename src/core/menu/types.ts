import type { RoleQuery } from '@core/auth/roles/roles.ts';
import type { IUserMetaData } from '@core/auth/types/config.ts';
import type { ComponentType, ReactNode, SVGProps } from 'react';

/** Who sees an entry: everybody, only logged-in users or only guests. */
export type MenuAudience = 'all' | 'user' | 'guest';

/** Built-in sections (apps may use their own string, it gets rendered as its own group). */
export type MenuSection = 'main' | 'apps' | 'account' | (string & {});

/** Context handed to dynamic entry values (`to`, `visible`). */
export interface IMenuContext {
  authorized: boolean;
  user?: IUserMetaData | null;
  pathname: string;
}

export type MenuIcon = ComponentType<SVGProps<SVGSVGElement> & { strokeWidth?: number }>;

export interface IMenuEntry {
  /** Unique id – registering the same id again replaces the entry. */
  id: string;
  /** Translation key (`ns:key`, e.g. `chat:menu.label`) or plain text. */
  label: string;
  /** Optional second line in the drawer (also `ns:key` or plain). */
  description?: string;
  icon: MenuIcon;
  /** Icon of the active state (defaults to `icon` with a heavier stroke). */
  activeIcon?: MenuIcon;
  /** Target path, or a resolver for user dependent links (e.g. own profile). */
  to?: string | ((ctx: IMenuContext) => string | undefined);
  /** Instead of navigating (e.g. open a dialog). */
  onSelect?: (ctx: IMenuContext) => void;
  /** Lower first. */
  sortOrder?: number;
  section?: MenuSection;
  audience?: MenuAudience;
  /** Required roles, e.g. `'admin:user || dev:user'` (see `hasRoles`). Implies a logged-in user. */
  roles?: RoleQuery;
  /** Match only the exact path (default for `/`). */
  exact?: boolean;
  /** Custom active check. */
  match?: (pathname: string) => boolean;
  /** Additional visibility rule. */
  visible?: (ctx: IMenuContext) => boolean;
  /** React hook returning a badge (count or short text). Called inside the item component. */
  useBadge?: () => number | string | null | undefined;
  /** Render something custom right of the label in the drawer / expanded sidebar. */
  trailing?: ReactNode;
  /**
   * Sub entries (one level). The parent may have no `to` / `onSelect` – then it only opens
   * the group. Drawer / expanded sidebar: collapsible list, icon rail: popover.
   * `section` of children is ignored, they are sorted by their `sortOrder`.
   * Other modules can add children to a registered group with `parent` (see below).
   */
  children?: IMenuEntry[];
  /**
   * Id of a group entry this entry is nested in (e.g. `'user'`). Lets modules add their entry
   * to a group registered elsewhere. `section` is then ignored. Falls back to a top-level entry
   * while no entry with that id is registered.
   */
  parent?: string;
  /**
   * How a group (entry with children) is shown:
   * - `inline` (default) – collapsible list in drawer / sidebar, popover in the icon rail.
   * - `drawer` – one row in the main menu that opens the children in the bottom drawer
   *   (centered, `drawerHeader` on top). Keeps the main menu short.
   */
  display?: 'inline' | 'drawer';
  /**
   * `display: 'inline'`: group starts expanded (until the user collapses it – remembered per
   * device). Default: only expanded when a child matches the route.
   */
  defaultOpen?: boolean;
  /** `display: 'drawer'`: rendered above the children in that drawer (e.g. the user card). */
  drawerHeader?: ComponentType<IMenuGroupDrawerHeaderProps>;
}

export interface IMenuGroupDrawerHeaderProps {
  ctx: IMenuContext;
  /** Closes the group drawer and the main menu. */
  close: () => void;
}

/** Where a menu component is rendered. */
export type MenuComponentVariant = 'drawer' | 'sidebar' | 'rail';

export interface IMenuComponentProps {
  /** `drawer` = mobile drawer, `sidebar` = expanded desktop sidebar (xl), `rail` = icon rail (md–xl). */
  variant: MenuComponentVariant;
  ctx: IMenuContext;
  /** Closes the drawer (no-op in the sidebar). */
  close: () => void;
}

/** A plain component inside the menu (language switch, theme switch, promo card …). */
export interface IMenuComponentEntry {
  /** Unique id – registering the same id again replaces the component. */
  id: string;
  component: ComponentType<IMenuComponentProps>;
  /**
   * `section` = between the entries of `section`, `footer` = area at the bottom of drawer / sidebar
   * (default), `settings` = settings drawer on the right (language, theme …).
   */
  placement?: 'section' | 'footer' | 'settings';
  section?: MenuSection;
  /** Lower first (shares the order with the entries of the same section). */
  sortOrder?: number;
  audience?: MenuAudience;
  /** Required roles, e.g. `'admin:user || dev:user'` (see `hasRoles`). Implies a logged-in user. */
  roles?: RoleQuery;
  visible?: (ctx: IMenuContext) => boolean;
  /** Not rendered in these variants (e.g. `['rail']` when it needs a label). */
  hideIn?: MenuComponentVariant[];
  /**
   * `placement: 'settings'` only: React hook – truthy → blinking dot on the settings trigger
   * (dock / rail / sidebar), e.g. "new app version available". Called while the trigger is mounted.
   */
  useAttention?: () => boolean | null | undefined;
}

export interface IMenuSectionConfig {
  /** Translation key or plain text. */
  label: string;
  sortOrder: number;
  /**
   * How the section is shown:
   * - `inline` (default) – heading + all entries directly in the menu.
   * - `drawer` – only one trigger row in the menu, the entries open as a grid in a bottom
   *   drawer (centered). Keeps the main menu short (e.g. the apps).
   */
  display?: 'inline' | 'drawer';
  /** `display: 'drawer'`: icon of the trigger (default: grid). */
  icon?: MenuIcon;
  /** `display: 'drawer'`: second line of the trigger / drawer title (`ns:key` or plain). */
  description?: string;
}

export interface IMenuManager {
  /** Register (or replace) an entry. Returns an unregister function. */
  register(entry: IMenuEntry): () => void;
  unregister(id: string): void;
  /** Register (or replace) a plain component. Returns an unregister function. */
  registerComponent(entry: IMenuComponentEntry): () => void;
  unregisterComponent(id: string): void;
  getComponents(): IMenuComponentEntry[];
  /** Register (or replace) a section heading. */
  registerSection(id: string, config: IMenuSectionConfig): void;
  getEntries(): IMenuEntry[];
  getSections(): Record<string, IMenuSectionConfig>;
  /** Hide the whole main menu (e.g. fullscreen pages). Nested calls are counted. */
  hide(): () => void;
  isHidden(): boolean;
  subscribe(listener: () => void): () => void;
  /** Internal snapshot version for `useSyncExternalStore`. */
  getVersion(): number;
}
