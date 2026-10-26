import { useAuthStore } from '@core/auth/auth.store.tsx';
import { hasRoles } from '@core/auth/roles/roles.ts';

import { FILE_SHARE_ROLES } from '../const';

/** Signed in (sees files for signed-in users). */
export const useFileShareAuthorized = (): boolean => useAuthStore(state => state.authorized);

/** Signed in with `admin:user` – may upload, edit and delete (the backend checks the same). */
export const useFileShareAdmin = (): boolean => {
  const authorized = useAuthStore(state => state.authorized);
  const user = useAuthStore(state => state.userMeta);
  return authorized && Boolean(user) && hasRoles(user, FILE_SHARE_ROLES);
};
