import { useSyncExternalStore } from 'react';

import type {
  IPluginPageOptions,
  PluginPageComponent,
  PluginPageDisplay,
  PluginPageWidth,
} from './plugin.types';

export interface IPluginPageEntry {
  component: PluginPageComponent;
  display: PluginPageDisplay;
  width: PluginPageWidth;
  scrollable: boolean;
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
