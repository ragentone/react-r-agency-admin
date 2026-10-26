import { RoleGate } from '@core/auth/roles/RoleGate.tsx';
import { RoutePage } from '@router/components';
import React from 'react';

import { AdminNoAccess } from '../components/AdminNoAccess';
import { ADMIN_ROLES } from '../const';
import { SystemArea } from '../system/components/SystemArea';

/** `/admin/system`: version + deploys, server storage (own chunk). */
export const PageAdminSystem: React.FC = () => (
  <RoutePage width={900} scrollable={true} classes={{ scroll: 'p-0' }}>
    <RoleGate roles={ADMIN_ROLES} fallback={<AdminNoAccess />}>
      <SystemArea />
    </RoleGate>
  </RoutePage>
);
