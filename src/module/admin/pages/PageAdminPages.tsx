import { RoleGate } from '@core/auth/roles/RoleGate.tsx';
import { RoutePage } from '@router/components';
import React from 'react';

import { AdminNoAccess } from '../components/AdminNoAccess';
import { AdminPagesArea } from '../components/AdminPagesArea';
import { ADMIN_ROLES } from '../const';

/** `/admin/pages`: dynamic pages. */
export const PageAdminPages: React.FC = () => (
  <RoutePage width={620} scrollable={true} classes={{ scroll: 'p-0' }}>
    <RoleGate roles={ADMIN_ROLES} fallback={<AdminNoAccess />}>
      <AdminPagesArea />
    </RoleGate>
  </RoutePage>
);
