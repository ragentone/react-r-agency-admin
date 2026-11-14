import { useGraphQlGetter } from '@core/mesh';
import { useCallback, useState } from 'react';

import { AdminUserCreateMutation } from '../graphql';
import type { IAdminRoleResult, IAdminUser } from '../types';
import { errorKey, type MutationDocument } from './graphql.client';

export interface IAdminUserCreateValues {
  alias: string;
  email: string;
  password: string;
  confirmed: boolean;
}

/** Create a new admin account. Returns the user, or an error translation key. */
export const useAdminUserCreate = () => {
  const getGraphql = useGraphQlGetter();
  const [saving, setSaving] = useState(false);

  const create = useCallback(
    async (values: IAdminUserCreateValues): Promise<IAdminRoleResult> => {
      setSaving(true);
      try {
        const response = (await getGraphql().mutate({
          mutation: AdminUserCreateMutation as MutationDocument,
          variables: values,
          errorPolicy: 'all',
        })) as {
          data?: { adminUserCreate?: { success?: boolean; user?: IAdminUser | null } | null };
          errors?: unknown;
        };
        const result = response.data?.adminUserCreate;
        if (!result?.success || !result.user) {
          return { ok: false, error: errorKey(response.errors, 'error.create') };
        }
        return { ok: true, user: result.user };
      } catch (err) {
        return { ok: false, error: errorKey(err, 'error.create') };
      } finally {
        setSaving(false);
      }
    },
    [getGraphql]
  );

  return { saving, create };
};
