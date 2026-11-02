import { RoleGate } from '@core/auth/roles/RoleGate.tsx';
import { RoutePage } from '@router/components';
import { useParams } from '@tanstack/react-router';
import React from 'react';

import { AdminNoAccess } from '../components/AdminNoAccess';
import { ADMIN_ROLES } from '../const';
import { PluginDetailPage } from '../plugins/components/PluginDetailPage';

/** `/admin/plugins/:pluginId`: one plugin with all its actions (own chunk). */
export const PageAdminPluginDetail: React.FC = () => {
  const { pluginId } = useParams({ strict: false }) as { pluginId?: string };
  return (
    <RoutePage width={900} scrollable={true} classes={{ scroll: 'p-0' }}>
      <RoleGate roles={ADMIN_ROLES} fallback={<AdminNoAccess />}>
        <PluginDetailPage pluginId={pluginId ?? ''} />
      </RoleGate>
    </RoutePage>
  );
};
