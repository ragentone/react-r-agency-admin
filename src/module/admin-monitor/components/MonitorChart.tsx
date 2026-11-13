import {
  CHART_DASHES,
  CHART_GRID,
  CHART_MUTED,
  CHART_WIDTHS,
  ChartBlock,
} from '@ui/patterns/chart';
import { ChartTooltip } from '@ui/shad-cn/components/chart.tsx';
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from 'recharts';

export interface IMonitorSeries<T> {
  key: string;
  label: string;
  value: (row: T) => number;
}

const tick = { fill: CHART_MUTED, fontSize: 11 };

/** Black/white line chart; series differ by dash pattern. `x` gives the label of a row. */
export const MonitorChart = <T,>({
  title,
  text,
  rows,
  x,
  series,
  format,
  max,
  plain = true,
}: {
  title: string;
  text: string;
  rows: T[];
  x: (row: T) => string;
  series: IMonitorSeries<T>[];
  format: (value: number) => string;
  max?: number;
  plain?: boolean;
}) => {
  const data = rows.map(row => ({
    time: x(row),
    ...Object.fromEntries(series.map(s => [s.key, s.value(row)])),
  }));
  return (
    <ChartBlock title={title} text={text} label={`${title}: ${text}`} plain={plain}>
      <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid vertical={false} stroke={CHART_GRID} strokeOpacity={0.5} />
        <XAxis dataKey="time" tick={tick} tickLine={false} axisLine={false} minTickGap={48} />
        <YAxis
          tick={tick}
          tickLine={false}
          axisLine={false}
          width={60}
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
