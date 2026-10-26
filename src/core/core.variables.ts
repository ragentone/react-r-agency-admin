import type { ICoreVariables } from './types.ts';

/**
 * CoreVariables is an object containing key route paths used for navigation within the application.
 *
 * Properties:
 * - routePathAccount: A string representing the route path to the account-related pages.
 * - routePathAuth: A string representing the route path to the authentication-related pages.
 */
export const CoreVariables: ICoreVariables = {
  routePathAccount: '/account',
  routePathAuth: '/auth',
  routePathHome: '/',
  headerSubTitle: 'development',
  headerTitle: 'agency',
};
