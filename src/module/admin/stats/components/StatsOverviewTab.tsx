import {
  BarList,
  changePercent,
  CHART_DASHES,
  CHART_FILL,
  CHART_HATCH,
  CHART_HOLLOW,
  CHART_WIDTHS,
  ChartBlock,
  ChartHatch,
  ChartLegendItem,
  ChartSection,
  Heatmap,
  StatTile,
} from '@ui/patterns/chart';
import { ChartContainer as ChartContainerProxy } from '@ui/shad-cn/components/chart.tsx';
import { Progress } from '@ui/shad-cn/components/progress.tsx';
import { Clock, Eye, LogOut, MousePointerClick, UserPlus, Users } from 'lucide-react';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Line,
  LineChart,
  Pie,
  PieChart,
  XAxis,
  YAxis,
} from 'recharts';

import { StatsApi } from '../api';
import { useStatsQuery } from '../hooks/use.stats.query';
import type { IStatsKpi, IStatsOverview, IStatsSeriesDay, StatsRange } from '../types';
import {
  appLabel,
  dayLabel,
  dayLong,
  deviceLabel,
  formatDuration,
  formatNumber,
  formatPercent,
  groupWeeks,
  platformLabel,
  sourceLabel,
  weekdayShort,
} from '../utils';
import { statsTooltip } from './chart.helpers';
import { StatsEmpty, StatsError, StatsSkeleton } from './common';

const MARGIN = { left: 0, right: 8, top: 8, bottom: 0 };
const DEVICE_FILLS = [CHART_FILL, CHART_HATCH, CHART_HOLLOW];

/** Tab "Statistik": key figures, visitors over time, when, what, where from and with what. */
export const StatsOverviewTab: React.FC<{ range: StatsRange }> = ({ range }) => {
  const { t } = useTranslation('admin');
  const { data, loading, error, reload } = useStatsQuery(
    () => StatsApi.overview(range),
    result => result.stats,
    String(range),
    range === 1 ? 60_000 : 0
  );
  if (loading) return <StatsSkeleton />;
  if (error && !data) return <StatsError onRetry={() => void reload()} />;
  if (!data) return null;
  if (!data.kpi.views && !data.previous.views && !data.kpi.registrations) {
    return <StatsEmpty title={t('stats.overview.empty')} text={t('stats.overview.emptyText')} />;
  }
  return <Overview stats={data} />;
};

