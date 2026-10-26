import { graphql } from '@generated/graphql';
/**
 * Represents a GraphQL mutation for uploading a user teaser file.
 *
 * This mutation accepts an array of files as input and uploads a teaser file
 * to the server. Upon successful execution, it returns a success status and
 * the URL of the uploaded teaser.
 *
 * @constant {DocumentNode} UploadUserTeaserMutation
 * @mutation
 * @param {Object} variables - The input variables for the mutation.
 * @param {File[]} variables.file - An array of files to be uploaded.
 * @returns {Object} The response from the mutation.
 * @returns {boolean} response.success - Indicates whether the upload was successful.
 * @returns {string} response.url - The URL of the uploaded teaser file.
 */
export const UploadUserTeaserMutation = graphql(`
  mutation UserUploadTeaser($file: [Upload]!) {
    userUploadTeaser(file: $file) {
      success
      url
    }
  }
`);
/**
 * GraphQL mutation for resetting the user's teaser.
 *
 * This mutation triggers an operation to reset the teaser information
 * associated with the user. It returns a response indicating whether
 * the operation was successful.
 *
 * @constant {DocumentNode} ResetUserTeaserMutation - GraphQL mutation definition.
 */
export const ResetUserTeaserMutation = graphql(`
  mutation UserResetTeaser {
    userResetTeaser {
      success
    }
  }
`);
