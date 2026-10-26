import { UserRoleFallback } from '@core/auth';
import type { ReactNode } from 'react';

import { type IRoleCheckOptions, type RoleQuery, useHasRoles } from '../../roles';
import { useAuth } from '../use.auth.ts';

interface IProps extends IRoleCheckOptions {
  /**
   * Required role(s) – same syntax as `<RoleGate>`:
   * `'admin:user'`, `['admin:user', 'dev:user']` (= OR), `'admin:user && !google:user'`, `{ and: [...] }`.
   * Omitted / empty → every logged-in user passes.
   */
  role?: RoleQuery;
  children: ReactNode;
  /** Rendered when the check fails (default nothing). */
  fallback?: ReactNode;
}

/**
 * Renders `children` only for logged-in users whose roles satisfy `role`.
 * Unlike `<RoleGate>`, a login is always required – also for `!…` queries.
 *
 * Display only – the backend checks the actual permission.
 */
const UserRole = ({ role, children, fallback = <UserRoleFallback />, ...options }: IProps) => {
  const { authorized } = useAuth();
  const allowed = useHasRoles(role, options);

  if (!role) {
    return <>{children}</>;
  }

  return authorized && allowed ? <>{children}</> : <>{fallback}</>;
};

export { UserRole };