const Overview: React.FC<{ stats: IStatsOverview }> = ({ stats }) => {
  const { t, i18n } = useTranslation('admin');
  const locale = i18n.language;
  const range = stats.range;
  const yearly = range === 365;

  /** Year: weeks instead of days (52 bars instead of 365). */
  const days = useMemo(() => {
    const merge = (items: IStatsSeriesDay[]) =>
      yearly
        ? groupWeeks(items, list => ({
            users: list.reduce((s, d) => s + d.users, 0),
            guests: list.reduce((s, d) => s + d.guests, 0),
            views: list.reduce((s, d) => s + d.views, 0),
            sessions: list.reduce((s, d) => s + d.sessions, 0),
            bounces: list.reduce((s, d) => s + d.bounces, 0),
            seconds: list.reduce((s, d) => s + d.seconds, 0),
            registrations: list.reduce((s, d) => s + d.registrations, 0),
          }))
        : items;
    const current = merge(stats.days);
    const previous = merge(stats.previousDays);
    return current.map((day, index) => ({
      label: dayLabel(day.day, locale, range),
      long: dayLong(day.day, locale),
      users: day.users,
      guests: day.guests,
      visitors: day.users + day.guests,
      previous: previous[index] ? previous[index].users + previous[index].guests : null,
      viewsUsers: Math.round(day.views * (day.users / Math.max(1, day.users + day.guests))),
      viewsGuests:
        day.views - Math.round(day.views * (day.users / Math.max(1, day.users + day.guests))),
      registrations: day.registrations,
    }));
  }, [stats, locale, range, yearly]);

  const cumulative = useMemo(() => {
    const totals = yearly
      ? stats.totalByDay.filter(
          (_, index) => index % 7 === 6 || index === stats.totalByDay.length - 1
        )
      : stats.totalByDay;
    return days.map((day, index) => ({ ...day, total: totals[index] ?? null }));
  }, [days, stats.totalByDay, yearly]);

  const activity = useMemo(
    () =>
      (yearly ? stats.activity.filter((_, index) => index % 7 === 6) : stats.activity).map(
        item => ({
          label: dayLabel(item.day, locale, range),
          long: dayLong(item.day, locale),
          dau: item.dau,
          wau: item.wau,
          mau: item.mau,
        })
      ),
    [stats.activity, locale, range, yearly]
  );

  const hours = stats.hours.map((value, hour) => ({ label: `${hour}`, value }));
  const appKeys = Object.keys(stats.appDays[0]?.values ?? {});
  const appSeries = (
    yearly ? stats.appDays.filter((_, index) => index % 7 === 6) : stats.appDays
  ).map(item => ({ label: dayLabel(item.day, locale, range), ...item.values }));
  const devicesTotal = stats.devices.reduce((sum, item) => sum + item.value, 0);

  const kpi = (key: keyof IStatsKpi) => ({
    change:
      key === 'bounceRate' || key === 'avgSeconds'
        ? undefined
        : changePercent(Number(stats.kpi[key] ?? 0), Number(stats.previous[key] ?? 0)),
    spark:
      range === 1
        ? undefined
        : key === 'visitors'
          ? days.map(day => day.visitors)
          : key === 'registrations'
            ? days.map(day => day.registrations)
            : key === 'views'
              ? days.map(day => day.viewsUsers + day.viewsGuests)
              : key === 'activeUsers'
                ? days.map(day => day.users)
                : undefined,
    changeLabel: t('stats.kpi.change'),
  });

  return (
    <>
      <div className="grid grid-cols-2 gap-2 px-4 pt-4 pb-4 sm:grid-cols-3">
        <StatTile
          icon={<Users />}
          label={t('stats.kpi.visitors')}
          value={formatNumber(stats.kpi.visitors, locale)}
          hint={stats.approx ? t('stats.kpi.approx') : undefined}
          {...kpi('visitors')}
        />
        <StatTile
          icon={<MousePointerClick />}
          label={t('stats.kpi.activeUsers')}
          value={formatNumber(stats.kpi.activeUsers, locale)}
          {...kpi('activeUsers')}
        />
        <StatTile
          icon={<UserPlus />}
          label={t('stats.kpi.registrations')}
          value={formatNumber(stats.kpi.registrations, locale)}
          hint={t('stats.kpi.totalUsers', { count: stats.totalUsers })}
          {...kpi('registrations')}
        />
        <StatTile
          icon={<Eye />}
          label={t('stats.kpi.views')}
          value={formatNumber(stats.kpi.views, locale)}
          {...kpi('views')}
        />
        <StatTile
          icon={<Clock />}
          label={t('stats.kpi.avgDuration')}
          value={formatDuration(stats.kpi.avgSeconds)}
          hint={t('stats.kpi.before', { value: formatDuration(stats.previous.avgSeconds) })}
        />
        <StatTile
          icon={<LogOut />}
          label={t('stats.kpi.bounceRate')}
          value={formatPercent(stats.kpi.bounceRate, locale)}
          hint={t('stats.kpi.before', { value: formatPercent(stats.previous.bounceRate, locale) })}
        />
      </div>

      {range === 1 ? (
        <ChartBlock
          title={t('stats.overview.today')}
          text={t('stats.overview.todayText')}
          label={t('stats.overview.todayLabel')}
        >
          <BarChart data={hours} margin={MARGIN}>
            <CartesianGrid vertical={false} strokeDasharray="2 4" />
            <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={8} interval={2} />
            <YAxis width={28} tickLine={false} axisLine={false} allowDecimals={false} />
            {statsTooltip({
              label: value => t('stats.hourLabel', { hour: value }),
              name: () => t('stats.visitorsShort'),
            })}
            <Bar
              dataKey="value"
              fill={CHART_FILL}
              radius={[4, 4, 0, 0]}
              isAnimationActive={false}
            />
          </BarChart>
        </ChartBlock>
      ) : (
        <>
          <ChartBlock
            title={t('stats.overview.visitors')}
            text={t(yearly ? 'stats.overview.perWeek' : 'stats.overview.perDay')}
            label={t('stats.overview.visitorsLabel')}
            legend={
              <>
                <ChartLegendItem variant="filled" label={t('stats.users')} />
                <ChartLegendItem variant="hollow" label={t('stats.guests')} />
                <ChartLegendItem variant="dashed" label={t('stats.previous')} />
              </>
            }
          >
            <ComposedChart data={days} margin={MARGIN}>
              <CartesianGrid vertical={false} strokeDasharray="2 4" />
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={16}
              />
              <YAxis width={32} tickLine={false} axisLine={false} allowDecimals={false} />
              {statsTooltip({
                label: (value, row) => (row?.long as string) ?? String(value),
                name: key => t(`stats.series.${key}`),
              })}
              <Bar dataKey="users" stackId="v" fill={CHART_FILL} isAnimationActive={false} />
              <Bar
                dataKey="guests"
                stackId="v"
                fill={CHART_HOLLOW}
                stroke={CHART_FILL}
                strokeWidth={1.5}
                radius={[4, 4, 0, 0]}
                isAnimationActive={false}
              />
              <Line
                dataKey="previous"
                type="monotone"
                stroke={CHART_FILL}
                strokeOpacity={0.6}
                strokeDasharray="5 4"
                strokeWidth={1.5}
                dot={false}
                isAnimationActive={false}
              />
            </ComposedChart>
          </ChartBlock>

          <ChartBlock
            title={t('stats.overview.views')}
            text={t('stats.overview.viewsText')}
            label={t('stats.overview.viewsLabel')}
            className="h-40 sm:h-48"
            legend={
              <>
                <ChartLegendItem variant="filled" label={t('stats.users')} />
                <ChartLegendItem variant="hatched" label={t('stats.guests')} />
              </>
            }
          >
            <BarChart data={days} margin={MARGIN}>
              <ChartHatch />
              <CartesianGrid vertical={false} strokeDasharray="2 4" />
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={16}
              />
              <YAxis width={36} tickLine={false} axisLine={false} allowDecimals={false} />
              {statsTooltip({
                label: (value, row) => (row?.long as string) ?? String(value),
                name: key => t(`stats.series.${key}`),
              })}
              <Bar dataKey="viewsUsers" stackId="a" fill={CHART_FILL} isAnimationActive={false} />
              <Bar
                dataKey="viewsGuests"
                stackId="a"
                fill={CHART_HATCH}
                stroke={CHART_FILL}
                strokeWidth={1}
                radius={[4, 4, 0, 0]}
                isAnimationActive={false}
              />
            </BarChart>
          </ChartBlock>

          <ChartBlock
            title={t('stats.overview.registrations')}
            text={t('stats.overview.registrationsText', { total: stats.totalUsers })}
            label={t('stats.overview.registrationsLabel')}
            legend={
              <>
                <ChartLegendItem variant="filled" label={t('stats.series.registrations')} />
                <ChartLegendItem variant="line" label={t('stats.series.total')} />
              </>
            }
          >
            <ComposedChart data={cumulative} margin={MARGIN}>
              <CartesianGrid vertical={false} strokeDasharray="2 4" />
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={16}
              />
              <YAxis
                yAxisId="new"
                width={28}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
              />
              <YAxis
                yAxisId="total"
                orientation="right"
                width={40}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
                domain={['dataMin', 'dataMax']}
              />
              {statsTooltip({
                label: (value, row) => (row?.long as string) ?? String(value),
                name: key => t(`stats.series.${key}`),
              })}
              <Bar
                yAxisId="new"
                dataKey="registrations"
                fill={CHART_FILL}
                radius={[4, 4, 0, 0]}
                isAnimationActive={false}
              />
              <Line
                yAxisId="total"
                dataKey="total"
                type="monotone"
                stroke={CHART_FILL}
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
              />
            </ComposedChart>
          </ChartBlock>

          <ChartBlock
            title={t('stats.overview.active')}
            text={t('stats.overview.activeText', {
              value: formatPercent(
                stats.activity.length
                  ? stats.activity[stats.activity.length - 1].dau /
                      Math.max(1, stats.activity[stats.activity.length - 1].mau)
                  : null,
                locale
              ),
            })}
            label={t('stats.overview.activeLabel')}
            legend={
              <>
                <ChartLegendItem variant="line" label={t('stats.series.dau')} />
                <ChartLegendItem variant="dashed" label={t('stats.series.wau')} />
                <ChartLegendItem variant="dotted" label={t('stats.series.mau')} />
              </>
            }
          >
            <LineChart data={activity} margin={MARGIN}>
              <CartesianGrid vertical={false} strokeDasharray="2 4" />
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={16}
              />
              <YAxis width={32} tickLine={false} axisLine={false} allowDecimals={false} />
              {statsTooltip({
                label: (value, row) => (row?.long as string) ?? String(value),
                name: key => t(`stats.series.${key}`),
                cursor: 'line',
              })}
              {(['dau', 'wau', 'mau'] as const).map((key, index) => (
                <Line
                  key={key}
                  dataKey={key}
                  type="monotone"
                  stroke={CHART_FILL}
                  strokeWidth={CHART_WIDTHS[index]}
                  strokeDasharray={CHART_DASHES[index]}
                  dot={false}
                  isAnimationActive={false}
                />
              ))}
            </LineChart>
          </ChartBlock>
        </>
      )}

      <ChartSection title={t('stats.overview.heatmap')} text={t('stats.overview.heatmapText')}>
        <Heatmap
          className="sm:hidden"
          matrix={stats.heatmap.map(row =>
            Array.from({ length: 12 }, (_, index) => row[index * 2] + row[index * 2 + 1])
          )}
          rowLabels={Array.from({ length: 7 }, (_, index) => weekdayShort(index, locale))}
          columnLabels={column => (column % 3 === 0 ? String(column * 2) : null)}
          cellTitle={(row, column, value) =>
            t('stats.overview.heatmapCell', {
              day: weekdayShort(row, locale),
              from: column * 2,
              to: column * 2 + 2,
              count: value,
            })
          }
          label={t('stats.overview.heatmapLabel')}
        />
        <Heatmap
          className="hidden sm:block"
          matrix={stats.heatmap}
          rowLabels={Array.from({ length: 7 }, (_, index) => weekdayShort(index, locale))}
          columnLabels={column => (column % 3 === 0 ? String(column) : null)}
          cellTitle={(row, column, value) =>
            t('stats.overview.heatmapCell', {
              day: weekdayShort(row, locale),
              from: column,
              to: column + 1,
              count: value,
            })
          }
          label={t('stats.overview.heatmapLabel')}
        />
      </ChartSection>

      {range !== 1 && (
        <ChartBlock
          title={t('stats.overview.hours')}
          text={t('stats.overview.hoursText')}
          label={t('stats.overview.hoursLabel')}
          className="h-36 sm:h-44"
        >
          <BarChart data={hours} margin={MARGIN}>
            <CartesianGrid vertical={false} strokeDasharray="2 4" />
            <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={8} interval={2} />
            <YAxis width={32} tickLine={false} axisLine={false} allowDecimals={false} />
            {statsTooltip({
              label: value => t('stats.hourLabel', { hour: value }),
              name: () => t('stats.visitorsShort'),
            })}
            <Bar dataKey="value" fill={CHART_FILL} radius={[3, 3, 0, 0]} isAnimationActive={false}>
              {hours.map(hour => (
                <Cell
                  key={hour.label}
                  fill={Number(hour.label) === new Date().getHours() ? CHART_HOLLOW : CHART_FILL}
                  stroke={CHART_FILL}
                  strokeWidth={1.5}
                />
              ))}
            </Bar>
          </BarChart>
        </ChartBlock>
      )}

      <div className="grid sm:grid-cols-2">
        <ChartSection title={t('stats.overview.pages')} text={t('stats.overview.pagesText')}>
          <BarList
            items={stats.pages.map(item => ({
              key: item.key,
              label: <span className="font-mono text-caption break-all">{item.key}</span>,
              value: item.value,
            }))}
            empty={<p className="text-caption text-muted-foreground">{t('stats.noData')}</p>}
          />
        </ChartSection>
        <ChartSection title={t('stats.overview.apps')} text={t('stats.overview.appsText')}>
          <BarList
            items={stats.apps.map(item => ({
              key: item.key,
              label: appLabel(item.key, t),
              value: item.value,
            }))}
            empty={<p className="text-caption text-muted-foreground">{t('stats.noData')}</p>}
          />
        </ChartSection>
      </div>

      {range !== 1 && appKeys.length > 0 && (
        <ChartBlock
          title={t('stats.overview.appTrend')}
          text={t('stats.overview.appTrendText')}
          label={t('stats.overview.appTrendLabel')}
          legend={appKeys.map((key, index) => (
            <ChartLegendItem
              key={key}
              variant={(['line', 'dashed', 'dotted', 'dashed', 'dotted'] as const)[index]}
              label={appLabel(key, t)}
            />
          ))}
        >
          <LineChart data={appSeries} margin={MARGIN}>
            <CartesianGrid vertical={false} strokeDasharray="2 4" />
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={16}
            />
            <YAxis width={28} tickLine={false} axisLine={false} allowDecimals={false} />
            {statsTooltip({ name: key => appLabel(key, t), cursor: 'line' })}
            {appKeys.map((key, index) => (
              <Line
                key={key}
                dataKey={key}
                type="monotone"
                stroke={CHART_FILL}
                strokeOpacity={1 - index * 0.12}
                strokeWidth={CHART_WIDTHS[index]}
                strokeDasharray={CHART_DASHES[index]}
                dot={false}
                isAnimationActive={false}
              />
            ))}
          </LineChart>
        </ChartBlock>
      )}

      <div className="grid sm:grid-cols-2">
        <ChartSection title={t('stats.overview.entries')} text={t('stats.overview.entriesText')}>
          <BarList
            items={stats.entries.map(item => ({
              key: item.key,
              label: <span className="font-mono text-caption break-all">{item.key}</span>,
              value: item.value,
            }))}
            empty={<p className="text-caption text-muted-foreground">{t('stats.noData')}</p>}
          />
        </ChartSection>
        <ChartSection title={t('stats.overview.exits')} text={t('stats.overview.exitsText')}>
          <BarList
            hollow
            items={stats.exits.map(item => ({
              key: item.key,
              label: <span className="font-mono text-caption break-all">{item.key}</span>,
              value: item.value,
            }))}
            empty={<p className="text-caption text-muted-foreground">{t('stats.noData')}</p>}
          />
        </ChartSection>
      </div>

      <ChartSection title={t('stats.overview.sources')} text={t('stats.overview.sourcesText')}>
        <BarList
          items={stats.sources.map(item => ({
            key: item.key,
            label: sourceLabel(item.key, t),
            value: item.value,
          }))}
          empty={<p className="text-caption text-muted-foreground">{t('stats.noData')}</p>}
        />
      </ChartSection>

      <div className="grid sm:grid-cols-2">
        {devicesTotal > 0 && (
          <ChartBlock
            title={t('stats.overview.devices')}
            label={t('stats.overview.devicesLabel')}
            className="h-44"
            legend={stats.devices.map((item, index) => (
              <ChartLegendItem
                key={item.key}
                variant={(['filled', 'hatched', 'hollow'] as const)[index] ?? 'hollow'}
                label={deviceLabel(item.key, t)}
                value={formatPercent(item.value / devicesTotal, locale)}
              />
            ))}
          >
            <PieChart>
              <ChartHatch />
              {statsTooltip({ name: key => deviceLabel(key, t) })}
              <Pie
                data={stats.devices.map(item => ({ name: item.key, value: item.value }))}
                dataKey="value"
                nameKey="name"
                innerRadius="58%"
                outerRadius="92%"
                stroke={CHART_FILL}
                strokeWidth={1.5}
                isAnimationActive={false}
              >
                {stats.devices.map((item, index) => (
                  <Cell key={item.key} fill={DEVICE_FILLS[index] ?? CHART_HOLLOW} />
                ))}
              </Pie>
            </PieChart>
          </ChartBlock>
        )}
        <ChartSection title={t('stats.overview.pwa')} text={t('stats.overview.pwaText')}>
          <p className="text-display font-black tabular-nums">
            {formatPercent(stats.pwa.share, locale)}
          </p>
          <Progress
            value={Math.round((stats.pwa.share ?? 0) * 100)}
            className="mt-2 h-3"
            aria-label={t('stats.overview.pwa')}
          />
          {range !== 1 && (
            <div className="mt-4 h-24">
              <PwaTrend stats={stats} />
            </div>
          )}
        </ChartSection>
      </div>

      <div className="grid sm:grid-cols-3">
        <ChartSection title={t('stats.overview.platforms')}>
          <BarList
            items={stats.platforms.map(item => ({
              key: item.key,
              label: platformLabel(item.key, t),
              value: item.value,
            }))}
            empty={<p className="text-caption text-muted-foreground">{t('stats.noData')}</p>}
          />
        </ChartSection>
        <ChartSection title={t('stats.overview.browsers')}>
          <BarList
            items={stats.browsers.map(item => ({
              key: item.key,
              label: item.key,
              value: item.value,
            }))}
            empty={<p className="text-caption text-muted-foreground">{t('stats.noData')}</p>}
          />
        </ChartSection>
        <ChartSection title={t('stats.overview.locales')} plain>
          <BarList
            items={stats.locales.map(item => ({
              key: item.key,
              label: t(`stats.locale.${item.key}`, { defaultValue: item.key }),
              value: item.value,
            }))}
            empty={<p className="text-caption text-muted-foreground">{t('stats.noData')}</p>}
          />
        </ChartSection>
      </div>
    </>
  );
};

