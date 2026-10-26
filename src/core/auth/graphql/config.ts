import { graphql } from '@generated/graphql';

/**
 * GraphQL query to fetch the configuration details of a user.
 *
 * This query retrieves a `userLoadConfig` object that includes meta-information
 * about the user. The returned meta object contains the following fields:
 * - `alias`: The alias or username of the user.
 * - `avatarUrl`: The URL for the user's avatar image.
 * - `teaserUrl`: The URL for the user's teaser image or content.
 * - `lastLogin`: A timestamp of the user's last login activity.
 * - `email`: The email address of the user.
 * - `role`: The role assigned to the user.
 * - `superUser`: A boolean indicating whether the user has superuser privileges.
 * - `userType`: The type of user categorized in the system.
 */
export const UserConfigQuery = graphql(`
  query UserConfig {
    userLoadConfig {
      authorized
      refreshToken
      userId
      meta {
        id
        alias
        avatarUrl
        teaserUrl
        lastLogin
        email
        role
        superUser
        userType
        settings {
          public
          searchable
          showFullName
          showEmail
        }
      }
    }
  }
`);
