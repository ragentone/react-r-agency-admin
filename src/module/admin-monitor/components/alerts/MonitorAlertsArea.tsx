import { Skeleton } from '@ui/shad-cn/components/skeleton.tsx';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { HomeError } from '../../../admin/home/components/HomeSection';
import { useMonitorAlerts } from '../../hooks/use-monitor';
import { MonitorAlertsActive } from './MonitorAlertsActive';
import { MonitorAlertsLog } from './MonitorAlertsLog';
import { MonitorThresholds } from './MonitorThresholds';

/** Tab "Alerts": open alerts, alert log, editable thresholds (settings last). */
export const MonitorAlertsArea: React.FC = () => {
  const { t } = useTranslation('admin-monitor');
  const { data, loading, error, reload } = useMonitorAlerts();

  if (loading) return <Skeleton className="h-72 rounded-xl" />;
  if (error && !data) {
    return <HomeError text={t('error')} retry={t('retry')} onRetry={() => void reload()} />;
  }
  if (!data) return null;

  return (
    <div className="flex flex-col gap-4">
      <MonitorAlertsActive active={data.active} />
      <MonitorAlertsLog log={data.log} />
      <MonitorThresholds thresholds={data.thresholds} onSaved={() => reload()} />
    </div>
  );
};
