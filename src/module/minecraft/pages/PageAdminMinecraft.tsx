import { RoleGate } from '@core/auth/roles/RoleGate.tsx';
import { RoutePage } from '@router/components';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { AdminNoAccess } from '../../admin/components/AdminNoAccess';
import { ADMIN_SCROLL, ADMIN_WIDTH, AdminPage } from '../../admin/ui/AdminPage';
import { MinecraftServerList } from '../components/MinecraftServerList';
import { ADMIN_MINECRAFT_ROLES } from '../const';

/** `/admin/minecraft`: Server anlegen, starten, stoppen und überwachen (eigener Chunk). */
export const PageAdminMinecraft: React.FC = () => {
  const { t } = useTranslation('minecraft');
  return (
    <RoutePage
      width={ADMIN_WIDTH.base}
      scrollable={true}
      classes={{ scroll: ADMIN_SCROLL }}
      header={{ title: t('title'), description: t('subtitle') }}
    >
      <RoleGate roles={ADMIN_MINECRAFT_ROLES} fallback={<AdminNoAccess />}>
        <AdminPage>
          <MinecraftServerList />
        </AdminPage>
      </RoleGate>
    </RoutePage>
  );
};
