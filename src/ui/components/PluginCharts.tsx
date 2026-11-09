import type * as React from 'react';
import { Area, AreaChart, CartesianGrid, Cell, Legend, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

/**
 * Weitere Diagrammtypen für Plugins (`api.ui.LineChart`, `AreaChart`, `PieChart`). Recharts, Farben in der Textfarbe
 * des Themes mit abgestufter Deckkraft, damit sie im Schwarz-Weiß-Design unterscheidbar bleiben.
 */
const axisTick = { fill: 'var(--muted-foreground)', fontSize: 11 };
const tooltipStyle = { background: 'var(--background)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 };
const shade = (index: number) => Math.max(0.25, 1 - index * 0.2);

export function PluginLineChart({
  data,
  xKey,
  series,
  formatValue,
  height = 240,
  ariaLabel,
}: {
  data: Record<string, string | number>[];
  xKey: string;
  series: { key: string; label: string }[];
  formatValue?: (value: number) => string;
  height?: number;
  ariaLabel?: string;
}) {
  const format = formatValue ?? ((value: number) => String(value));
  return (
    <div role="img" aria-label={ariaLabel} className="w-full text-foreground" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid vertical={false} stroke="var(--border)" strokeOpacity={0.5} />
          <XAxis dataKey={xKey} tick={axisTick} tickLine={false} axisLine={false} />
          <YAxis tickFormatter={(value: number) => format(value)} tick={axisTick} tickLine={false} axisLine={false} width={72} />
          <Tooltip formatter={(value) => format(Number(value))} contentStyle={tooltipStyle} />
          {series.length > 1 && <Legend />}
          {series.map((entry, index) => (
            <Line
              key={entry.key}
              dataKey={entry.key}
              name={entry.label}
              type="monotone"
              stroke="currentColor"
              strokeOpacity={shade(index)}
              strokeDasharray={index > 0 ? '4 4' : undefined}
              strokeWidth={2}
              dot={false}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function PluginAreaChart({
  data,
  xKey,
  series,
  formatValue,
  height = 240,
  ariaLabel,
}: {
  data: Record<string, string | number>[];
  xKey: string;
  series: { key: string; label: string }[];
  formatValue?: (value: number) => string;
  height?: number;
  ariaLabel?: string;
}) {
  const format = formatValue ?? ((value: number) => String(value));
  return (
    <div role="img" aria-label={ariaLabel} className="w-full text-foreground" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid vertical={false} stroke="var(--border)" strokeOpacity={0.5} />
          <XAxis dataKey={xKey} tick={axisTick} tickLine={false} axisLine={false} />
          <YAxis tickFormatter={(value: number) => format(value)} tick={axisTick} tickLine={false} axisLine={false} width={72} />
          <Tooltip formatter={(value) => format(Number(value))} contentStyle={tooltipStyle} />
          {series.length > 1 && <Legend />}
          {series.map((entry, index) => (
            <Area
              key={entry.key}
              dataKey={entry.key}
              name={entry.label}
              type="monotone"
              stroke="currentColor"
              strokeOpacity={shade(index)}
              fill="currentColor"
              fillOpacity={shade(index) * 0.15}
              strokeWidth={2}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function PluginPieChart({
  data,
  formatValue,
  donut = false,
  height = 240,
  ariaLabel,
}: {
  data: { label: string; value: number }[];
  formatValue?: (value: number) => string;
  donut?: boolean;
  height?: number;
  ariaLabel?: string;
}) {
  const format = formatValue ?? ((value: number) => String(value));
  return (
    <div role="img" aria-label={ariaLabel} className="w-full text-foreground" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Tooltip formatter={(value) => format(Number(value))} contentStyle={tooltipStyle} />
          <Legend verticalAlign="bottom" height={28} />
          <Pie
            data={data}
            dataKey="value"
            nameKey="label"
            innerRadius={donut ? '55%' : 0}
            outerRadius="80%"
            paddingAngle={1}
            stroke="var(--background)"
          >
            {data.map((_, index) => (
              <Cell key={index} fill={`var(--chart-${(index % 5) + 1})`} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
