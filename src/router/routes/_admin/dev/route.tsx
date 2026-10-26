import { PageDeveloper } from '@core/developer';
import { createFileRoute } from '@tanstack/react-router';

/**
 * Represents a route configuration for the developer page in the application.
 *
 * @constant {Object} Route
 * @property {function} component - The React component associated with the route.
 * @property {Object} staticData - Static data associated with the route.
 * @property {Object} staticData.meta - Metadata for the route.
 * @property {string} staticData.meta.title - The title of the route, used for display or metadata purposes.
 */
export const Route = createFileRoute('/_admin/dev')({
  component: PageDeveloper,
  staticData: {
    meta: {
      title: 'Developer',
    },
  },
});
