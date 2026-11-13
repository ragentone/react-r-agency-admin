import { Card } from '@ui/shad-cn/components/card.tsx';
import React from 'react';
import { useTranslation } from 'react-i18next';

import type { IMonitorSample } from '../types';
import { formatBytes, percent } from '../utils';
import { MonitorChart } from './MonitorChart';

const pct = (value: number) => `${Math.round(value)} %`;

/** CPU, memory and event loop history in one card. */
export const MonitorCharts: React.FC<{ history: IMonitorSample[] }> = ({ history }) => {
  const { t } = useTranslation('admin-monitor');
  if (history.length < 2) return null;
  return (
    <Card className="overflow-hidden rounded-xl border-border/50 shadow-none">
      <MonitorChart
        title={t('charts.cpu')}
        text={t('charts.cpuText')}
        history={history}
        max={100}
        format={pct}
        series={[
          { key: 'cpu', label: t('charts.system'), value: s => s.cpu },
          { key: 'procCpu', label: t('charts.process'), value: s => s.procCpu },
        ]}
      />
      <MonitorChart
        title={t('charts.memory')}
        text={t('charts.memoryText')}
        history={history}
        max={100}
        format={pct}
        series={[
          { key: 'mem', label: t('charts.system'), value: s => percent(s.memUsed, s.memTotal) },
        ]}
      />
      <MonitorChart
        title={t('charts.loop')}
        text={t('charts.loopText')}
        history={history}
        format={value => `${value} ms`}
        series={[{ key: 'loop', label: 'p99', value: s => s.loopMs }]}
      />
      <MonitorChart
        title={t('charts.process')}
        text={t('charts.processText')}
        history={history}
        format={formatBytes}
        series={[
          { key: 'rss', label: 'RSS', value: s => s.rss },
          { key: 'heap', label: 'Heap', value: s => s.heapUsed },
        ]}
      />
    </Card>
  );
};
