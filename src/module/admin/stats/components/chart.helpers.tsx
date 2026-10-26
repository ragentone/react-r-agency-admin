import { ChartTooltip, ChartTooltipContent } from '@ui/shad-cn/components/chart.tsx';
import React from 'react';

import type { IStatsUserRef } from '../types';

/** Name of a visitor ("Gast", "Unter 16"). */
export const visitorName = (
  user: IStatsUserRef | null,
  kind: 'user' | 'guest' | 'minor',
  t: (key: string) => string
) => (user ? `@${user.alias}` : kind === 'minor' ? t('stats.minor') : t('stats.guest'));

/**
 * Tooltip with "label … value" rows (black / white, numbers right aligned). A function, not a
 * component: recharts needs its own `<Tooltip>` element as direct child of the chart.
 */
export const statsTooltip = ({
  label,
  name,
  value,
  cursor = 'bar',
}: {
  /** `row`: the data row of the point (e.g. `row.long` = long day label). */
  label?: (value: unknown, row?: Record<string, unknown>) => React.ReactNode;
  name: (key: string) => string;
  value?: (value: number, key: string) => React.ReactNode;
  cursor?: 'line' | 'bar';
}) => (
  <ChartTooltip
    cursor={cursor === 'line' ? { stroke: 'var(--border)' } : { fill: 'var(--accent)' }}
    content={
      <ChartTooltipContent
        hideIndicator
        labelFormatter={
          label
            ? (raw: unknown, payload: ReadonlyArray<{ payload?: Record<string, unknown> }>) =>
                label(raw, payload?.[0]?.payload)
            : undefined
        }
        formatter={(raw, key) => (
          <span className="flex w-full justify-between gap-4">
            <span className="text-muted-foreground">{name(String(key))}</span>
            <span className="font-bold tabular-nums">
              {value ? value(Number(raw), String(key)) : Number(raw).toLocaleString()}
            </span>
          </span>
        )}
      />
    }
  />
);
