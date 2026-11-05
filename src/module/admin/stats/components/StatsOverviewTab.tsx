import { changePercent, StatTile } from '@ui/patterns/chart';
import { Eye, UserCheck, UserPlus, Users } from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

import { StatsApi } from '../api';
import { useStatsQuery } from '../hooks/use.stats.query';
import type { StatsRange } from '../types';
import { dayLabel, formatNumber } from '../utils';
import { StatsEmpty, StatsError, StatsSkeleton } from './common';

/** Counts of the range against the range before: views, signed-in users, guests, registrations. */
export const StatsOverviewTab: React.FC<{ range: StatsRange }> = ({ range }) => {
  const { t, i18n } = useTranslation('admin');
  const locale = i18n.language;
  const { data, loading, error, reload } = useStatsQuery(
    () => StatsApi.overview(range),
    result => result.stats,
    `overview|${range}`
  );

  if (loading) return <StatsSkeleton tiles={4} variant="charts" />;
  if (error || !data) return <StatsError onRetry={() => void reload()} />;

  const { totals, previous, days } = data;
  if (!days.some(day => day.views || day.bots || totals.registrations)) {
    return <StatsEmpty title={t('stats.overview.empty')} text={t('stats.overview.emptyText')} />;
  }

  const tiles = [
    {
      key: 'views',
      icon: <Eye />,
      label: t('stats.kpi.views'),
      value: totals.views,
      before: previous.views,
      spark: days.map(day => day.views),
    },
    {
      key: 'users',
      icon: <UserCheck />,
      label: t('stats.users'),
      value: totals.users,
      before: previous.users,
      spark: days.map(day => day.users),
    },
    {
      key: 'guests',
      icon: <Users />,
      label: t('stats.guests'),
      value: totals.guests,
      before: previous.guests,
      spark: days.map(day => day.guests),
    },
    {
      key: 'registrations',
      icon: <UserPlus />,
      label: t('stats.kpi.registrations'),
      value: totals.registrations,
      before: previous.registrations,
      spark: [] as number[],
    },
  ];

  const chart = days.map(day => ({
    label: dayLabel(day.day, locale, range),
    users: day.users,
    guests: day.guests,
  }));

  return (
    <div className="space-y-6 px-4 py-4">
      <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
        {tiles.map(tile => (
          <StatTile
            key={tile.key}
            icon={tile.icon}
            label={tile.label}
            value={formatNumber(tile.value, locale)}
            change={changePercent(tile.value, tile.before)}
            changeLabel={t('stats.kpi.change')}
            hint={t('stats.kpi.before', { value: formatNumber(tile.before, locale) })}
            spark={tile.spark}
          />
        ))}
      </div>

      <section>
        <h2 className="text-body font-bold">{t('stats.overview.perDayTitle')}</h2>
        <p className="text-caption text-muted-foreground">{t('stats.overview.perDayText')}</p>
        <div className="mt-2 h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chart}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="label" tickLine={false} axisLine={false} minTickGap={16} />
              <YAxis allowDecimals={false} width={32} tickLine={false} axisLine={false} />
              <Tooltip />
              <Bar
                dataKey="users"
                name={t('stats.users')}
                stackId="a"
                fill="hsl(var(--foreground))"
              />
              <Bar
                dataKey="guests"
                name={t('stats.guests')}
                stackId="a"
                fill="hsl(var(--muted-foreground))"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>
    </div>
  );
};
