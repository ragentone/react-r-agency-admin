import { graphql } from '@generated/graphql';

export const UserResetPassword = graphql(`
  mutation UserPasswordReset($email: String!) {
    userPasswordReset(email: $email) {
      success
    }
  }
`);

export const UserPasswordCreate = graphql(`
  mutation UserPasswordCreate($password: String!, $token: String!) {
    userPasswordCreate(password: $password, token: $token) {
      success
    }
  }
`);

export const UserPasswordChange = graphql(`
  mutation UserPasswordChange($userId: String!, $currentPassword: String!, $newPassword: String!) {
    userPasswordChange(
      userId: $userId
      currentPassword: $currentPassword
      newPassword: $newPassword
    ) {
      success
    }
  }
`);

export const UserComparePasswordQuery = graphql(`
  query UserComparePassword($pwd: String!) {
    userComparePassword(pwd: $pwd) {
      success
    }
  }
`);
