import { PageManager } from '@core/page';
import { createFileRoute } from '@tanstack/react-router';
import { createElement, type FunctionComponent } from 'react';

/**
 * Represents a route for the application.
 *
 * The `Route` variable is created using the `createFileRoute` method, specifying the URL path for this route.
 * It is configured with a `component` property to define the UI component that should be rendered when this route is accessed.
 * It also includes an `async beforeLoad` function, which is executed before the route is loaded, allowing for pre-loading logic.
 * In this specific implementation, the `beforeLoad` function checks the `userConfig` from the context's storage.
 * If the user is authorized, it redirects them to the root `/` route.
 */
export const Route = createFileRoute('/_index/auth')({
  // Resolved at render time: apps may replace the page via Core.page.setPage('auth', …)
  // and the route file may be evaluated before core.tsx has registered it.
  component: () => createElement(PageManager.getPage('auth') as FunctionComponent),
});
