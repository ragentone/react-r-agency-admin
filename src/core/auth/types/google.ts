import type { GoogleAuthAfterMutationMutation } from '@generated/graphql/graphql.ts';

export interface IGoogleAuthParams {
  token: string;
  id: string;
  nonce: string;
}

export interface IGoogleAuthResult {
  success?: boolean | null;
  gapi_pxd?: string | null;
  gapi_exd?: string | null;
}

export type GoogleAuthAfterReturn = GoogleAuthAfterMutationMutation['googleAuthAfter'];
