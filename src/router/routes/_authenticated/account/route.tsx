import { PageManager } from '@core/page/page.manager.tsx';
import { createFileRoute } from '@tanstack/react-router';
import { createElement, type FunctionComponent } from 'react';

/**
 * Represents a route configuration for the application.
 *
 * The `Route` object defines a specific route to be handled
 * in the application, associated with a specified component.
 *
 * This particular route is created using the `createFileRoute` function,
 * which binds the route to the `PageAccount` component.
 *
 * It is used to define navigation and rendering logic by associating
 * the route to the corresponding UI component.
 */
export const Route = createFileRoute('/_authenticated/account')({
  // Resolved at render time: apps may replace the page via Core.page.setPage('account', …)
  // and the route file may be evaluated before core.tsx has registered it.
  component: () => createElement(PageManager.getPage('account') as FunctionComponent),
});
