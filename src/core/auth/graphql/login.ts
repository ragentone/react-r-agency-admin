import { graphql } from '@generated/graphql';

/**
 * GraphQL mutation for handling user login.
 * This mutation, `UserLoginMutation`, is used to log users into the system by accepting
 * login parameters and returning authentication details. It validates the user credentials,
 * and if successful, provides essential data regarding the logged-in user.
 * Variables:
 * - `params` (userLoginParams!): The input parameter for this mutation which includes the
 *   login credentials and any required login information.
 * Response Fields:
 * - `success` (Boolean): Indicates whether the login operation was successful.
 * - `userId` (String): The unique identifier of the authenticated user.
 * - `authToken` (String): The token generated for client-side authentication.
 * - `meta` (Object): Metadata associated with the authenticated user, containing the following:
 *   - `avatarUrl` (String): The URL of the user's profile avatar.
 *   - `teaserUrl` (String): The URL for the user's teaser image.
 *   - `settings` (Object): Settings associated with the user, with the following fields:
 *     - `public` (Boolean): Indicates if the user's profile is public.
 *     - `searchable` (Boolean): Specifies whether the user's profile is searchable.
 *   - `alias` (String): The user's unique alias.
 *   - `email` (String): The user's email address.
 *   - `role` (String): The role assigned to the user in the system.
 */
export const UserLoginMutation = graphql(`
  mutation UserLogin($params: userLoginParams!) {
    userLogin(params: $params) {
      success
      userId
      authToken
      meta {
        avatarUrl
        teaserUrl
        settings {
          public
          searchable
          showEmail
          showFullName
        }
        alias
        email
        role
        userType
        superUser
        lastLogin
        id
      }
    }
  }
`);
