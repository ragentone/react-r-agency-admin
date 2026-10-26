import { cn } from '@ui/lib/utils';
import { Delayed } from '@ui/patterns';
import { BarList, ChartSection } from '@ui/patterns/chart';
import { Skeleton } from '@ui/shad-cn/components/skeleton.tsx';
import { ShieldCheck } from 'lucide-react';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { StatsApi } from '../api';
import { useStatsQuery } from '../hooks/use.stats.query';
import type { IStatsUserActivity } from '../types';
import { appLabel, dayLong, formatAgo, formatDuration, weekdayShort } from '../utils';
import { StatsEmpty, StatsError } from './common';

const WEEKS = 26;

/** Tab "Aktivität" in the admin user drawer: activity calendar, apps, last pages. */
export const AdminActivityPanel: React.FC<{ userId: string }> = ({ userId }) => {
  const { t } = useTranslation('admin');
  const { data, loading, error, reload } = useStatsQuery(
    () => StatsApi.user(userId),
    result => result.activity,
    userId
  );
  if (loading) {
    return (
      <Delayed label={t('stats.loading')} className="min-h-80">
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-2">
            {Array.from({ length: 3 }, (_, index) => (
              <Skeleton key={index} className="h-16 rounded-2xl" />
            ))}
          </div>
          <Skeleton className="h-5 w-1/3 rounded-full" />
          <Skeleton className="h-28 rounded-2xl" />
          <Skeleton className="h-5 w-1/4 rounded-full" />
          {Array.from({ length: 4 }, (_, index) => (
            <Skeleton
              key={index}
              className="h-4 rounded-full"
              style={{ width: `${88 - index * 14}%` }}
            />
          ))}
        </div>
      </Delayed>
    );
  }
  if (error && !data) return <StatsError onRetry={() => void reload()} />;
  if (!data) return null;
  if (data.minor) {
    return (
      <StatsEmpty
        title={t('stats.activity.minor')}
        text={t('stats.activity.minorText')}
        icon={<ShieldCheck />}
      />
    );
  }
  return <Activity activity={data} />;
};

const Activity: React.FC<{ activity: IStatsUserActivity }> = ({ activity }) => {
  const { t, i18n } = useTranslation('admin');
  const locale = i18n.language;
  const grid = useMemo(() => {
    const byDay = new Map(activity.days.map(day => [day.day, day]));
    const max = Math.max(1, ...activity.days.map(day => day.views));
    const today = new Date();
    const monday = new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()));
    monday.setUTCDate(monday.getUTCDate() - ((monday.getUTCDay() + 6) % 7));
    const start = new Date(monday);
    start.setUTCDate(start.getUTCDate() - (WEEKS - 1) * 7);
    const todayKey = new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()))
      .toISOString()
      .slice(0, 10);
    return Array.from({ length: 7 }, (_, weekday) =>
      Array.from({ length: WEEKS }, (_, week) => {
        const date = new Date(start);
        date.setUTCDate(start.getUTCDate() + week * 7 + weekday);
        const day = date.toISOString().slice(0, 10);
        const item = byDay.get(day);
        return {
          day,
          future: day > todayKey,
          views: item?.views ?? 0,
          seconds: item?.seconds ?? 0,
          level: item ? Math.min(4, Math.ceil((item.views / max) * 4)) : 0,
        };
      })
    );
  }, [activity.days]);

  return (
    <div className="-mx-4 sm:-mx-6">
      <dl className="grid grid-cols-3 gap-2 px-4 sm:px-6">
        {[
          ['days', String(activity.total.days)],
          ['views', String(activity.total.views)],
          ['time', formatDuration(activity.total.seconds)],
        ].map(([key, value]) => (
          <div key={key} className="rounded-2xl border border-border/60 p-3">
            <dt className="text-micro font-semibold text-muted-foreground">
              {t(`stats.activity.${key}`)}
            </dt>
            <dd className="text-title font-black tabular-nums">{value}</dd>
          </div>
        ))}
      </dl>
      <p className="mt-2 px-4 text-caption text-muted-foreground sm:px-6">
        {t('stats.activity.last', { time: formatAgo(activity.lastAt, locale) })}
      </p>

      <ChartSection title={t('stats.activity.calendar')} text={t('stats.activity.calendarText')}>
        <div className="overflow-x-auto [scrollbar-width:none]">
          <div
            className="grid w-max gap-[3px]"
            style={{ gridTemplateColumns: `1.75rem repeat(${WEEKS}, 0.75rem)` }}
            role="img"
            aria-label={t('stats.activity.calendarLabel', { count: activity.total.days })}
          >
            {grid.map((row, weekday) => (
              <React.Fragment key={weekday}>
                <span className="text-micro leading-3 text-muted-foreground">
                  {weekday % 2 === 0 ? weekdayShort(weekday, locale) : ''}
                </span>
                {row.map(cell => (
                  <span
                    key={cell.day}
                    title={
                      cell.future
                        ? undefined
                        : t('stats.activity.cell', {
                            day: dayLong(cell.day, locale),
                            count: cell.views,
                            time: formatDuration(cell.seconds),
                          })
                    }
                    className={cn(
                      'size-3 rounded-[3px]',
                      cell.future
                        ? 'opacity-0'
                        : cell.level === 0
                          ? 'border border-border/70'
                          : 'bg-foreground'
                    )}
                    style={cell.level ? { opacity: 0.2 + cell.level * 0.2 } : undefined}
                  />
                ))}
              </React.Fragment>
            ))}
          </div>
        </div>
      </ChartSection>

      <ChartSection title={t('stats.activity.apps')}>
        <BarList
          items={activity.apps.map(app => ({
            key: app.key,
            label: appLabel(app.key, t),
            value: app.value,
            display: t('stats.activity.daysCount', { count: app.value }),
          }))}
          empty={<p className="text-caption text-muted-foreground">{t('stats.noData')}</p>}
        />
      </ChartSection>

      <ChartSection title={t('stats.activity.pages')} text={t('stats.activity.pagesText')} plain>
        {activity.pages.length ? (
          <ol className="divide-y divide-border/50">
            {activity.pages.map((page, index) => (
              <li
                key={`${page.at}-${index}`}
                className="flex items-start justify-between gap-3 py-2"
              >
                <span className="min-w-0 font-mono text-caption break-all">{page.path}</span>
                <span className="shrink-0 text-right text-micro text-muted-foreground tabular-nums">
                  {formatAgo(page.at, locale)}
                  <br />
                  {formatDuration(page.seconds)}
                </span>
              </li>
            ))}
          </ol>
        ) : (
          <p className="text-caption text-muted-foreground">{t('stats.noData')}</p>
        )}
      </ChartSection>
    </div>
  );
};
