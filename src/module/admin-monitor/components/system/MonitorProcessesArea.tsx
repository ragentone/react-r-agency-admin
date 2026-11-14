import { Skeleton } from '@ui/shad-cn/components/skeleton.tsx';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { HomeError } from '../../../admin/home/components/HomeSection';
import { ADMIN_MONITOR_RANGES } from '../../const';
import { useMonitor } from '../../hooks/use-monitor';
import { MonitorProcesses } from './MonitorProcesses';

/** Tab "Processes": busiest processes of the server. */
export const MonitorProcessesArea: React.FC = () => {
  const { t } = useTranslation('admin-monitor');
  const { data, loading, error, reload } = useMonitor(ADMIN_MONITOR_RANGES[0]);

  if (loading) return <Skeleton className="h-72 rounded-xl" />;
  if (error && !data) {
    return <HomeError text={t('error')} retry={t('retry')} onRetry={() => void reload()} />;
  }
  if (!data) return null;
  return <MonitorProcesses processes={data.processes} />;
};
