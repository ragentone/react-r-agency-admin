import { useGraphQlGetter } from '@core/mesh';
import { useCallback, useState } from 'react';

import { AdminUserGetQuery } from '../graphql';
import type { IAdminUser } from '../types';
import { type QueryDocument, toError } from './graphql.client';

/** One user incl. roles (used for the own account). */
export const useAdminUser = () => {
  const getGraphql = useGraphQlGetter();
  const [user, setUser] = useState<IAdminUser | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const load = useCallback(
    async (userId: string) => {
      setLoading(true);
      setError(null);
      try {
        const response = (await getGraphql().query({
          query: AdminUserGetQuery as QueryDocument,
          variables: { userId },
          fetchPolicy: 'no-cache',
        })) as { data?: { adminUserGet?: { success?: boolean; user?: IAdminUser | null } } };
        const result = response.data?.adminUserGet;
        if (!result?.success || !result.user) throw new Error('adminUserGet failed');
        setUser(result.user);
      } catch (err) {
        setError(toError(err));
      } finally {
        setLoading(false);
      }
    },
    [getGraphql]
  );

  return { user, setUser, loading, error, load };
};
