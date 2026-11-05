import { Bot, KeyRound } from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

import { StatsApi } from '../api';
import { useStatsQuery } from '../hooks/use.stats.query';
import type { StatsRange } from '../types';
import { dayLabel, formatNumber } from '../utils';
import { StatsError, StatsSkeleton } from './common';

/** Failed sign-ins and crawler hits per day – counts only. */
export const StatsSecurityTab: React.FC<{ range: StatsRange }> = ({ range }) => {
  const { t, i18n } = useTranslation('admin');
  const locale = i18n.language;
  const { data, loading, error, reload } = useStatsQuery(
    () => StatsApi.security(range),
    result => result.security,
    `security|${range}`
  );

  if (loading) return <StatsSkeleton tiles={2} variant="charts" />;
  if (error || !data) return <StatsError onRetry={() => void reload()} />;

  const failures = data.failures.map(item => ({
    label: dayLabel(item.day, locale, range),
    known: item.known,
    unknown: item.unknown,
  }));
  const bots = data.bots.map(item => ({
    label: dayLabel(item.day, locale, range),
    value: item.value,
  }));

  const tiles = [
    {
      key: 'failures',
      icon: <KeyRound />,
      label: t('stats.security.failures'),
      value: data.totals.failures,
    },
    { key: 'bots', icon: <Bot />, label: t('stats.bots'), value: data.totals.bots },
  ];

  return (
    <div className="space-y-6 px-4 py-4">
      <div className="grid grid-cols-2 gap-2">
        {tiles.map(tile => (
          <div key={tile.key} className="flex flex-col rounded-2xl border border-border/60 p-4">
            <span className="flex items-center gap-2 text-caption font-semibold text-muted-foreground">
              <span className="[&>svg]:size-4" aria-hidden="true">
                {tile.icon}
              </span>
              {tile.label}
            </span>
            <span className="text-display font-black tabular-nums">
              {formatNumber(tile.value, locale)}
            </span>
          </div>
        ))}
      </div>

      <section>
        <h2 className="text-body font-bold">{t('stats.security.failures')}</h2>
        <p className="text-caption text-muted-foreground">{t('stats.security.failuresText')}</p>
        <div className="mt-2 h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={failures}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="label" tickLine={false} axisLine={false} minTickGap={16} />
              <YAxis allowDecimals={false} width={32} tickLine={false} axisLine={false} />
              <Tooltip />
              <Bar
                dataKey="known"
                name={t('stats.security.known')}
                stackId="a"
                fill="hsl(var(--muted-foreground))"
              />
              <Bar
                dataKey="unknown"
                name={t('stats.security.unknown')}
                stackId="a"
                fill="hsl(var(--foreground))"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section>
        <h2 className="text-body font-bold">{t('stats.bots')}</h2>
        <p className="text-caption text-muted-foreground">{t('stats.security.botsText')}</p>
        <div className="mt-2 h-40 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={bots}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="label" tickLine={false} axisLine={false} minTickGap={16} />
              <YAxis allowDecimals={false} width={32} tickLine={false} axisLine={false} />
              <Tooltip />
              <Bar dataKey="value" name={t('stats.bots')} fill="hsl(var(--foreground))" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>
    </div>
  );
};
