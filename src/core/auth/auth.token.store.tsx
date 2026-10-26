import { persist } from 'zustand/middleware';
import { create } from 'zustand/react';

export interface IAuthTokenStore {
  token: string | undefined;
  setToken: (token: string | undefined) => void;
  hasToken: () => boolean;
  destroy: () => void;
}

export const useAuthTokenStore = create<IAuthTokenStore>()(
  persist(
    (set, get) => ({
      token: undefined,
      setToken: token => set({ token }),
      destroy: () => set({ token: undefined }),
      hasToken: () => typeof get().token === 'string',
    }),
    {
      name: 'auth-token-store',
    }
  )
);

export default useAuthTokenStore;
