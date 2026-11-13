import { Skeleton } from '@ui/shad-cn/components/skeleton.tsx';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { HomeError } from '../../../admin/home/components/HomeSection';
import { ADMIN_MONITOR_HISTORY_RANGES } from '../../const';
import { useMonitorHistory } from '../../hooks/use-monitor';
import { MonitorDiskForecast } from './MonitorDiskForecast';
import { MonitorHistoryCharts } from './MonitorHistoryCharts';
import { MonitorHistoryRange } from './MonitorHistoryRange';


/** Tab "History": range switch, disk forecast, hourly long-term charts. */
export const MonitorHistoryArea: React.FC = () => {
  const { t } = useTranslation('admin-monitor');
  const [hours, setHours] = useState<number>(ADMIN_MONITOR_HISTORY_RANGES[0]);
  const { data, loading, error, reload } = useMonitorHistory(hours);

  return (
    <div className="flex flex-col gap-4">
      <MonitorHistoryRange value={hours} onChange={setHours} />
      {loading && <Skeleton className="h-72 rounded-xl" />}
      {error && !data && (
        <HomeError text={t('error')} retry={t('retry')} onRetry={() => void reload()} />
      )}
      {data && (
        <>
          <MonitorDiskForecast diskFullInDays={data.diskFullInDays} />
          <MonitorHistoryCharts hours={data.hours} />
        </>
      )}
    </div>
  );
};
