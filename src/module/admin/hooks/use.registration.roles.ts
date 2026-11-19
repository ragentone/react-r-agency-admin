import { useGraphQlGetter } from '@core/mesh';
import i18n from 'i18next';
import { useCallback, useEffect, useState } from 'react';

import { AdminRoleListQuery, RegistrationRolesQuery, RegistrationRolesSetMutation } from '../graphql';
import type { MutationDocument, QueryDocument } from './graphql.client';

/** Always given to new accounts, not editable here. */
const BASE_ROLE = 'default:user';

export interface IRegistrationRoleOption {
  role: string;
  label: string;
}

interface IRoleDefinition {
  role: string;
  label?: Partial<Record<string, string>> | null;
  assignable?: boolean;
}

/** Roles a new account gets, plus every assignable role as a choice. */
export const useRegistrationRoles = () => {
  const getGraphql = useGraphQlGetter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(false);
  const [roles, setRoles] = useState<string[]>([]);
  const [options, setOptions] = useState<IRegistrationRoleOption[]>([]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const [current, list] = await Promise.all([
        getGraphql().query({
          query: RegistrationRolesQuery as QueryDocument,
          fetchPolicy: 'no-cache',
          errorPolicy: 'all',
        }),
        getGraphql().query({
          query: AdminRoleListQuery as QueryDocument,
          fetchPolicy: 'no-cache',
          errorPolicy: 'all',
        }),
      ]);
      const stored = (current as { data?: { configRegistrationRoles?: { roles?: string[] } | null } })
        .data?.configRegistrationRoles;
      const definitions = (list as {
        data?: { adminRoleList?: { definitions?: IRoleDefinition[] | null } | null };
      }).data?.adminRoleList?.definitions;
      if (!stored || !Array.isArray(definitions)) throw new Error('registration roles');
      const lang = i18n.language?.slice(0, 2) ?? 'de';
      setRoles((stored.roles ?? []).filter(role => role !== BASE_ROLE));
      setOptions(
        definitions
          .filter(item => item.assignable !== false && item.role !== BASE_ROLE)
          .map(item => ({ role: item.role, label: item.label?.[lang] ?? item.label?.de ?? item.role }))
      );
    } catch (err) {
      console.warn('[admin] registration roles', err);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [getGraphql]);

  useEffect(() => {
    void load();
  }, [load]);

  /** Stores the list. Returns `true` when the server accepted it. */
  const save = useCallback(
    async (next: string[]): Promise<boolean> => {
      setSaving(true);
      try {
        const response = (await getGraphql().mutate({
          mutation: RegistrationRolesSetMutation as MutationDocument,
          variables: { roles: next },
          errorPolicy: 'all',
        })) as {
          data?: { configRegistrationRolesSet?: { success?: boolean; roles?: string[] } | null };
        };
        const result = response.data?.configRegistrationRolesSet;
        if (!result?.success) return false;
        setRoles((result.roles ?? next).filter(role => role !== BASE_ROLE));
        return true;
      } catch (err) {
        console.warn('[admin] registration roles save', err);
        return false;
      } finally {
        setSaving(false);
      }
    },
    [getGraphql]
  );

  return { loading, saving, error, roles, options, save, retry: load };
};
