import { graphql } from '@generated/graphql';

export const UserEmailExistsQuery = graphql(`
  query UserEmailExists($email: String!) {
    userEmailExists(email: $email) {
      exists
    }
  }
`);

export const UserAliasExistsQuery = graphql(`
  query UserAliasExists($alias: String!) {
    userAliasExists(alias: $alias) {
      exists
    }
  }
`);
