import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@ui/shad-cn/components/chart';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  Line,
  LineChart,
  Pie,
  PieChart,
  XAxis,
  YAxis,
} from 'recharts';

import type { IChartBlockData } from './types';

const CONFIG: ChartConfig = { value: { label: 'Value', color: 'var(--foreground)' } };
const SERIES = 'var(--color-value)';

type Domain = [number, number];
/** Bars start at zero (negative values stay visible), headroom for the value labels. */
const barDomain = ([min, max]: Domain): Domain => [Math.min(0, min * 1.2), Math.max(0, max * 1.2)];
/** Line: fit the data (no empty half), with room above and below. */
const lineDomain = ([min, max]: Domain): Domain => {
  const pad = (max - min || Math.abs(max) || 1) * 0.3;
  return [min - pad, max + pad];
};

/** Pie slices: the foreground colour in fading steps (black / white design). */
const sliceOpacity = (index: number, count: number) =>
  count <= 1 ? 1 : Math.max(0.15, 1 - (index / count) * 0.85);

/** Bars, line or pie of one data series – values typed in by hand, no data is fetched. */
export const ChartBlock: React.FC<{ data: IChartBlockData }> = ({ data }) => {
  const { i18n } = useTranslation('admin');
  const format = useMemo(() => {
    const number = new Intl.NumberFormat(i18n.language, { maximumFractionDigits: 2 });
    return (value: number) => `${number.format(value)}${data.unit ? ` ${data.unit}` : ''}`;
  }, [i18n.language, data.unit]);
  const points = data.items
    .filter(item => item.label || item.value)
    .map((item, index) => ({ label: item.label || String(index + 1), value: item.value }));
  if (!points.length) return null;
  const valueLabels = (offset: number) =>
    data.showValues ? (
      <LabelList
        dataKey="value"
        position="top"
        offset={offset}
        formatter={(value: unknown) => format(Number(value))}
        className="fill-foreground text-caption"
      />
    ) : null;
  return (
    <figure>
      {data.title && <h2 className="mb-4 text-xl font-bold tracking-tight">{data.title}</h2>}
      <ChartContainer config={CONFIG} className="aspect-[4/3] w-full sm:aspect-video">
        {data.kind === 'pie' ? (
          <PieChart>
            <ChartTooltip content={<ChartTooltipContent hideLabel nameKey="label" />} />
            <Pie
              data={points}
              dataKey="value"
              nameKey="label"
              innerRadius="45%"
              stroke="var(--background)"
            >
              {points.map((_, index) => (
                <Cell
                  key={index}
                  fill="var(--foreground)"
                  fillOpacity={sliceOpacity(index, points.length)}
                />
              ))}
            </Pie>
          </PieChart>
        ) : data.kind === 'line' ? (
          <LineChart data={points} margin={{ top: 28, bottom: 4, left: 8, right: 8 }}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              tickMargin={10}
              interval={0}
              padding={{ left: 28, right: 28 }}
            />
            <YAxis hide domain={lineDomain} />
            <ChartTooltip content={<ChartTooltipContent hideLabel={false} />} />
            <Line
              dataKey="value"
              type="monotone"
              stroke={SERIES}
              strokeWidth={2}
              dot={{ r: 4, fill: SERIES, stroke: 'var(--background)', strokeWidth: 2 }}
            >
              {valueLabels(10)}
            </Line>
          </LineChart>
        ) : (
          <BarChart data={points} margin={{ top: 28, bottom: 4, left: 8, right: 8 }}>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={10} interval={0} />
            <YAxis hide domain={barDomain} />
            <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel={false} />} />
            <Bar dataKey="value" fill={SERIES} radius={[6, 6, 0, 0]}>
              {valueLabels(6)}
            </Bar>
          </BarChart>
        )}
      </ChartContainer>
      {data.kind === 'pie' && (
        <ul className="mt-3 grid gap-1.5 text-caption sm:grid-cols-2">
          {points.map((point, index) => (
            <li key={index} className="flex items-center gap-2">
              <span
                aria-hidden="true"
                className="size-2.5 shrink-0 rounded-full bg-foreground"
                style={{ opacity: sliceOpacity(index, points.length) }}
              />
              <span className="min-w-0 flex-1 truncate">{point.label}</span>
              <span className="font-semibold tabular-nums">{format(point.value)}</span>
            </li>
          ))}
        </ul>
      )}
      {data.caption && (
        <figcaption className="mt-2 text-caption text-muted-foreground">{data.caption}</figcaption>
      )}
    </figure>
  );
};
