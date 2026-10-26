import { graphql } from '@generated/graphql';

/**
 * GraphQL mutation for user logout.
 * This mutation is used to log out the currently authenticated user.
 * It sends a logout request and expects a response indicating whether the operation succeeded.
 * Fields:
 * - `userLogout`: The root field that performs the logout operation.
 *   - `success`: A boolean indicating whether the logout operation was successful.
 */
export const UserLogoutQuery = graphql(`
  query UserLogout {
    userLogout {
      success
    }
  }
`);
