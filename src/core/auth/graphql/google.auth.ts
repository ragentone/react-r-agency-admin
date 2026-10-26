import { graphql } from '@generated/graphql';

/**
 * Represents a GraphQL mutation named "GoogleAuthAfterMutation".
 * This mutation is used to handle a Google authentication process by sending
 * JSON data containing the required parameters for post-authentication handling.
 * @constant {Object} GoogleAuthAfterMutation
 * @property {string} GoogleAuthAfterMutation.loc.source.body - The body of the GraphQL mutation.
 * Variables:
 * @param {JSON} $data - A JSON object containing the necessary data for the Google authentication process.
 * Response:
 * @return {Object} googleAuthAfter - The return object from the server.
 * @return {boolean} googleAuthAfter.success - Indicates whether the operation was successful.
 */
export const GoogleAuthAfterMutation = graphql(`
  mutation GoogleAuthAfterMutation($token: String!, $id: String!, $nonce: String!) {
    googleAuthAfter(accessToken: $token, idToken: $id, nonce: $nonce) {
      success
      gapi_pxd
      gapi_exd
    }
  }
`);
