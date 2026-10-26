import { useRouter } from '@tanstack/react-router';
import { useCallback } from 'react';

import type { ProfileOpenMode } from '../const';
import { openProfileDrawer } from './use.profile.drawer';
import { openProfilePage } from './use.profile.route';

type AppRouter = ReturnType<typeof useRouter>;

/**
 * Opens a profile – as page (`route`, default) or as drawer above the current page.
 * Also usable outside of React (handlers, search …).
 */
export const openProfile = (router: AppRouter, userId: string, mode: ProfileOpenMode = 'route') => {
  if (mode === 'drawer') openProfileDrawer(userId);
  else openProfilePage(router, userId);
};

/**
 * `openProfile(userId, mode?)` for components. `defaultMode` is the choice of the caller
 * (e.g. `useProfileOpen('drawer')` in a list), a single call can still override it.
 */
export const useProfileOpen = (defaultMode: ProfileOpenMode = 'route') => {
  const router = useRouter();
  const open = useCallback(
    (userId: string, mode: ProfileOpenMode = defaultMode) => openProfile(router, userId, mode),
    [defaultMode, router]
  );
  return { openProfile: open, mode: defaultMode };
};
