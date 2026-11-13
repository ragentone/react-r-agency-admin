import { RoleGate } from '@core/auth/roles/RoleGate.tsx';
import { RoutePage } from '@router/components';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { AdminArea } from '../components/AdminArea';
import { AdminNoAccess } from '../components/AdminNoAccess';
import { ADMIN_ROLES } from '../const';
import { ADMIN_SCROLL, ADMIN_WIDTH } from '../ui/AdminPage';

/** `/admin`: user search + roles, own roles. */
export const PageAdmin: React.FC = () => {
  const { t } = useTranslation('admin');
  return (
    <RoutePage
      width={ADMIN_WIDTH.base}
      scrollable={true}
      classes={{ scroll: ADMIN_SCROLL }}
      header={{ title: t('title'), description: t('subtitle') }}
    >
      <RoleGate roles={ADMIN_ROLES} fallback={<AdminNoAccess />}>
        <AdminArea />
      </RoleGate>
    </RoutePage>
  );
};
