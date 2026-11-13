import { RoleGate } from '@core/auth/roles/RoleGate.tsx';
import { RoutePage } from '@router/components';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { AdminNoAccess } from '../../admin/components/AdminNoAccess';
import { ADMIN_SCROLL, ADMIN_WIDTH } from '../../admin/ui/AdminPage';
import { CronArea } from '../components/CronArea';
import { ADMIN_CRON_ROLES } from '../const';

/** `/admin/cron`: scheduled jobs, state and manual run (own chunk). */
export const PageAdminCron: React.FC = () => {
  const { t } = useTranslation('admin-cron');
  return (
    <RoutePage
      width={ADMIN_WIDTH.base}
      scrollable={true}
      classes={{ scroll: ADMIN_SCROLL }}
      header={{ title: t('title'), description: t('subtitle') }}
    >
      <RoleGate roles={ADMIN_CRON_ROLES} fallback={<AdminNoAccess />}>
        <CronArea />
      </RoleGate>
    </RoutePage>
  );
};
