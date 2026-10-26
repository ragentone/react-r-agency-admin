import { getMeshClient } from 'r-agency-mesh-client-v1/release';

import type { IAuthResult } from '../types';

type Client = ReturnType<ReturnType<typeof getMeshClient>['graphql']>;
type QueryDoc = Parameters<Client['query']>[0]['query'];
type MutationDoc = Parameters<Client['mutate']>[0]['mutation'];
type Variables = Record<string, unknown>;

const client = () => getMeshClient().graphql();

/** Network / GraphQL errors become `{ success: false, error: 'unknown' }`. */
const safe = async <T extends IAuthResult>(run: () => Promise<T | null | undefined>) => {
  try {
    const result = await run();
    return (result ?? { success: false, error: 'unknown' }) as T;
  } catch (error) {
    console.warn('[auth]', (error as Error)?.message);
    return { success: false, error: 'unknown' } as T;
  }
};

export const authQuery = <T extends IAuthResult>(
  doc: unknown,
  field: string,
  variables?: Variables
) =>
  safe<T>(async () => {
    const response = (await client().query({
      query: doc as QueryDoc,
      variables,
      fetchPolicy: 'no-cache',
    })) as { data?: Record<string, T | null> };
    return response.data?.[field];
  });

export const authMutate = <T extends IAuthResult>(
  doc: unknown,
  field: string,
  variables?: Variables
) =>
  safe<T>(async () => {
    const response = (await client().mutate({
      mutation: doc as MutationDoc,
      variables,
    })) as { data?: Record<string, T | null> };
    return response.data?.[field];
  });
