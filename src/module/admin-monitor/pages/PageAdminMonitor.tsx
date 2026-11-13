import { RoleGate } from '@core/auth/roles/RoleGate.tsx';
import { RoutePage } from '@router/components';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { AdminNoAccess } from '../../admin/components/AdminNoAccess';
import { ADMIN_SCROLL, ADMIN_WIDTH } from '../../admin/ui/AdminPage';
import { MonitorArea } from '../components/MonitorArea';
import { ADMIN_MONITOR_ROLES } from '../const';

/** `/admin/monitor`: live server monitoring (own chunk). */
export const PageAdminMonitor: React.FC = () => {
  const { t } = useTranslation('admin-monitor');
  return (
    <RoutePage
      width={ADMIN_WIDTH.base}
      scrollable={true}
      classes={{ scroll: ADMIN_SCROLL }}
      header={{ title: t('title'), description: t('subtitle') }}
    >
      <RoleGate roles={ADMIN_MONITOR_ROLES} fallback={<AdminNoAccess />}>
        <MonitorArea />
      </RoleGate>
    </RoutePage>
  );
};
