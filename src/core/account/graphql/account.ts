import { graphql } from '@generated/graphql';

export const LoadUserAccountQuery = graphql(`
  query LoadUserAccount {
    accountSelfLoad {
      account {
        id
        alias
        avatarUrl
        userType
        gender
        lastLogin
        birthday
        age
        superUser
        description {
          html
        }
        settings {
          searchable
          public
          showEmail
          showFullName
        }
        email
        details {
          firstname
          lastname
        }
      }
    }
  }
`);

export const UpdateUserAccountMutation = graphql(`
  mutation AccountSelfUpdate($data: accountUpdateData!) {
    accountSelfUpdate(accountData: $data) {
      success
    }
  }
`);

export const UpdateUserAccountSettingsMutation = graphql(`
  mutation AccountSelfUpdateSettings($settings: userSettingsInput!, $userId: String!) {
    accountSelfUpdateSettings(settings: $settings, userId: $userId) {
      success
    }
  }
`);
