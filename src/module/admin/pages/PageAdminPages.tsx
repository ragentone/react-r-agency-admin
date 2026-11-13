import { RoleGate } from '@core/auth/roles/RoleGate.tsx';
import { RoutePage } from '@router/components';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { AdminNoAccess } from '../components/AdminNoAccess';
import { AdminPagesArea } from '../components/AdminPagesArea';
import { ADMIN_ROLES } from '../const';
import { ADMIN_SCROLL, ADMIN_WIDTH } from '../ui/AdminPage';

/** `/admin/pages`: dynamic pages. */
export const PageAdminPages: React.FC = () => {
  const { t } = useTranslation('admin');
  return (
    <RoutePage
      width={ADMIN_WIDTH.base}
      scrollable={true}
      classes={{ scroll: ADMIN_SCROLL }}
      header={{ title: t('pagesArea.title'), description: t('pagesArea.subtitle') }}
    >
      <RoleGate roles={ADMIN_ROLES} fallback={<AdminNoAccess />}>
        <AdminPagesArea />
      </RoleGate>
    </RoutePage>
  );
};
