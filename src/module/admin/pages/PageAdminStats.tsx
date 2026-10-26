import { RoleGate } from '@core/auth/roles/RoleGate.tsx';
import { RoutePage } from '@router/components';
import React from 'react';

import { AdminNoAccess } from '../components/AdminNoAccess';
import { ADMIN_ROLES } from '../const';
import { StatsArea } from '../stats/components/StatsArea';

/** `/admin/stats`: visitor statistics (own chunk incl. recharts). */
export const PageAdminStats: React.FC = () => (
  <RoutePage width={900} scrollable={true} classes={{ scroll: 'p-0' }}>
    <RoleGate roles={ADMIN_ROLES} fallback={<AdminNoAccess />}>
      <StatsArea />
    </RoleGate>
  </RoutePage>
);
