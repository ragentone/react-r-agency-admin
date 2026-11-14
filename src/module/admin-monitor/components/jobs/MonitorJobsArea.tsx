import { Skeleton } from '@ui/shad-cn/components/skeleton.tsx';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { HomeError } from '../../../admin/home/components/HomeSection';
import { useMonitorApp } from '../../hooks/use-monitor';
import { MonitorCron } from '../app/MonitorCron';

/** Tab "Jobs": cron jobs as a table. */
export const MonitorJobsArea: React.FC = () => {
  const { t } = useTranslation('admin-monitor');
  const { data, loading, error, reload } = useMonitorApp();

  if (loading) return <Skeleton className="h-72 rounded-xl" />;
  if (error && !data) {
    return <HomeError text={t('error')} retry={t('retry')} onRetry={() => void reload()} />;
  }
  if (!data) return null;
  return <MonitorCron cron={data.cron} />;
};
