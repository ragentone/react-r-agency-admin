import { StatTile } from '@ui/patterns/chart';
import { Cpu, Gauge, MemoryStick, Timer } from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next';

import type { IMonitorSnapshot } from '../types';
import { formatBytes, percent } from '../utils';

/** Four key figures with a sparkline each. */
export const MonitorTiles: React.FC<{ snapshot: IMonitorSnapshot }> = ({ snapshot }) => {
  const { t } = useTranslation('admin-monitor');
  const { current, history, host } = snapshot;
  if (!current) return <p className="text-body text-muted-foreground">{t('waiting')}</p>;

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      <StatTile
        icon={<Cpu />}
        label={t('tiles.cpu')}
        value={`${current.cpu.toFixed(0)} %`}
        hint={t('tiles.load', { load: host.load[0], cores: host.cpuCount })}
        spark={history.map(s => s.cpu)}
      />
      <StatTile
        icon={<MemoryStick />}
        label={t('tiles.memory')}
        value={`${percent(current.memUsed, current.memTotal)} %`}
        hint={`${formatBytes(current.memUsed)} / ${formatBytes(current.memTotal)}`}
        spark={history.map(s => percent(s.memUsed, s.memTotal))}
      />
      <StatTile
        icon={<Gauge />}
        label={t('tiles.process')}
        value={formatBytes(current.rss)}
        hint={t('tiles.heap', { heap: formatBytes(current.heapUsed) })}
        spark={history.map(s => s.rss)}
      />
      <StatTile
        icon={<Timer />}
        label={t('tiles.loop')}
        value={`${current.loopMs} ms`}
        hint={t('tiles.loopHint')}
        spark={history.map(s => s.loopMs)}
      />
    </div>
  );
};
