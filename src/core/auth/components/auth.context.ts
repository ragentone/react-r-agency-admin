import type { IAuthStore } from '@core/auth/auth.store.tsx';
import type { IAuthTokenStore } from '@core/auth/auth.token.store.tsx';
import type { IUserMetaData } from '@core/auth/types/config.ts';
import type { ILoginParams } from '@core/auth/types/login.ts';
import { createContext } from 'react';

export interface IAuthContext {
  authorized: boolean;
  store: IAuthStore;
  token: IAuthTokenStore;
  loading: boolean;
  isLoggingIn: boolean;
  isLoggingOut: boolean;
  login: (params: ILoginParams) => Promise<void>;
  /** Finishes a sign-in of the new flow (runtime shared/auth): token, meta, follow-up dialogs. */
  completeLogin: (
    result: {
      authToken?: string | null;
      userId?: string | null;
      meta?: unknown;
      deletionPending?: string | null;
    },
    options?: { offerPasskey?: boolean }
  ) => Promise<void>;
  logout(): void;
  preLogout(): void;
  logoutConfirm: boolean;
  loaded: boolean;
  userMeta?: IUserMetaData | null;
  userMate?: IUserMetaData | null;
  user?: IUserMetaData | null;
  meta?: IUserMetaData | null;
  setUserMeta: (meta: IUserMetaData | undefined | null) => void;
  /** Reloads `userMeta` from the backend (e.g. after the account was updated). */
  refreshUserMeta: () => Promise<IUserMetaData | null>;
  setUserMate: (meta: IUserMetaData | undefined | null) => void;
  destroy(): void;
}

/**
 * Auth context – lives in its own module (not in `AuthProvider.tsx`) so a hot reload of the
 * provider keeps the same context object and mounted consumers stay connected.
 */
export const AuthContext = createContext<IAuthContext | undefined>(undefined);
