import {
  LoadUserAccountQuery,
  UpdateUserAccountMutation,
  UpdateUserAccountSettingsMutation,
} from '@core/account/graphql';
import type { IAccountUpdateData, IUserAccount, IUserSettings } from '@core/account/types';
import { useAuth } from '@core/auth/components/use.auth.ts';
import { useEvents } from '@core/event';
import { useGraphQl, useMeshState } from '@core/mesh';
import { useCallback, useEffect, useState } from 'react';

export const useAccount = (autoLoad: boolean = true) => {
  const { connected } = useMeshState();
  const graphql = useGraphQl();
  const { core } = useEvents();
  const { refreshUserMeta } = useAuth();

  const [account, setAccount] = useState<IUserAccount | null>(null);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const loadAccount = useCallback(async (): Promise<IUserAccount | null> => {
    setLoading(true);
    setError(null);
    try {
      const response = await graphql.query({
        query: LoadUserAccountQuery,
      });
      const data = (response.data?.accountSelfLoad?.account as IUserAccount) ?? null;

      await core.emit('account:loaded', {
        payload: { account: data },
      });

      setAccount(data);
      return data;
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      return null;
    } finally {
      setLoading(false);
    }
  }, [core, graphql]);

  const updateAccount = useCallback(
    async (data: IAccountUpdateData): Promise<boolean> => {
      setUpdating(true);
      setError(null);
      try {
        const response = await graphql.mutate({
          mutation: UpdateUserAccountMutation,
          variables: {
            data: {
              id: data.id,
              alias: data.alias,
              gender: data.gender,
              birthday: data.birthday,
              details: data.details as any,
              description: {
                html: data.description?.html ?? '',
              },
              settings: {
                public: data.settings?.public ?? account?.settings?.public ?? true,
                searchable: data.settings?.searchable ?? account?.settings?.searchable ?? true,
                showEmail: data.settings?.showEmail ?? account?.settings?.showEmail ?? false,
                showFullName:
                  data.settings?.showFullName ?? account?.settings?.showFullName ?? true,
              },
            },
          },
        });
        const success = response.data?.accountSelfUpdate?.success ?? false;
        if (success) {
          // Account view + global user meta (alias in menu, greeting, timeline …).
          await Promise.all([loadAccount(), refreshUserMeta()]);
        }
        return success;
      } catch (err) {
        const e = err instanceof Error ? err : new Error(String(err));
        setError(e);
        return false;
      } finally {
        setUpdating(false);
      }
    },
    [account, graphql, loadAccount, refreshUserMeta]
  );

  const updateSettings = useCallback(
    async (settings: IUserSettings, userId?: string): Promise<boolean> => {
      setUpdating(true);
      setError(null);
      try {
        const targetUserId = userId || account?.id || '';
        const response = await graphql.mutate({
          mutation: UpdateUserAccountSettingsMutation,
          variables: {
            settings,
            userId: targetUserId,
          },
        });
        const success = response.data?.accountSelfUpdateSettings?.success ?? false;
        if (success) {
          // Privacy settings are part of the user meta too.
          await Promise.all([loadAccount(), refreshUserMeta()]);
        }
        return success;
      } catch (err) {
        const e = err instanceof Error ? err : new Error(String(err));
        setError(e);
        return false;
      } finally {
        setUpdating(false);
      }
    },
    [account, graphql, loadAccount, refreshUserMeta]
  );

  useEffect(() => {
    if (connected && autoLoad) {
      queueMicrotask(() => {
        void loadAccount();
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoLoad, connected]);

  return {
    account,
    loading,
    updating,
    error,
    loadAccount,
    updateAccount,
    updateSettings,
  };
};

export const useUserAccount = useAccount;
