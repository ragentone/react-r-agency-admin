import { Skeleton } from '@ui/shad-cn/components/skeleton.tsx';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { StatsApi } from '../api';
import { useStatsQuery } from '../hooks/use.stats.query';
import { formatNumber, formatTime } from '../utils';
import { StatsError, StatsSkeleton } from './common';

/** Online right now – counts only, updates every 10 s while the page is visible. */
export const StatsLiveTab: React.FC = () => {
  const { t, i18n } = useTranslation('admin');
  const locale = i18n.language;
  const { data, loading, error, reload } = useStatsQuery(
    StatsApi.live,
    result => result.live,
    'live',
    10_000
  );
  const curve = useMemo(
    () =>
      (data?.curve ?? []).map(point => ({
        time: formatTime(point.at, locale),
        online: point.online,
      })),
    [data, locale]
  );

  if (loading) return <StatsSkeleton variant="list" />;
  if (error && !data) return <StatsError onRetry={() => void reload()} />;
  if (!data) return null;

  const tiles = [
    { key: 'online', label: t('stats.live.now'), value: data.online },
    { key: 'users', label: t('stats.users'), value: data.users },
    { key: 'guests', label: t('stats.guests'), value: data.guests },
  ];

  return (
    <div className="space-y-6 px-4 py-4">
      <div className="grid grid-cols-3 gap-2">
        {tiles.map(tile => (
          <div key={tile.key} className="flex flex-col rounded-2xl border border-border/60 p-4">
            <span className="text-caption font-semibold text-muted-foreground">{tile.label}</span>
            <span className="text-display font-black tabular-nums">
              {formatNumber(tile.value, locale)}
            </span>
          </div>
        ))}
      </div>

      <section>
        <h2 className="text-body font-bold">{t('stats.live.curve')}</h2>
        <p className="text-caption text-muted-foreground">{t('stats.live.curveText')}</p>
        <div className="mt-2 h-48 w-full">
          {curve.length ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={curve}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="time" tickLine={false} axisLine={false} minTickGap={24} />
                <YAxis allowDecimals={false} width={32} tickLine={false} axisLine={false} />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="online"
                  stroke="hsl(var(--foreground))"
                  fill="hsl(var(--foreground))"
                  fillOpacity={0.12}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <Skeleton className="h-full w-full rounded-2xl" />
          )}
        </div>
      </section>
    </div>
  );
};
