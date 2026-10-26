import { setRouteTitle } from '@router/route.title.ts';
import { createFileRoute, redirect } from '@tanstack/react-router';

/**
 * Represents a route configuration that is initialized with a specific path
 * and defined lifecycle methods. This configuration facilitates building
 * file-based routing with pre-defined behaviors that execute at various stages
 * of route interaction.
 * @property {Function} beforeLoad - A lifecycle hook triggered before the route
 * is loaded. Typically used for executing side effects or asynchronous tasks
 * required prior to loading, such as authentication checks, alerts, or data fetching.
 * @description
 * The `Route` variable allows defining routing behavior for an application,
 * along with lifecycle hooks to handle route-specific logic. The route is
 * initialized with a base path and attaches custom logic, such as the
 * `beforeLoad` function, for execution at the defined stage of interaction.
 *
 */
export const Route = createFileRoute('/_index')({
  beforeLoad: async args => {
    const { core } = args.context.events;
    setRouteTitle(args.matches);
    const eventArgs = await core.emit('router:before_load_route', {
      payload: {
        location: args.location,
        target: 'auth',
        matches: args.matches,
        client: args.context.client,
      },
    });
    if (eventArgs.data.redirect) {
      throw redirect({
        to: eventArgs.data.redirect,
      });
    }
  },
});
