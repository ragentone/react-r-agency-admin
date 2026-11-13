import { RoleGate } from '@core/auth/roles/RoleGate.tsx';
import { RoutePage } from '@router/components';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { AdminNoAccess } from '../components/AdminNoAccess';
import { AdminPagesArea } from '../components/AdminPagesArea';
import { ADMIN_ROLES } from '../const';

/** `/admin/pages`: dynamic pages. */
export const PageAdminPages: React.FC = () => {
  const { t } = useTranslation('admin');
  return (
    <RoutePage
      width={620}
      scrollable={true}
      classes={{ scroll: 'p-0' }}
      header={{ title: t('pagesArea.title'), description: t('pagesArea.subtitle') }}
    >
      <RoleGate roles={ADMIN_ROLES} fallback={<AdminNoAccess />}>
        <AdminPagesArea />
      </RoleGate>
    </RoutePage>
  );
};
