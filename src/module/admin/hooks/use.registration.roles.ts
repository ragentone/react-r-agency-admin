import { useGraphQlGetter } from '@core/mesh';
import i18n from 'i18next';
import { useCallback, useEffect, useState } from 'react';

import { AdminRoleListQuery, RegistrationRolesQuery, RegistrationRolesSetMutation } from '../graphql';
import type { MutationDocument, QueryDocument } from './graphql.client';

/** Always given to new accounts, not editable here. */
const BASE_ROLE = 'default:user';
/** Admin scopes are never offered here (the backend refuses them too). */
const ADMIN_SCOPES = ['admin', 'super'];

export interface IRegistrationRoleOption {
  role: string;
  label: string;
}

export interface IRegistrationRoleGroup {
  id: string;
  label: string;
  options: IRegistrationRoleOption[];
}

type RoleText = Partial<Record<string, string>> | null | undefined;

interface IRoleDefinition {
  role: string;
  label?: RoleText;
  group?: string;
  assignable?: boolean;
}

interface IRoleGroupDefinition {
  id: string;
  label?: RoleText;
}

const isAdminScope = (role: string) => ADMIN_SCOPES.includes(role.split(':')[0] ?? '');
const textOf = (text: RoleText, lang: string, fallback: string) =>
  text?.[lang] ?? text?.de ?? fallback;

/** Assignable app roles, grouped by app in the order the runtime sends them. */
export const buildRoleGroups = (
  definitions: IRoleDefinition[],
  groups: IRoleGroupDefinition[],
  lang: string
): IRegistrationRoleGroup[] => {
  const result = new Map<string, IRegistrationRoleGroup>();
  for (const item of definitions) {
    if (item.assignable === false || item.role === BASE_ROLE || isAdminScope(item.role)) continue;
    const id = item.group ?? item.role.split(':')[0] ?? 'other';
    const group = result.get(id) ?? {
      id,
      label: textOf(groups.find(entry => entry.id === id)?.label, lang, id),
      options: [],
    };
    group.options.push({ role: item.role, label: textOf(item.label, lang, item.role) });
    result.set(id, group);
  }
  return [...result.values()];
};

/** Roles a new account gets, plus every assignable app role grouped by app. */
export const useRegistrationRoles = () => {
  const getGraphql = useGraphQlGetter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(false);
  const [roles, setRoles] = useState<string[]>([]);
  const [groups, setGroups] = useState<IRegistrationRoleGroup[]>([]);

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
      const catalog = (list as {
        data?: {
          adminRoleList?: {
            definitions?: IRoleDefinition[] | null;
            groups?: IRoleGroupDefinition[] | null;
          } | null;
        };
      }).data?.adminRoleList;
      if (!stored || !Array.isArray(catalog?.definitions)) throw new Error('registration roles');
      const lang = i18n.language?.slice(0, 2) ?? 'de';
      setRoles((stored.roles ?? []).filter(role => role !== BASE_ROLE));
      setGroups(buildRoleGroups(catalog.definitions, catalog.groups ?? [], lang));
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

  return { loading, saving, error, roles, groups, save, retry: load };
};