/** PWA share per day – small area chart (plain recharts in a fixed box). */
const PwaTrend: React.FC<{ stats: IStatsOverview }> = ({ stats }) => {
  const { t, i18n } = useTranslation('admin');
  const data = stats.pwa.days.map(day => ({
    label: dayLabel(day.day, i18n.language, stats.range),
    share: day.share === null ? null : Math.round(day.share * 100),
  }));
  return (
    <ChartBlockMini label={t('stats.overview.pwaTrend')}>
      <AreaChart data={data} margin={{ left: 0, right: 4, top: 4, bottom: 0 }}>
        <XAxis dataKey="label" hide />
        <YAxis hide domain={[0, 100]} />
        {statsTooltip({
          name: () => t('stats.overview.pwa'),
          value: value => `${value} %`,
          cursor: 'line',
        })}
        <Area
          dataKey="share"
          type="monotone"
          stroke={CHART_FILL}
          strokeWidth={1.75}
          fill={CHART_FILL}
          fillOpacity={0.1}
          connectNulls
          isAnimationActive={false}
        />
      </AreaChart>
    </ChartBlockMini>
  );
};

const ChartBlockMini: React.FC<{
  label: string;
  children: React.ComponentProps<typeof ChartContainerProxy>['children'];
}> = ({ label, children }) => (
  <ChartContainerProxy
    config={{}}
    className="aspect-auto h-full w-full"
    aria-label={label}
    role="img"
  >
    {children}
  </ChartContainerProxy>
);
