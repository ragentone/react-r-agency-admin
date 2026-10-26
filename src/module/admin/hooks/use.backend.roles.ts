import { useAuth } from '@core/auth/components/use.auth.ts';
import { USER_ROLE_GROUP_SYSTEM, UserRoleManager } from '@core/auth/roles/role.manager.ts';
import { useGraphQlGetter } from '@core/mesh';
import i18n from 'i18next';
import { useEffect, useState } from 'react';

import { AdminRoleListQuery } from '../graphql';
import type { QueryDocument } from './graphql.client';

/** Text per app language (runtime `UserRoleText`). */
type RoleText = Partial<Record<string, string>>;

interface IBackendRole {
  role: string;
  label: RoleText;
  description?: RoleText | null;
  group: string;
  sortOrder: number;
  assignable: boolean;
}

interface IBackendRoleGroup {
  id: string;
  label: RoleText;
  sortOrder: number;
}

/** i18n namespace for the role texts from the runtime (language switch works without reload). */
const NAMESPACE = 'backend-roles';
const LANGUAGES = ['de', 'en', 'ru'] as const;

/** Role / group id → i18n key (`:` and `.` are separators in i18next). */
const keyOf = (value: string) => value.replace(/[^a-z0-9_-]/gi, '_');

type State = 'idle' | 'loading' | 'loaded' | 'error';
let state: State = 'idle';
let pending: Promise<void> | null = null;
const listeners = new Set<(next: State) => void>();
const setState = (next: State) => {
  state = next;
  listeners.forEach(listener => listener(next));
};

/** Puts the runtime roles into `Core.roles` (texts as i18n bundle, one per language). */
const apply = (definitions: IBackendRole[], groups: IBackendRoleGroup[]) => {
  LANGUAGES.forEach(language => {
    const pick = (text: RoleText | null | undefined) =>
      text?.[language] ?? text?.en ?? Object.values(text ?? {})[0] ?? '';
    const bundle = {
      group: Object.fromEntries(groups.map(group => [keyOf(group.id), pick(group.label)])),
      role: Object.fromEntries(
        definitions.map(item => [
          keyOf(item.role),
          { label: pick(item.label), description: pick(item.description) },
        ])
      ),
    };
    i18n.addResourceBundle(language, NAMESPACE, bundle, true, true);
  });

  groups.forEach(group =>
    UserRoleManager.registerGroup(group.id, {
      label: `${NAMESPACE}:group.${keyOf(group.id)}`,
      sortOrder: group.sortOrder,
    })
  );
  UserRoleManager.register(
    definitions.map(item => ({
      role: item.role,
      label: `${NAMESPACE}:role.${keyOf(item.role)}.label`,
      description: item.description
        ? `${NAMESPACE}:role.${keyOf(item.role)}.description`
        : undefined,
      group: item.group || USER_ROLE_GROUP_SYSTEM,
      sortOrder: item.sortOrder,
      assignable: item.assignable,
    }))
  );
};

/**
 * Roles of the runtime (`adminRoleList` → registered in the runtime via CAN bus
 * `roles` → `collect_roles`) in `Core.roles`, so `RolePickerSheet` / `AdminRoleEditor` show every
 * app role – also of apps that only live in the app frontend. Loaded once per page load.
 * Errors: the roles the admin registered itself stay available, the next mount tries again.
 */
export const useBackendRoles = (): { loading: boolean; error: boolean } => {
  const getGraphql = useGraphQlGetter();
  const { authorized } = useAuth();
  const [current, setCurrent] = useState<State>(state);

  useEffect(() => {
    listeners.add(setCurrent);
    return () => {
      listeners.delete(setCurrent);
    };
  }, []);

  useEffect(() => {
    if (!authorized || state === 'loaded' || pending) return;
    setState('loading');
    pending = (async () => {
      try {
        const response = (await getGraphql().query({
          query: AdminRoleListQuery as QueryDocument,
          fetchPolicy: 'no-cache',
          errorPolicy: 'all',
        })) as {
          data?: {
            adminRoleList?: {
              success?: boolean;
              definitions?: IBackendRole[] | null;
              groups?: IBackendRoleGroup[] | null;
            } | null;
          };
        };
        const result = response.data?.adminRoleList;
        if (!result?.success || !Array.isArray(result.definitions)) {
          setState('error');
          return;
        }
        apply(result.definitions, Array.isArray(result.groups) ? result.groups : []);
        setState('loaded');
      } catch (error) {
        console.warn('[admin] role list', error);
        setState('error');
      } finally {
        pending = null;
      }
    })();
  }, [authorized, getGraphql]);

  return { loading: current === 'loading', error: current === 'error' };
};
