import { RoleGate } from '@core/auth/roles/RoleGate.tsx';
import { RoutePage } from '@router/components';
import React from 'react';

import { AdminNoAccess } from '../components/AdminNoAccess';
import { ADMIN_ROLES } from '../const';
import { PluginArea } from '../plugins/components/PluginArea';

/** `/admin/plugins`: installed plugins and plugin ZIP upload (own chunk). */
export const PageAdminPlugins: React.FC = () => (
  <RoutePage width={900} scrollable={true} classes={{ scroll: 'p-0' }}>
    <RoleGate roles={ADMIN_ROLES} fallback={<AdminNoAccess />}>
      <PluginArea />
    </RoleGate>
  </RoutePage>
);
