import { parse } from 'graphql';

/**
 * Confirms the e-mail address of a new user (token from the confirm link `/user/confirm?token=…`).
 *
 * Parsed here instead of `graphql()` from codegen: an operation that codegen hasn't seen
 * yet would be an empty object and break the request.
 */
export const UserConfirmMutation = parse(`
  mutation UserConfirm($token: String!) {
    userConfirm(token: $token) {
      success
      userId
    }
  }
`);

export interface IUserConfirmMutationResult {
  userConfirm?: {
    success?: boolean | null;
    userId?: string | null;
  } | null;
}
