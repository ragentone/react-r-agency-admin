import { graphql } from '@generated/graphql';

/**
 * GraphQL mutation for uploading a user's avatar.
 * The `UserUploadAvatarMutation` mutation allows a user to upload one or more avatar files.
 * The mutation expects an input parameter `file`, which is an array of files (`Upload` type).
 * Upon successful execution, it returns an object containing the following fields:
 * - `success`: A boolean indicating whether the upload operation was successful.
 * - `url`: A string representing the URL of the uploaded avatar file.
 * Note: Ensure the `Upload` scalar type is supported and properly resolved in your GraphQL server.
 * Variables:
 * - `file`: An array of files to be uploaded as the avatar. It must be provided as part of the input.
 */
export const UserUploadAvatarMutation = graphql(`
  mutation UserUploadAvatar($file: [Upload]!) {
    userUploadAvatar(file: $file) {
      success
      url
    }
  }
`);
