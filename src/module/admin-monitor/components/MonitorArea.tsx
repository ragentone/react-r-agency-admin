import { Skeleton } from '@ui/shad-cn/components/skeleton.tsx';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { HomeError } from '../../admin/home/components/HomeSection';
import { AdminPage } from '../../admin/ui/AdminPage';
import { ADMIN_MONITOR_RANGES } from '../const';
import { useMonitor } from '../hooks/use-monitor';
import { MonitorCharts } from './MonitorCharts';
import { MonitorDisks } from './MonitorDisks';
import { MonitorHost } from './MonitorHost';
import { MonitorRange } from './MonitorRange';
import { MonitorTiles } from './MonitorTiles';

/** Composes the monitor page: range switch, key figures, charts, disks, host. */
export const MonitorArea: React.FC = () => {
  const { t } = useTranslation('admin-monitor');
  const [minutes, setMinutes] = useState<number>(ADMIN_MONITOR_RANGES[0]);
  const { data, loading, error, reload } = useMonitor(minutes);

  return (
    <AdminPage>
      <MonitorRange value={minutes} onChange={setMinutes} />
      {loading && <Skeleton className="h-72 rounded-xl" />}
      {error && !data && (
        <HomeError text={t('error')} retry={t('retry')} onRetry={() => void reload()} />
      )}
      {data && (
        <>
          <MonitorTiles snapshot={data} />
          <MonitorCharts history={data.history} />
          <MonitorDisks disks={data.disks} />
          <MonitorHost host={data.host} />
        </>
      )}
    </AdminPage>
  );
};
