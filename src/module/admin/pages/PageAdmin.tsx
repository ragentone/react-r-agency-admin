import { RoleGate } from '@core/auth/roles/RoleGate.tsx';
import { RoutePage } from '@router/components';
import React from 'react';

import { AdminArea } from '../components/AdminArea';
import { AdminNoAccess } from '../components/AdminNoAccess';
import { ADMIN_ROLES } from '../const';

/** `/admin`: user search + roles, own roles. */
export const PageAdmin: React.FC = () => (
  <RoutePage width={620} scrollable={true} classes={{ scroll: 'p-0' }}>
    <RoleGate roles={ADMIN_ROLES} fallback={<AdminNoAccess />}>
      <AdminArea />
    </RoleGate>
  </RoutePage>
);
