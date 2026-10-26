import { CoreVariables } from '@core/core.variables.ts';
import { useRouter, useRouterState } from '@tanstack/react-router';
import { useCallback } from 'react';

import { getProfilePath, PROFILE_SEARCH_KEY } from '../const';

type AppRouter = ReturnType<typeof useRouter>;

/**
 * Navigates to the profile page `/profile/<id>` (regular page, no overlay).
 * Name kept for compatibility – also usable outside of React (e.g. search).
 */
export const openProfileDialog = (router: AppRouter, userId: string) => {
  if (router.state.location.pathname === getProfilePath(userId)) return;
  // Runtime route → not in the generated route types, hence the cast.
  void router.navigate({ to: getProfilePath(userId) as '/' });
};

/** Alias with a clearer name. */
export const openProfilePage = openProfileDialog;

/**
 * Profile navigation. `openProfileId` is only set for legacy `?profile=<id>` links
 * (ProfileDialogHost redirects them to `/profile/<id>`).
 */
export const useProfileRoute = () => {
  const router = useRouter();
  const openProfileId = useRouterState({
    select: state =>
      ((state.location.search as Record<string, unknown>)[PROFILE_SEARCH_KEY] as
        string | undefined) ?? null,
  });

  const openProfile = useCallback((userId: string) => openProfileDialog(router, userId), [router]);

  const closeProfile = useCallback(() => {
    if (router.history.canGoBack()) {
      router.history.back();
      return;
    }
    void router.navigate({ to: CoreVariables.routePathHome, replace: true });
  }, [router]);

  return { openProfileId, openProfile, closeProfile };
};
