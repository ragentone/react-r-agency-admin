import { useGraphQl } from '@core/mesh';
import { useCallback } from 'react';

import { type IUserConfirmMutationResult, UserConfirmMutation } from '../graphql/confirm.ts';

export interface IUserConfirmOutcome {
  success: boolean;
  userId?: string | null;
  /** Backend translate key (namespace `auth`), e.g. `user_invalid_confirm_token`. */
  errorKey?: string;
}

// Cast until codegen picked up graphql/confirm.ts (runs with `npm run dev`).
type MutationDocument = Parameters<ReturnType<typeof useGraphQl>['mutate']>[0]['mutation'];

/** A confirm token can only be used once → one request per token (StrictMode, re-mounts). */
const pending = new Map<string, Promise<IUserConfirmOutcome>>();

const errorKeyOf = (errors: unknown): string | undefined => {
  if (!Array.isArray(errors) || errors.length === 0) return undefined;
  const first = errors[0] as { translateKey?: string; extensions?: Record<string, unknown> };
  const key = first.translateKey ?? first.extensions?.translateKey ?? first.extensions?.code;
  return typeof key === 'string' ? key : undefined;
};

/** Sends the confirm token of the e-mail link to the backend (`userConfirm`). */
export const useUserConfirm = () => {
  const { mutate } = useGraphQl();

  const confirm = useCallback(
    (token: string): Promise<IUserConfirmOutcome> => {
      const running = pending.get(token);
      if (running) return running;

      const request = (async (): Promise<IUserConfirmOutcome> => {
        try {
          const response = (await mutate({
            mutation: UserConfirmMutation as MutationDocument,
            variables: { token },
          })) as { data?: IUserConfirmMutationResult; errors?: unknown };
          const result = response.data?.userConfirm;
          if (result?.success) return { success: true, userId: result.userId };
          return { success: false, errorKey: errorKeyOf(response.errors) };
        } catch (error) {
          const graphQLErrors = (error as { graphQLErrors?: unknown })?.graphQLErrors;
          return { success: false, errorKey: errorKeyOf(graphQLErrors) };
        }
      })();

      pending.set(token, request);
      return request;
    },
    [mutate]
  );

  return { confirm };
};
