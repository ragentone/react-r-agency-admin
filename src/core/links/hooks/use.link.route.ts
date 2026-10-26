import { CoreVariables } from '@core/core.variables.ts';
import { useRouter, useRouterState } from '@tanstack/react-router';
import { useCallback } from 'react';

import { getLinkPath, LINK_SEARCH_KEY } from '../const.ts';

type AppRouter = ReturnType<typeof useRouter>;

/** Navigates to the link page `/link/<id>` (regular page, new history entry). */
export const openLinkPage = (
  router: AppRouter,
  id: string,
  options: { replace?: boolean } = {}
) => {
  const path = getLinkPath(id);
  if (router.state.location.pathname === path) return;
  // Runtime route → not in the generated route types, hence the cast.
  void router.navigate({ to: path as '/', replace: options.replace });
};

/** Leaves a link page: back in the history (opened inside the app) or to the start page. */
export const closeLinkPage = (router: AppRouter) => {
  if (router.history.canGoBack()) {
    router.history.back();
    return;
  }
  void router.navigate({ to: CoreVariables.routePathHome, replace: true });
};

/**
 * Link page navigation. `legacyId` is only set for old drawer links (`?link=<id>`) –
 * `LinkRouteHost` redirects them to `/link/<id>`.
 */
export const useLinkRoute = () => {
  const router = useRouter();
  const legacyId = useRouterState({
    select: state =>
      ((state.location.search as Record<string, unknown>)[LINK_SEARCH_KEY] as string | undefined) ??
      null,
  });

  const openLink = useCallback(
    (id: string, options?: { replace?: boolean }) => openLinkPage(router, id, options),
    [router]
  );
  const close = useCallback(() => closeLinkPage(router), [router]);

  return { legacyId, openLink, close };
};
