import type { ILoginParams, IUserMetaData } from '@core/auth/types';
import type { ParsedLocation } from '@tanstack/react-router';
import { create } from 'zustand/react';

export interface IAuthStore {
  authorized: boolean;
  loginParams: ILoginParams | undefined;
  afterLoginRoute: ParsedLocation | undefined;
  loginSuccess: boolean;
  userMeta: IUserMetaData | undefined | null;
  userMate: IUserMetaData | undefined | null;
  user: IUserMetaData | undefined | null;
  meta: IUserMetaData | undefined | null;
  setUserMeta(meta: IUserMetaData | undefined | null): void;
  setUserMate(meta: IUserMetaData | undefined | null): void;
  setLoginSuccess(success: boolean): void;
  setAfterLoginRoute(route: ParsedLocation | undefined): void;
  setLoginParams(params: ILoginParams | undefined): void;
  setAuthorized(is: boolean): void;
  isAuthorized(): boolean;
  destroy(): void;
}

/**
 * State management store for handling authentication details and operations.
 * This store provides a centralized mechanism to manage authentication status
 * and authorization tokens. It includes methods to update the state, check
 * authorization, set authentication tokens, and reset the state.
 * Properties:
 * - `authorized` (boolean): Indicates whether the user is authorized.
 * - `authToken` (string | undefined): Stores the authentication token if available.
 * Methods:
 * - `setAuthorized(is: boolean): void`: Updates the `authorized` state.
 * - `isAuthorized(): boolean`: Retrieves the current `authorized` state.
 * - `setAuthToken(token: string | undefined): void`: Updates the `authToken` value.
 * - `destroy(): void`: Resets the authentication state, marking the user as unauthorized
 *   and clearing the authorization token.
 */
const authStore = create<IAuthStore>((set, get) => ({
  authorized: false,
  loginParams: undefined,
  afterLoginRoute: undefined,
  loginSuccess: false,
  userMeta: undefined,
  userMate: undefined,
  user: undefined,
  meta: undefined,
  setUserMeta(meta: IUserMetaData | undefined | null) {
    set({
      userMeta: meta,
      userMate: meta,
      user: meta,
      meta: meta,
    });
  },
  setUserMate(meta: IUserMetaData | undefined | null) {
    set({
      userMeta: meta,
      userMate: meta,
      user: meta,
      meta: meta,
    });
  },
  setLoginSuccess(success: boolean) {
    set({ loginSuccess: success });
  },
  setAfterLoginRoute(route: ParsedLocation | undefined) {
    set({ afterLoginRoute: route });
  },
  setLoginParams(params: ILoginParams | undefined) {
    set({ loginParams: params });
  },
  setAuthorized(is: boolean) {
    set({ authorized: is });
  },
  isAuthorized(): boolean {
    return get().authorized;
  },
  destroy() {
    set({
      authorized: false,
      loginParams: undefined,
      afterLoginRoute: undefined,
      loginSuccess: false,
      userMeta: undefined,
      userMate: undefined,
      user: undefined,
      meta: undefined,
    });
  },
}));

const useAuthStore = authStore;

export { useAuthStore };
