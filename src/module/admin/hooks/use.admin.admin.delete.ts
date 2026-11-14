import { useGraphQlGetter } from '@core/mesh';
import { useCallback, useState } from 'react';

import { AdminAdminDeleteMutation } from '../graphql';
import { errorKey, type MutationDocument } from './graphql.client';

/** Delete an admin account. Returns an error translation key, or null on success. */
export const useAdminAdminDelete = () => {
  const getGraphql = useGraphQlGetter();
  const [deleting, setDeleting] = useState(false);

  const remove = useCallback(
    async (userId: string): Promise<string | null> => {
      setDeleting(true);
      try {
        const response = (await getGraphql().mutate({
          mutation: AdminAdminDeleteMutation as MutationDocument,
          variables: { userId },
          errorPolicy: 'all',
        })) as { data?: { adminAdminDelete?: { success?: boolean } | null }; errors?: unknown };
        if (response.data?.adminAdminDelete?.success) return null;
        return errorKey(response.errors, 'error.delete');
      } catch (err) {
        return errorKey(err, 'error.delete');
      } finally {
        setDeleting(false);
      }
    },
    [getGraphql]
  );

  return { deleting, remove };
};
