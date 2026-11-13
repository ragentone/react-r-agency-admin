import { RoleGate } from '@core/auth/roles/RoleGate.tsx';
import { RoutePage } from '@router/components';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { AdminNoAccess } from '../components/AdminNoAccess';
import { ADMIN_ROLES } from '../const';
import { SystemArea } from '../system/components/SystemArea';
import { ADMIN_SCROLL, ADMIN_WIDTH } from '../ui/AdminPage';

/** `/admin/system`: version + deploys, server storage (own chunk). */
export const PageAdminSystem: React.FC = () => {
  const { t } = useTranslation('admin');
  return (
    <RoutePage
      width={ADMIN_WIDTH.base}
      scrollable={true}
      classes={{ scroll: ADMIN_SCROLL }}
      header={{ title: t('system.title'), description: t('system.subtitle') }}
    >
      <RoleGate roles={ADMIN_ROLES} fallback={<AdminNoAccess />}>
        <SystemArea />
      </RoleGate>
    </RoutePage>
  );
};
