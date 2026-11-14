import { UserAliasExistsQuery, UserEmailExistsQuery } from '@core/auth/graphql/exists.ts';
import { useGraphQlGetter } from '@core/mesh';
import { useCallback, useRef, useState } from 'react';

import type { QueryDocument } from './graphql.client';

export type AdminTakenKind = 'alias' | 'email';
type Flags = Record<AdminTakenKind, boolean>;

const NONE: Flags = { alias: false, email: false };

/**
 * "Already taken" check for alias / e-mail (`userAliasExists`, `userEmailExists`), meant for
 * `onBlur`. A network error never blocks – the backend checks again when the account is created.
 */
export const useAdminTaken = () => {
  const getGraphql = useGraphQlGetter();
  const [taken, setTaken] = useState<Flags>(NONE);
  const [checking, setChecking] = useState<Flags>(NONE);
  // Value of the latest check per field – an older answer is dropped.
  const latest = useRef<Record<AdminTakenKind, string | null>>({ alias: null, email: null });

  const check = useCallback(
    async (kind: AdminTakenKind, value: string) => {
      latest.current[kind] = value;
      setChecking(prev => ({ ...prev, [kind]: true }));
      try {
        const response = (await getGraphql().query({
          query: (kind === 'alias' ? UserAliasExistsQuery : UserEmailExistsQuery) as QueryDocument,
          variables: { [kind]: value },
          fetchPolicy: 'no-cache',
        })) as {
          data?: {
            userAliasExists?: { exists?: boolean | null } | null;
            userEmailExists?: { exists?: boolean | null } | null;
          };
        };
        if (latest.current[kind] !== value) return;
        const result =
          kind === 'alias' ? response.data?.userAliasExists : response.data?.userEmailExists;
        setTaken(prev => ({ ...prev, [kind]: Boolean(result?.exists) }));
      } catch {
        // not reachable → don't block
      } finally {
        if (latest.current[kind] === value) setChecking(prev => ({ ...prev, [kind]: false }));
      }
    },
    [getGraphql]
  );

  /** The field was edited: the old answer is void. */
  const clear = useCallback((kind: AdminTakenKind) => {
    latest.current[kind] = null;
    setTaken(prev => ({ ...prev, [kind]: false }));
    setChecking(prev => ({ ...prev, [kind]: false }));
  }, []);

  const reset = useCallback(() => {
    latest.current = { alias: null, email: null };
    setTaken(NONE);
    setChecking(NONE);
  }, []);

  return { taken, checking, check, clear, reset };
};
