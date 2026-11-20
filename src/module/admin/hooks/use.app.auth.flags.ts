import { useGraphQlGetter } from '@core/mesh';
import { useCallback, useEffect, useState } from 'react';

import { AppAuthQuery, AppAuthSetMutation } from '../graphql/app.auth';
import type { MutationDocument, QueryDocument } from './graphql.client';

export interface IAppAuthFlags {
  allowRegister: boolean;
  allowLoginWithGoogle: boolean;
}

type AppAuthResult = Partial<IAppAuthFlags> & { success?: boolean };

/** Sign-up and Google-login switches (`appAuth` to read, `appAuthSet` to store). */
export const useAppAuthFlags = () => {
  const getGraphql = useGraphQlGetter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(false);
  const [flags, setFlags] = useState<IAppAuthFlags>({
    allowRegister: false,
    allowLoginWithGoogle: false,
  });

  useEffect(() => {
    let alive = true;
    const load = async () => {
      try {
        const response = (await getGraphql().query({
          query: AppAuthQuery as QueryDocument,
          fetchPolicy: 'no-cache',
          errorPolicy: 'all',
        })) as { data?: { configAppAuth?: AppAuthResult | null } };
        const result = response.data?.configAppAuth;
        if (!alive) return;
        if (!result?.success) throw new Error('app auth flags');
        setFlags({
          allowRegister: result.allowRegister === true,
          allowLoginWithGoogle: result.allowLoginWithGoogle === true,
        });
        setError(false);
      } catch (err) {
        console.warn('[admin] app auth flags', err);
        if (alive) setError(true);
      } finally {
        if (alive) setLoading(false);
      }
    };
    void load();
    return () => {
      alive = false;
    };
  }, [getGraphql]);

  /** Stores the given switches. Returns `true` when the server accepted them. */
  const save = useCallback(
    async (next: Partial<IAppAuthFlags>): Promise<boolean> => {
      setSaving(true);
      try {
        const response = (await getGraphql().mutate({
          mutation: AppAuthSetMutation as MutationDocument,
          variables: next,
          errorPolicy: 'all',
        })) as { data?: { configAppAuthSet?: AppAuthResult | null } };
        const result = response.data?.configAppAuthSet;
        if (!result?.success) return false;
        setFlags({
          allowRegister: result.allowRegister === true,
          allowLoginWithGoogle: result.allowLoginWithGoogle === true,
        });
        return true;
      } catch (err) {
        console.warn('[admin] app auth flags save', err);
        return false;
      } finally {
        setSaving(false);
      }
    },
    [getGraphql]
  );

  return { loading, saving, error, flags, save };
};
