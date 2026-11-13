import { Card } from '@ui/shad-cn/components/card.tsx';
import React from 'react';
import { useTranslation } from 'react-i18next';

import type { IMonitorHour } from '../../types.alert';
import { formatBytes, formatCount, formatRate, hourLabel } from '../../utils';
import { MonitorChart } from '../MonitorChart';

const pct = (value: number) => `${Math.round(value)} %`;
const ms = (value: number) => `${value} ms`;

/** Long-term CPU, memory, event loop, network and request history, one hour per point. */
export const MonitorHistoryCharts: React.FC<{ hours: IMonitorHour[] }> = ({ hours }) => {
  const { t } = useTranslation('admin-monitor');
  if (hours.length < 2) return null;
  const x = (row: IMonitorHour) => hourLabel(row.hour);
  return (
    <Card className="overflow-hidden rounded-xl border-border/50 shadow-none">
      <MonitorChart
        title={t('charts.cpu')}
        text={t('history.cpuText')}
        rows={hours}
        x={x}
        max={100}
        format={pct}
        plain={false}
        series={[
          { key: 'cpuAvg', label: t('history.avg'), value: row => row.cpuAvg },
          { key: 'cpuMax', label: t('history.max'), value: row => row.cpuMax },
        ]}
      />
      <MonitorChart
        title={t('charts.memory')}
        text={t('history.memoryText')}
        rows={hours}
        x={x}
        max={100}
        format={pct}
        plain={false}
        series={[
          { key: 'memAvg', label: t('history.avg'), value: row => row.memAvg },
          { key: 'memMax', label: t('history.max'), value: row => row.memMax },
        ]}
      />
      <MonitorChart
        title={t('charts.loop')}
        text={t('history.loopText')}
        rows={hours}
        x={x}
        format={ms}
        plain={false}
        series={[{ key: 'loopMax', label: t('history.max'), value: row => row.loopMax }]}
      />
      <MonitorChart
        title={t('charts.network')}
        text={t('history.networkText')}
        rows={hours}
        x={x}
        format={formatRate}
        plain={false}
        series={[
          { key: 'netRx', label: t('charts.down'), value: row => row.netRx },
          { key: 'netTx', label: t('charts.up'), value: row => row.netTx },
        ]}
      />
      <MonitorChart
        title={t('history.requestsTitle')}
        text={t('history.requestsText')}
        rows={hours}
        x={x}
        format={formatCount}
        series={[
          { key: 'requests', label: t('history.requests'), value: row => row.requests },
          { key: 'errors', label: t('history.errors'), value: row => row.errors },
        ]}
      />
      <MonitorChart
        title={t('history.diskTitle')}
        text={t('history.diskText')}
        rows={hours}
        x={x}
        format={formatBytes}
        series={[{ key: 'diskFree', label: t('history.diskFree'), value: row => row.diskFree }]}
      />
    </Card>
  );
};
