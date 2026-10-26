import { AccountView } from '@core/account/components';
import { CoreVariables } from '@core/core.variables.ts';
import { RoutePage } from '@router/components';
import { useRouter } from '@tanstack/react-router';
import React, { useCallback } from 'react';

/**
 * `/account` as a regular page inside the layout (menu / dock stay visible) – no fullscreen
 * overlay. Back arrow: back in the history (opened inside the app) or to the start page.
 */
export const PageAccount: React.FC = () => {
  const router = useRouter();

  const back = useCallback(() => {
    if (router.history.canGoBack()) {
      router.history.back();
      return;
    }
    void router.navigate({ to: CoreVariables.routePathHome, replace: true });
  }, [router]);

  return (
    // Same 600px column as the profile; phones edge to edge (no page padding).
    <RoutePage width={600} scrollable={true} classes={{ scroll: 'p-0 overscroll-contain' }}>
      {() => <AccountView onBack={back} />}
    </RoutePage>
  );
};
