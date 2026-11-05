import { RoleGate } from '@core/auth/roles/RoleGate.tsx';
import { RoutePage } from '@router/components';
import React from 'react';

import { AdminNoAccess } from '../components/AdminNoAccess';
import { ADMIN_ROLES } from '../const';
import { AdminDocsArea } from '../docs/components/AdminDocsArea';

/** `/admin/docs`: the runtime Markdown docs (menu „Dokumentation“). */
export const PageAdminDocs: React.FC = () => (
  <RoutePage width={900} scrollable={true} classes={{ scroll: 'p-0' }}>
    <RoleGate roles={ADMIN_ROLES} fallback={<AdminNoAccess />}>
      <AdminDocsArea />
    </RoleGate>
  </RoutePage>
);
