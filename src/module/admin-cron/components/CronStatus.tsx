import { Status, StatusIndicator } from '@ui/shad-cn/components/status.tsx';
import React from 'react';
import { useTranslation } from 'react-i18next';

import type { ICronJob } from '../types';

/** `running` (info), `inactive` (muted) or `scheduled` (default). */
export const CronStatus: React.FC<{ job: ICronJob }> = ({ job }) => {
  const { t } = useTranslation('admin-cron');
  const key = !job.active ? 'inactive' : job.status === 'running' ? 'running' : 'scheduled';
  return (
    <Status variant={key === 'running' ? 'info' : 'default'}>
      <StatusIndicator />
      {t(`status.${key}`)}
    </Status>
  );
};
