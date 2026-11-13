import { RoleGate } from '@core/auth/roles/RoleGate.tsx';
import { RoutePage } from '@router/components';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { AdminNoAccess } from '../components/AdminNoAccess';
import { ADMIN_ROLES } from '../const';
import { SystemArea } from '../system/components/SystemArea';

/** `/admin/system`: version + deploys, server storage (own chunk). */
export const PageAdminSystem: React.FC = () => {
  const { t } = useTranslation('admin');
  return (
    <RoutePage
      width={900}
      scrollable={true}
      classes={{ scroll: 'p-0' }}
      header={{ title: t('system.title'), description: t('system.subtitle') }}
    >
      <RoleGate roles={ADMIN_ROLES} fallback={<AdminNoAccess />}>
        <SystemArea />
      </RoleGate>
    </RoutePage>
  );
};
