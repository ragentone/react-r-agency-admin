import {
  CHART_DASHES,
  CHART_GRID,
  CHART_MUTED,
  CHART_WIDTHS,
  ChartBlock,
} from '@ui/patterns/chart';
import { ChartTooltip } from '@ui/shad-cn/components/chart.tsx';
import React from 'react';
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from 'recharts';

import type { IMonitorSample } from '../types';
import { clock } from '../utils';

export interface IMonitorSeries {
  key: string;
  label: string;
  value: (sample: IMonitorSample) => number;
}

const tick = { fill: CHART_MUTED, fontSize: 11 };

/** Black/white line chart of the sample history; series differ by dash pattern. */
export const MonitorChart: React.FC<{
  title: string;
  text: string;
  history: IMonitorSample[];
  series: IMonitorSeries[];
  format: (value: number) => string;
  max?: number;
}> = ({ title, text, history, series, format, max }) => {
  const data = history.map(sample => ({
    time: clock(sample.t),
    ...Object.fromEntries(series.map(s => [s.key, s.value(sample)])),
  }));
  return (
    <ChartBlock title={title} text={text} label={`${title}: ${text}`} plain>
      <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid vertical={false} stroke={CHART_GRID} strokeOpacity={0.5} />
        <XAxis dataKey="time" tick={tick} tickLine={false} axisLine={false} minTickGap={48} />
        <YAxis
          tick={tick}
          tickLine={false}
          axisLine={false}
          width={56}
          domain={[0, max ?? 'auto']}
          tickFormatter={format}
        />
        <ChartTooltip formatter={(value, name) => [format(Number(value)), name]} />
        {series.map((entry, index) => (
          <Line
            key={entry.key}
            dataKey={entry.key}
            name={entry.label}
            type="monotone"
            stroke="var(--foreground)"
            strokeDasharray={CHART_DASHES[index]}
            strokeWidth={CHART_WIDTHS[index]}
            dot={false}
            isAnimationActive={false}
          />
        ))}
      </LineChart>
    </ChartBlock>
  );
};
