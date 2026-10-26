import { useAuthStore } from '@core/auth/auth.store.tsx';
import { useAuthTokenStore } from '@core/auth/auth.token.store.tsx';
import { UserConfigQuery } from '@core/auth/graphql/config.ts';
import { UserLoginMutation } from '@core/auth/graphql/login.ts';
import { UserLogoutQuery } from '@core/auth/graphql/logout.ts';
import { hasRoles } from '@core/auth/roles/roles.ts';
import type { IUserMetaData } from '@core/auth/types/config.ts';
import type { ILoginParams } from '@core/auth/types/login.ts';
import { CoreVariables } from '@core/core.variables.ts';
import { useEvents } from '@core/event';
import { useGraphQl, useMeshState } from '@core/mesh';
import { SecurityLoginHosts } from '@core/security/components/LoginHosts.tsx';
import { useSecurityStore } from '@core/security/store.ts';
import { useRouter } from '@tanstack/react-router';
import i18n from 'i18next';
import { useMesh } from 'r-agency-mesh-client-v1/release';
import { type ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';

import { AuthContext, type IAuthContext } from './auth.context.ts';
import { AuthLogoutConfirmDialog } from './AuthLogoutConfirmDialog.tsx';
import { AuthLogoutOverlay } from './AuthLogoutOverlay.tsx';

interface IProps {
  children: ReactNode;
}

/** Only these roles may sign in to the admin instance. */
export const ADMIN_LOGIN_ROLES = ['super:admin:user', 'admin:user'] as const;

const canUseAdmin = (meta: IUserMetaData | null | undefined) => hasRoles(meta, ADMIN_LOGIN_ROLES);

const AuthProvider = ({ children }: IProps) => {
  const { navigate } = useRouter();
  const { connected } = useMeshState();
  const { mutate, query } = useGraphQl();
  const { core } = useEvents();
  const { onEvent } = useMesh();

  const store = useAuthStore.getState();
  const token = useAuthTokenStore.getState();

  const [authorized, setAuthorized] = useState(store.authorized);
  const [loading, setLoading] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [userMeta, setUserMetaState] = useState<IUserMetaData | null | undefined>(store.userMeta);
  const [logoutConfirm, setLogoutConfirm] = useState(false);

  const setUserMeta = useCallback(
    (newMeta: IUserMetaData | undefined | null) => {
      store.setUserMeta(newMeta);
      setUserMetaState(newMeta);
    },
    [store]
  );

  const setUserMate = setUserMeta;

  const load = useCallback(async () => {
    setLoading(true);

    const { data } = await query({
      query: UserConfigQuery,
    });

    if (data?.userLoadConfig?.refreshToken) {
      token.setToken(data.userLoadConfig.refreshToken);
      const meta = data.userLoadConfig.meta;
      store.setUserMeta(meta);
      setUserMetaState(meta);
      store.setAuthorized(true);
      setAuthorized(true);
    } else {
      token.setToken(undefined);
      store.setUserMeta(undefined);
      setUserMetaState(undefined);
      store.setAuthorized(false);
      setAuthorized(false);
    }

    await core.emit('auth:config:loaded', { payload: { config: data?.userLoadConfig } });

    setTimeout(() => {
      setLoaded(true);
      setLoading(false);
    }, 1000);
  }, [core, query, store, token]);

  /** Fresh `userMeta` (no cache) – keeps the session, only replaces the meta data. */
  const refreshUserMeta = useCallback(async (): Promise<IUserMetaData | null> => {
    try {
      const { data } = await query({ query: UserConfigQuery, fetchPolicy: 'no-cache' });
      const meta = data?.userLoadConfig?.meta ?? null;
      if (data?.userLoadConfig?.refreshToken && meta) {
        token.setToken(data.userLoadConfig.refreshToken);
        store.setUserMeta(meta);
        setUserMetaState(meta);
      }
      return meta;
    } catch (error) {
      console.warn('[auth] refreshUserMeta failed', error);
      return null;
    }
  }, [query, store, token]);

  const destroy = useCallback(() => {
    token.setToken(undefined);
    store.setUserMeta(undefined);
    setUserMeta(undefined);
    setUserMetaState(undefined);
    store.setAuthorized(false);
    setAuthorized(false);
  }, [setUserMeta, store, token]);

  const login = useCallback(
    async (params: ILoginParams) => {
      setLoading(true);
      setIsLoggingIn(true);
      try {
        await core.emit('auth:login:before', { payload: { params } });

        const { data } = await mutate({
          mutation: UserLoginMutation,
          variables: {
            params,
          },
        });

        await core.emit('auth:login:after', { payload: { result: data?.userLogin } });

        if (data?.userLogin?.authToken) {
          token.setToken(data.userLogin.authToken);
          const meta = data.userLogin.meta;
          store.setUserMeta(meta);
          setUserMetaState(meta);
          store.setAuthorized(true);
          setAuthorized(true);
          void navigate({ to: '/login' });
        }
      } finally {
        setLoading(false);
        setIsLoggingIn(false);
      }
    },
    [core, mutate, navigate, store, token]
  );

  /** Sign-in flow (shared/auth) finished: store the token, then the same as `login`. */
  const completeLogin = useCallback(
    async (
      result: {
        authToken?: string | null;
        userId?: string | null;
        meta?: unknown;
        deletionPending?: string | null;
      },
      options: { offerPasskey?: boolean } = {}
    ) => {
      if (!result.authToken) return;
      token.setToken(result.authToken);
      const meta = (result.meta ?? null) as IUserMetaData | null;
      store.setUserMeta(meta);
      setUserMetaState(meta);
      store.setAuthorized(true);
      setAuthorized(true);
      const security = useSecurityStore.getState();
      security.setDeletionPending(result.deletionPending ?? null);
      security.setOfferPasskey(Boolean(options.offerPasskey) && !result.deletionPending);
      await core.emit('auth:login:after', {
        payload: {
          result: {
            success: true,
            authToken: result.authToken,
            userId: result.userId ?? null,
            meta,
          } as never,
        },
      });
      // Canonical meta + socket registration (after_load_config) like a page load.
      void refreshUserMeta();
      void navigate({ to: '/login' });
    },
    [core, navigate, refreshUserMeta, store, token]
  );

  // An admin changed this user's roles (runtime shared/admin → `user::update:user_roles` with
  // `{ roles }` to every open client of the user) → the new roles go straight into `userMeta`:
  // menu, role gates and route guards update without a reload or an extra request.
  // No usable payload → reload the meta instead. The backend checks roles in the database,
  // so the token doesn't need to be replaced for this.
  useEffect(() => {
    if (!authorized) return;
    const off = onEvent('user::update:user_roles', (payload?: { roles?: unknown }) => {
      const roles = payload?.roles;
      const current = useAuthStore.getState().userMeta;
      if (current && roles && typeof roles === 'object') {
        setUserMeta({ ...current, role: roles });
        return;
      }
      void refreshUserMeta();
    });
    return () => {
      off();
    };
    // `onEvent` is a new function on every render (same event bus) – not a dependency.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authorized, refreshUserMeta, setUserMeta]);

  // A security drawer was requested outside the account page (notification action) → go there.
  const requestedDrawer = useSecurityStore(state => state.drawer);
  useEffect(() => {
    if (!requestedDrawer || !authorized) return;
    if (window.location.pathname !== CoreVariables.routePathAccount) {
      void navigate({ to: CoreVariables.routePathAccount });
    }
  }, [authorized, navigate, requestedDrawer]);

  // Signed out from another device (account → devices) or the account was banned / deleted.
  useEffect(() => {
    if (!authorized) return;
    const off = onEvent('user::remove:auth_token', () => {
      destroy();
      toast(i18n.t('security:signedOutRemote'));
      void navigate({ to: CoreVariables.routePathAuth, replace: true });
    });
    return () => {
      off();
    };
  }, [authorized, destroy, navigate, onEvent]);

  // Admin instance: only `super:admin:user` / `admin:user`. Any other signed-in user (password,
  // sign-in flow or an existing session on reload) is signed out again right away –
  // the session is ended on the server too, so no token stays behind.
  const denyingRef = useRef(false);
  useEffect(() => {
    if (!authorized || !userMeta || canUseAdmin(userMeta) || denyingRef.current) return;
    denyingRef.current = true;
    void (async () => {
      try {
        await query({ query: UserLogoutQuery, fetchPolicy: 'no-cache' });
      } catch (error) {
        console.warn('[auth] admin guard logout failed', error);
      }
      destroy();
      toast.error(i18n.t('auth:adminOnly.title'), {
        description: i18n.t('auth:adminOnly.description'),
      });
      await navigate({ to: CoreVariables.routePathAuth, replace: true });
      denyingRef.current = false;
    })();
  }, [authorized, destroy, navigate, query, userMeta]);

  const preLogout = useCallback(() => {
    setLogoutConfirm(true);
  }, []);

  // Logout requested outside of React (main menu …) → same confirm dialog as `preLogout`.
  useEffect(
    () =>
      core.on('auth:logout:request', async () => {
        setLogoutConfirm(true);
      }),
    [core]
  );

  const logout = useCallback(async () => {
    setLoading(true);
    setIsLoggingOut(true);

    try {
      await core.emit('auth:logout:before', { payload: { userMeta } });

      const { data } = await query({
        query: UserLogoutQuery,
      });

      await core.emit('auth:logout:after', {
        payload: {
          userMeta: userMeta,
          success: data?.userLogout?.success ?? false,
        },
      });

      if (data?.userLogout?.success) {
        setAuthorized(false);
        token.setToken(undefined);
        store.setUserMeta(undefined);
        setUserMetaState(undefined);
        store.setAuthorized(false);
        void navigate({ to: '/logout' });
      }
    } finally {
      setLoading(false);
      setIsLoggingOut(false);
    }
  }, [core, navigate, query, store, token, userMeta]);

  useEffect(() => {
    const init = () => {
      if (!connected) return;
      void load();
    };
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connected]);

  const contextValue = useMemo<IAuthContext>(() => {
    return {
      authorized,
      store,
      token,
      loading,
      isLoggingIn,
      isLoggingOut,
      login,
      completeLogin,
      logout,
      loaded,
      userMeta,
      userMate: userMeta,
      user: userMeta,
      meta: userMeta,
      setUserMeta,
      setUserMate,
      refreshUserMeta,
      preLogout,
      logoutConfirm,
      destroy,
    };
  }, [
    authorized,
    isLoggingIn,
    isLoggingOut,
    loaded,
    loading,
    login,
    completeLogin,
    logout,
    logoutConfirm,
    preLogout,
    setUserMate,
    setUserMeta,
    refreshUserMeta,
    store,
    token,
    userMeta,
    destroy,
  ]);

  return (
    <AuthContext.Provider value={contextValue}>
      <>
        {children}
        <AuthLogoutOverlay
          active={isLoggingOut}
          name={userMeta?.alias || userMeta?.email?.split('@')[0] || undefined}
          avatarUrl={userMeta?.avatarUrl}
          signedOut={!authorized}
        />
        <SecurityLoginHosts onSignOut={() => void logout()} />
        <AuthLogoutConfirmDialog
          onConfirm={() => {
            setLogoutConfirm(false);
            void logout();
          }}
          onAbort={() => {
            setLogoutConfirm(false);
          }}
          active={logoutConfirm}
        />
      </>
    </AuthContext.Provider>
  );
};

export { AuthProvider };
