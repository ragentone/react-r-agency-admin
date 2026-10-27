import { RoleGate } from '@core/auth/roles/RoleGate.tsx';
import { AdminNoAccess } from '@module/admin/components/AdminNoAccess';
import { RoutePage } from '@router/components';
import React from 'react';

import { PokerAdminView } from '../admin/PokerAdminView.tsx';
import { POKER_ADMIN_ROLES } from '../const.ts';

/** `/admin/poker` (`admin:user`, checked again by the runtime). */
export const PagePokerAdmin: React.FC = () => (
  <RoutePage width={760} scrollable={true} classes={{ scroll: 'p-0' }}>
    <RoleGate roles={POKER_ADMIN_ROLES} fallback={<AdminNoAccess />}>
      <PokerAdminView />
    </RoleGate>
  </RoutePage>
);
