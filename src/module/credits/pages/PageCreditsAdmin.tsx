import { RoleGate } from '@core/auth/roles/RoleGate.tsx';
import { AdminNoAccess } from '@module/admin/components/AdminNoAccess';
import { RoutePage } from '@router/components';
import React from 'react';

import { CreditsAdminView } from '../admin/CreditsAdminView.tsx';
import { CREDITS_ADMIN_ROLES } from '../const.ts';

/** `/admin/credits`: credits of all users (`admin:user`, checked again by the runtime). */
export const PageCreditsAdmin: React.FC = () => (
  <RoutePage width={720} scrollable={true} classes={{ scroll: 'p-0' }}>
    <RoleGate roles={CREDITS_ADMIN_ROLES} fallback={<AdminNoAccess />}>
      <CreditsAdminView />
    </RoleGate>
  </RoutePage>
);
