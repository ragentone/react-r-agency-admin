import { useAuth } from '@core/auth/components/use.auth.ts';
import { useGraphQlGetter } from '@core/mesh';
import { useCallback, useState } from 'react';

import { AdminRoleAddMutation, AdminRoleUpdateMutation } from '../graphql';
import type { AdminRoleUpdate, IAdminRoleResult, IAdminUser } from '../types';
import { normalizeRole } from '../utils';
import { errorKey, type MutationDocument } from './graphql.client';

/** Add (several) / remove / change roles. Own account → `userMeta` (menu, guards) is refreshed. */
export const useAdminRoleUpdate = () => {
  const getGraphql = useGraphQlGetter();
  const { refreshUserMeta } = useAuth();
  const [saving, setSaving] = useState(false);

  const update = useCallback(
    async (user: IAdminUser, change: AdminRoleUpdate): Promise<IAdminRoleResult> => {
      setSaving(true);
      try {
        type Result = { success?: boolean; user?: IAdminUser | null } | null;
        const response = (
          change.action === 'add'
            ? await getGraphql().mutate({
                mutation: AdminRoleAddMutation as MutationDocument,
                variables: { userId: user.id, roles: change.roles.map(normalizeRole) },
                errorPolicy: 'all',
              })
            : await getGraphql().mutate({
                mutation: AdminRoleUpdateMutation as MutationDocument,
                variables: {
                  userId: user.id,
                  action: change.action,
                  role: normalizeRole(change.role),
                  to: change.action === 'change' ? normalizeRole(change.to) : null,
                },
                errorPolicy: 'all',
              })
        ) as {
          data?: { adminRoleUpdate?: Result; adminRoleAdd?: Result };
          errors?: unknown;
        };
        const result =
          change.action === 'add' ? response.data?.adminRoleAdd : response.data?.adminRoleUpdate;
        if (!result?.success || !result.user) {
          return { ok: false, error: errorKey(response.errors) };
        }
        if (result.user.self) await refreshUserMeta();
        return { ok: true, user: result.user };
      } catch (err) {
        return { ok: false, error: errorKey(err) };
      } finally {
        setSaving(false);
      }
    },
    [getGraphql, refreshUserMeta]
  );

  return { saving, update };
};
