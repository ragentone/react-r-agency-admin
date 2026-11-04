import type { IPluginNavigateOptions, PluginSearch } from './plugin.types';

interface INavigateTarget {
  pathname: string;
  search: PluginSearch;
  replace: boolean;
}

let navigateFn: ((target: INavigateTarget) => void) | null = null;

/** Set once by the router (`router/router.instance.ts`). Plugins navigate through it. */
export const setPluginNavigate = (fn: (target: INavigateTarget) => void) => {
  navigateFn = fn;
};

/**
 * Navigates inside the app. `to` is either an absolute path (`/plugin/develop/info`) or a page of
 * this plugin (`info` → `/plugin/<pluginId>/info`). `options.path` adds segments after the page,
 * `options.search` adds query parameters. Logs an error before the router is ready.
 */
export const navigatePlugin = (pluginId: string, to: string, options: IPluginNavigateOptions = {}) => {
  if (!navigateFn) {
    console.error('[plugin] navigate called before the router is ready', to);
    return;
  }
  const base = to.startsWith('/') ? to : `/plugin/${pluginId}/${to}`;
  const segments = (options.path ?? []).map(segment => encodeURIComponent(segment));
  const pathname = segments.length > 0 ? [base.replace(/\/$/, ''), ...segments].join('/') : base;
  navigateFn({ pathname, search: options.search ?? {}, replace: options.replace ?? false });
};
