import { RoleGate } from '@core/auth/roles/RoleGate.tsx';
import { RoutePage } from '@router/components';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { AdminNoAccess } from '../../admin/components/AdminNoAccess';
import { DebugReportsArea } from '../components/DebugReportsArea';
import { ADMIN_DEBUG_ROLES } from '../const';

/** `/admin/debug`: stored client debug reports (own chunk). */
export const PageAdminDebug: React.FC = () => {
  const { t } = useTranslation('admin-debug');
  return (
    <RoutePage
      width={900}
      scrollable={true}
      classes={{ scroll: 'p-0' }}
      header={{ title: t('title'), description: t('subtitle') }}
    >
      <RoleGate roles={ADMIN_DEBUG_ROLES} fallback={<AdminNoAccess />}>
        <DebugReportsArea />
      </RoleGate>
    </RoutePage>
  );
};
