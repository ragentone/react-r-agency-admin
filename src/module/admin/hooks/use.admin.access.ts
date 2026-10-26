import { useAuthStore } from '@core/auth/auth.store.tsx';
import { hasRoles } from '@core/auth/roles/roles.ts';

import { ADMIN_ROLES } from '../const';

/** Signed in with `admin:user` (the backend checks the same). */
export const useAdminAccess = (): boolean => {
  const authorized = useAuthStore(state => state.authorized);
  const user = useAuthStore(state => state.userMeta);
  return authorized && Boolean(user) && hasRoles(user, ADMIN_ROLES);
};
