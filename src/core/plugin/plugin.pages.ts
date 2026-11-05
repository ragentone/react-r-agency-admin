import { useSyncExternalStore } from 'react';

import type {
  IPluginPageOptions,
  PluginPageAudience,
  PluginPageComponent,
  PluginPageDisplay,
  PluginPageWidth,
} from './plugin.types';
import type { IPluginUserState } from './plugin.user';

export interface IPluginPageEntry {
  component: PluginPageComponent;
  display: PluginPageDisplay;
  width: PluginPageWidth;
  scrollable: boolean;
  audience: PluginPageAudience;
  userRoles: string[];
}

/** Pages per `<pluginId>/<path>`. Replaced on change, never mutated (for useSyncExternalStore). */
let pages: Record<string, IPluginPageEntry> = {};
const listeners = new Set<() => void>();

const notify = () => listeners.forEach(listener => listener());
const keyOf = (pluginId: string, path: string) => `${pluginId}/${path}`;

/** Adds or replaces a page of a plugin. */
export const registerPluginPage = (
  pluginId: string,
  path: string,
  component: PluginPageComponent,
  options?: IPluginPageOptions
) => {
  const entry: IPluginPageEntry = {
    component,
    display: options?.display ?? 'route',
    width: options?.width ?? 'default',
    scrollable: options?.scrollable ?? false,
    audience: options?.audience ?? 'all',
    userRoles: options?.userRoles ?? [],
  };
  pages = { ...pages, [keyOf(pluginId, path)]: entry };
  notify();
};

/** Removes every page of a plugin (deactivated, failed to load, or reloaded). */
export const clearPluginPages = (pluginId: string) => {
  const prefix = `${pluginId}/`;
  pages = Object.fromEntries(Object.entries(pages).filter(([key]) => !key.startsWith(prefix)));
  notify();
};

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

/** Page of a plugin with its display options, or `undefined` when it does not exist or the user may not open it. */
export const usePluginPage = (pluginId: string, path: string): IPluginPageEntry | undefined =>
  useSyncExternalStore(subscribe, () => pages[keyOf(pluginId, path)]);

/**
 * Whether the current user may open a page.
 * - `allowed`: no restriction, or the user matches `audience` and `userRoles`.
 * - `denied`: the user does not match; the host shows an error message instead of the page.
 * - `loading`: the login state is not known yet, so the host waits instead of deciding.
 * `userRoles` is checked as "any of these roles" (same as the menu entry `roles`).
 */
export type PluginPageAccess = 'allowed' | 'denied' | 'loading';

export const pagePermission = (
  entry: Pick<IPluginPageEntry, 'audience' | 'userRoles'>,
  user: IPluginUserState
): PluginPageAccess => {
  const restricted = entry.audience !== 'all' || entry.userRoles.length > 0;
  if (!restricted) return 'allowed';
  if (user.status === 'loading') return 'loading';
  if (entry.audience === 'user' && !user.loggedIn) return 'denied';
  if (entry.audience === 'guest' && user.loggedIn) return 'denied';
  if (entry.userRoles.length > 0 && !user.can(entry.userRoles.join(' || '))) return 'denied';
  return 'allowed';
};
