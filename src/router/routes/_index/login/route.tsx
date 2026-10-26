import { CoreVariables } from '@core/core.variables.ts';
import { createFileRoute, redirect } from '@tanstack/react-router';

import { useAuthStore } from '../../../../core/auth/auth.store.tsx';

/**
 * Represents a route definition within the application. The Route variable is
 * configured to handle file-based routing, providing a component renderer and
 * associated static metadata.
 * @constant {Object} Route
 * @property {Function} component - The function responsible for rendering the
 * route's component. It takes in props and, if the IndexRoute's `__index_page__`
 * property is defined, delegates rendering to the `__index_page__` function;
 * otherwise, it returns null.
 * @property {Object} staticData - An object containing static metadata
 * associated with the route.
 * @property {Object} staticData.meta - Metadata information about the route.
 * @property {string} staticData.meta.title - The title of the route used for
 * display or SEO purposes, specifically set to 'Home' in this route.
 */
export const Route = createFileRoute('/_index/login')({
  component: () => null,
  async beforeLoad() {
    const store = useAuthStore.getState();
    if (store.afterLoginRoute) {
      const { pathname, search } = store.afterLoginRoute;
      store.setAfterLoginRoute(undefined);
      throw redirect({ to: pathname, search: search });
    } else {
      throw redirect({ to: CoreVariables.routePathHome });
    }
  },
  staticData: {
    meta: {
      title: 'Login',
    },
  },
});
