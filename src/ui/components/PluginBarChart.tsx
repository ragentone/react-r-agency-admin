import type * as React from 'react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

/**
 * Balkendiagramm für Plugins (`api.ui.BarChart`). Recharts, Farben aus dem Theme: Balken in der Textfarbe,
 * Achsen und Raster in Grau. Passt sich der Breite des Containers an.
 */
export function PluginBarChart({
  data,
  formatValue,
  height = 240,
  ariaLabel,
}: {
  data: { label: string; value: number }[];
  formatValue?: (value: number) => string;
  height?: number;
  ariaLabel?: string;
}) {
  const format = formatValue ?? ((value: number) => String(value));
  return (
    <div role="img" aria-label={ariaLabel} className="w-full text-foreground" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid vertical={false} stroke="var(--border)" strokeOpacity={0.5} />
          <XAxis
            dataKey="label"
            tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            interval="preserveStartEnd"
          />
          <YAxis
            tickFormatter={(value: number) => format(value)}
            tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            width={72}
          />
          <Tooltip
            formatter={(value) => format(Number(value))}
            cursor={{ fill: 'var(--muted)' }}
            contentStyle={{ background: 'var(--background)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }}
          />
          <Bar dataKey="value" fill="currentColor" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
