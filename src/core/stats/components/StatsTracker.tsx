import type { ExtensionComponent } from '@core/extension';
import { useRouterState } from '@tanstack/react-router';
import { useEffect } from 'react';

import { statsView } from '../tracker';

/**
 * Global extension (renders nothing): reports every route change to the visitor statistics.
 * Only the pathname – query and hash (drawers, tokens) are never sent.
 */
export const StatsTracker: ExtensionComponent = () => {
  const pathname = useRouterState({ select: state => state.location.pathname });

  useEffect(() => {
    statsView(pathname);
  }, [pathname]);

  return null;
};
