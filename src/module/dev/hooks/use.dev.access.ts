import { useAuthStore } from '@core/auth/auth.store.tsx';
import { hasRoles } from '@core/auth/roles/roles.ts';

import { DEV_ROLES } from '../const';

/** Signed in with `admin:user` or `dev:user` (the backend checks the same). */
export const useDevAccess = (): boolean => {
  const authorized = useAuthStore(state => state.authorized);
  const user = useAuthStore(state => state.userMeta);
  return authorized && Boolean(user) && hasRoles(user, DEV_ROLES);
};
