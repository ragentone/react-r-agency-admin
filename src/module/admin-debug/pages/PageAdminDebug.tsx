import { RoleGate } from '@core/auth/roles/RoleGate.tsx';
import { RoutePage } from '@router/components';
import React from 'react';

import { AdminNoAccess } from '../../admin/components/AdminNoAccess';
import { ADMIN_DEBUG_ROLES } from '../const';
import { DebugReportsArea } from '../components/DebugReportsArea';

/** `/admin/debug`: stored client debug reports (own chunk). */
export const PageAdminDebug: React.FC = () => (
  <RoutePage width={900} scrollable={true} classes={{ scroll: 'p-0' }}>
    <RoleGate roles={ADMIN_DEBUG_ROLES} fallback={<AdminNoAccess />}>
      <DebugReportsArea />
    </RoleGate>
  </RoutePage>
);
