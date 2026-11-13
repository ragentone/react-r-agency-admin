import { graphql } from '@generated/graphql';

export const UserLoadProfileQuery = graphql(`
  query UserLoadProfileQuery($id: String!) {
    userProfileLoad(userId: $id) {
      success
      userId
      profile {
        avatarUrl
        teaserUrl
        alias
        email
        fullName
        online
        createdAt
        userType
        gender
        birthday
        lastLogin
        description
        userId
      }
      params {
        canView
        isOwen
        notExists
        isPublic
      }
      relation {
        relationId
        requestBy
        sourceId
        targetId
        status
      }
    }
  }
`);
