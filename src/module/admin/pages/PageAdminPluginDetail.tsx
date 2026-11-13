import { RoleGate } from '@core/auth/roles/RoleGate.tsx';
import { AdminNoAccess } from '@module/admin/components';
import { RoutePage } from '@router/components';
import { useParams } from '@tanstack/react-router';
import React from 'react';

import { ADMIN_ROLES } from '../const';
import { PluginDetailPage } from '../plugins/components/PluginDetailPage';
import { ADMIN_SCROLL, ADMIN_WIDTH } from '../ui/AdminPage';

/** `/admin/plugins/:pluginId`: one plugin with all its actions (own chunk). */
export const PageAdminPluginDetail: React.FC = () => {
  const { pluginId } = useParams({ strict: false }) as { pluginId?: string };
  return (
    <RoleGate
      roles={ADMIN_ROLES}
      fallback={
        <RoutePage width={ADMIN_WIDTH.narrow} scrollable={true} classes={{ scroll: ADMIN_SCROLL }}>
          <AdminNoAccess />
        </RoutePage>
      }
    >
      <PluginDetailPage pluginId={pluginId ?? ''} />
    </RoleGate>
  );
};
