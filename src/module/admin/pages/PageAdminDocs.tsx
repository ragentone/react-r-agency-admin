import { RoleGate } from '@core/auth/roles/RoleGate.tsx';
import { RoutePage } from '@router/components';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { AdminNoAccess } from '../components/AdminNoAccess';
import { ADMIN_ROLES } from '../const';
import { AdminDocsArea } from '../docs/components/AdminDocsArea';
import { ADMIN_SCROLL, ADMIN_WIDTH } from '../ui/AdminPage';

/** `/admin/docs`: the runtime Markdown docs (menu „Dokumentation“). */
export const PageAdminDocs: React.FC = () => {
  const { t } = useTranslation('admin');
  return (
    <RoutePage
      width={ADMIN_WIDTH.base}
      scrollable={true}
      classes={{ scroll: ADMIN_SCROLL }}
      header={{ title: t('docs.title'), description: t('docs.subtitle') }}
    >
      <RoleGate roles={ADMIN_ROLES} fallback={<AdminNoAccess />}>
        <AdminDocsArea />
      </RoleGate>
    </RoutePage>
  );
};
