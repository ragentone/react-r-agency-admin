import { graphql } from '@generated/graphql';

export const UserCreateMutation = graphql(`
  mutation UserCreate($params: userCreateParams!) {
    userCreate(params: $params) {
      success
      userId
    }
  }
`);
