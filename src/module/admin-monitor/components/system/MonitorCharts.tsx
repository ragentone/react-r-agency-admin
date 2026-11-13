import { Card } from '@ui/shad-cn/components/card.tsx';
import React from 'react';
import { useTranslation } from 'react-i18next';

import type { IMonitorSample } from '../../types';
import { clock, formatBytes, formatRate, percent } from '../../utils';
import { MonitorChart } from '../MonitorChart';

const pct = (value: number) => `${Math.round(value)} %`;
const ms = (value: number) => `${value} ms`;

/** CPU, memory, network, event loop and process history in one card. */
export const MonitorCharts: React.FC<{ history: IMonitorSample[] }> = ({ history }) => {
  const { t } = useTranslation('admin-monitor');
  if (history.length < 2) return null;
  const x = (s: IMonitorSample) => clock(s.t);
  return (
    <Card className="overflow-hidden rounded-xl border-border/50 shadow-none">
      <MonitorChart
        title={t('charts.cpu')}
        text={t('charts.cpuText')}
        rows={history}
        x={x}
        max={100}
        format={pct}
        plain={false}
        series={[
          { key: 'cpu', label: t('charts.system'), value: s => s.cpu },
          { key: 'procCpu', label: t('charts.process'), value: s => s.procCpu },
        ]}
      />
      <MonitorChart
        title={t('charts.memory')}
        text={t('charts.memoryText')}
        rows={history}
        x={x}
        max={100}
        format={pct}
        plain={false}
        series={[
          { key: 'mem', label: t('charts.system'), value: s => percent(s.memUsed, s.memTotal) },
          { key: 'swap', label: 'Swap', value: s => percent(s.swapUsed, s.swapTotal) },
        ]}
      />
      <MonitorChart
        title={t('charts.network')}
        text={t('charts.networkText')}
        rows={history}
        x={x}
        format={formatRate}
        plain={false}
        series={[
          { key: 'rx', label: t('charts.down'), value: s => s.netRx },
          { key: 'tx', label: t('charts.up'), value: s => s.netTx },
        ]}
      />
      <MonitorChart
        title={t('charts.loop')}
        text={t('charts.loopText')}
        rows={history}
        x={x}
        format={ms}
        plain={false}
        series={[
          { key: 'loop', label: 'p99', value: s => s.loopMs },
          { key: 'gc', label: 'GC', value: s => s.gcMs },
        ]}
      />
      <MonitorChart
        title={t('charts.process')}
        text={t('charts.processText')}
        rows={history}
        x={x}
        format={formatBytes}
        series={[
          { key: 'rss', label: 'RSS', value: s => s.rss },
          { key: 'heap', label: 'Heap', value: s => s.heapUsed },
        ]}
      />
    </Card>
  );
};
