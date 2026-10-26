import { graphql } from '@generated/graphql';

export const DeleteUserMutation = graphql(`
  mutation UserDelete($pwd: String!) {
    userDelete(pwd: $pwd) {
      success
    }
  }
`);
