import { CoreVariables } from '@core/core.variables.ts';
import { RoutePage } from '@router/components';
import { useParams, useRouter } from '@tanstack/react-router';
import React, { useCallback } from 'react';

import { ProfileView } from '../components/ProfileView.tsx';

/**
 * `/profile/$userId` as a regular page inside the layout (menu / dock stay visible) – no
 * fullscreen overlay. Back arrow: back in the history (opened inside the app) or to the start page.
 */
export const PageProfile: React.FC = () => {
  const router = useRouter();
  const { userId } = useParams({ strict: false }) as { userId?: string };

  const back = useCallback(() => {
    if (router.history.canGoBack()) {
      router.history.back();
      return;
    }
    void router.navigate({ to: CoreVariables.routePathHome, replace: true });
  }, [router]);

  return (
    // Same 600px column as the account; phones edge to edge (no page padding).
    <RoutePage width={600} scrollable={true} classes={{ scroll: 'p-0 overscroll-contain' }}>
      {() => (userId ? <ProfileView key={userId} userId={userId} onBack={back} /> : null)}
    </RoutePage>
  );
};
