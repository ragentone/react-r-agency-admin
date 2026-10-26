import { graphql } from '@generated/graphql';

/**
 * GraphQL query named `CheckAuthQuery`.
 * This query is used to verify the authentication status of a user within the system.
 * It retrieves information regarding the user's authorization and permissions.
 *
 * Fields returned by this query:
 * - `userCheckAuth`: Contains the authentication and permission-related data for the user.
 *   - `hasPromission`: Indicates whether the user has specific permissions.
 *   - `authorized`: Indicates whether the user is authenticated.
 */
export const CheckAuthQuery = graphql(`
  query CheckAuth($userRole: [String!]) {
    userCheckAuth(userRole: $userRole) {
      hasPromission
      authorized
    }
  }
`);
