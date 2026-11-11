import { AuthProvider } from '@core/auth';
import { CmsProvider } from '@core/cms';
import { ProviderComposer } from '@core/components';
import { Extensions } from '@core/extension';
import { Layout } from '@core/layout';
import { LayoutProvider } from '@core/layout';
import {
  PluginConfirmHost,
  PluginDialogHost,
  PluginDrawerHost,
  PluginLoadingHost,
  PluginProvider,
} from '@core/plugin';
import { ProviderManager } from '@core/provider';
import { createRootRouteWithContext } from '@tanstack/react-router';

import type { IRouterContext } from '../types.ts';
/**
 * Represents the root route configuration for the application's routing structure.
 * The `rootRoute` serves as the base route that encapsulates all other nested routes.
 * It is defined with a root-level component that typically renders an `Outlet`,
 * enabling child routes to render their respective components within the parent route's structure.
 * This variable is initialized using the `createRootRoute` function, which takes a configuration object.
 * The configuration object includes a `component` property that specifies the component to be rendered for the root route.
 */
export const Route = createRootRouteWithContext<IRouterContext>()({
  component: () => (
    <LayoutProvider>
      <ProviderComposer
        providers={ProviderManager.merge(
          [
            { provider: AuthProvider },
            { provider: CmsProvider },
            { provider: PluginProvider, props: { scope: 'admin' } },
          ],
          'route'
        )}
      >
        <Extensions>
          <Layout />
          <PluginConfirmHost />
          <PluginDrawerHost />
          <PluginDialogHost />
          <PluginLoadingHost />
        </Extensions>
      </ProviderComposer>
    </LayoutProvider>
  ),
});
