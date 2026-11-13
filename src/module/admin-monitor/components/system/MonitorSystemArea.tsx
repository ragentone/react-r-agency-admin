import { Skeleton } from '@ui/shad-cn/components/skeleton.tsx';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { HomeError } from '../../../admin/home/components/HomeSection';
import { ADMIN_MONITOR_RANGES } from '../../const';
import { useMonitor } from '../../hooks/use-monitor';
import { MonitorRange } from '../MonitorRange';
import { MonitorSystem } from './MonitorSystem';

/** Tab "System": range switch, then machine and Node process (`MonitorSystem`). */
export const MonitorSystemArea: React.FC = () => {
  const { t } = useTranslation('admin-monitor');
  const [minutes, setMinutes] = useState<number>(ADMIN_MONITOR_RANGES[0]);
  const { data, loading, error, reload } = useMonitor(minutes);

  return (
    <div className="flex flex-col gap-4">
      <MonitorRange value={minutes} onChange={setMinutes} />
      {loading && <Skeleton className="h-72 rounded-xl" />}
      {error && !data && (
        <HomeError text={t('error')} retry={t('retry')} onRetry={() => void reload()} />
      )}
      {data && <MonitorSystem snapshot={data} />}
    </div>
  );
};
