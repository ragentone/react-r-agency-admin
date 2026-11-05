import { useRouterState } from '@tanstack/react-router';
import { useContext, useMemo, useSyncExternalStore } from 'react';

import { ThemeContext } from '@core/theme/components/theme.context.ts';

import type { IPluginAppInfo, IPluginRoute, IPluginTheme, IPluginViewport, PluginBreakpoint } from './plugin.types';

/** Same min-width values as the host's `use-breakpoints`. Largest first: the first match is the current one. */
const BREAKPOINT_QUERIES: [PluginBreakpoint, string][] = [
  ['2xl', '(min-width: 1536px)'],
  ['xl', '(min-width: 1280px)'],
  ['lg', '(min-width: 1024px)'],
  ['md', '(min-width: 768px)'],
  ['sm', '(min-width: 640px)'],
];

const readBreakpoint = (): PluginBreakpoint | null =>
  BREAKPOINT_QUERIES.find(([, query]) => window.matchMedia(query).matches)?.[0] ?? null;

const subscribeBreakpoint = (listener: () => void): (() => void) => {
  const lists = BREAKPOINT_QUERIES.map(([, query]) => window.matchMedia(query));
  lists.forEach(mql => mql.addEventListener('change', listener));
  return () => lists.forEach(mql => mql.removeEventListener('change', listener));
};

/** Current breakpoint and flags. Mobile first: `isMobile` is true below `md`. Hook: re-renders on change. */
export const usePluginViewport = (): IPluginViewport => {
  const breakpoint = useSyncExternalStore(subscribeBreakpoint, readBreakpoint, () => null);
  return useMemo(
    () => ({
      breakpoint,
      isMobile: breakpoint === null || breakpoint === 'sm',
      isDesktop: breakpoint === 'lg' || breakpoint === 'xl' || breakpoint === '2xl',
    }),
    [breakpoint]
  );
};

/** Path and query of the current page. Hook: re-renders on navigation. */
export const usePluginRoute = (): IPluginRoute => {
  const pathname = useRouterState({ select: state => state.location.pathname });
  const search = useRouterState({ select: state => state.location.search });
  return useMemo(
    () => ({ pathname, search: { ...(search as unknown as Record<string, unknown>) } }),
    [pathname, search]
  );
};

const DARK_QUERY = '(prefers-color-scheme: dark)';

const subscribeSystemDark = (listener: () => void): (() => void) => {
  const mql = window.matchMedia(DARK_QUERY);
  mql.addEventListener('change', listener);
  return () => mql.removeEventListener('change', listener);
};

const readSystemDark = (): boolean => window.matchMedia(DARK_QUERY).matches;

/** Light or dark mode in use, plus the user's setting. Hook: re-renders on change. */
export const usePluginTheme = (): IPluginTheme => {
  const { theme } = useContext(ThemeContext);
  const systemDark = useSyncExternalStore(subscribeSystemDark, readSystemDark, () => false);
  return useMemo(
    () => ({
      mode: theme === 'system' ? (systemDark ? 'dark' : 'light') : theme,
      preference: theme,
    }),
    [theme, systemDark]
  );
};

/** Read-only facts about the running build. */
export const pluginAppInfo: IPluginAppInfo = {
  environment: import.meta.env.PROD ? 'production' : 'development',
};
