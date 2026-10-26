import { BarList, CHART_FILL, ChartBlock, ChartSection, Funnel } from '@ui/patterns/chart';
import { Button } from '@ui/shad-cn/components/button.tsx';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@ui/shad-cn/components/table.tsx';
import { BellRing, Check } from 'lucide-react';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Bar, BarChart, CartesianGrid, Line, LineChart, XAxis, YAxis } from 'recharts';
import { toast } from 'sonner';

import { StatsApi } from '../api';
import { useStatsQuery } from '../hooks/use.stats.query';
import type { IStatsGrowth, StatsRange } from '../types';
import { dayLabel, dayLong, formatPercent, groupWeeks } from '../utils';
import { statsTooltip } from './chart.helpers';
import { StatsAvatar, StatsError, StatsSkeleton } from './common';

const MARGIN = { left: 0, right: 8, top: 8, bottom: 0 };

/** Tab "Wachstum": retention, funnels, silent users, invitations. */
export const StatsGrowthTab: React.FC<{ range: StatsRange; onUser: (userId: string) => void }> = ({
  range,
  onUser,
}) => {
  const { data, loading, error, reload } = useStatsQuery(
    () => StatsApi.growth(range),
    result => result.growth,
    String(range)
  );
  if (loading) return <StatsSkeleton tiles={0} />;
  if (error && !data) return <StatsError onRetry={() => void reload()} />;
  if (!data) return null;
  return <Growth growth={data} range={range} onUser={onUser} />;
};

const Growth: React.FC<{
  growth: IStatsGrowth;
  range: StatsRange;
  onUser: (id: string) => void;
}> = ({ growth, range, onUser }) => {
  const { t, i18n } = useTranslation('admin');
  const locale = i18n.language;
  const [reminded, setReminded] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState<string | null>(null);

  const remind = async (userId: string) => {
    setBusy(userId);
    const result = await StatsApi.remind(userId);
    setBusy(null);
    if (result.success) {
      setReminded(previous => new Set(previous).add(userId));
      toast.success(t('stats.growth.reminded'));
    } else {
      toast.error(
        t(result.error === 'invalid' ? 'stats.growth.remindedRecently' : 'stats.error.title')
      );
    }
  };

  const curve = growth.curve.map(point => ({
    label: t('stats.growth.dayN', { count: point.day }),
    share: point.share === null ? null : Math.round(point.share * 100),
  }));
  const inviteDays = (
    range === 365
      ? groupWeeks(growth.invites.days, items => ({
          value: items.reduce((s, d) => s + d.value, 0),
        }))
      : growth.invites.days
  ).map(day => ({
    label: dayLabel(day.day, locale, range),
    long: dayLong(day.day, locale),
    value: day.value,
  }));

  return (
    <>
      <ChartSection title={t('stats.growth.cohorts')} text={t('stats.growth.cohortsText')}>
        <div className="-mx-4 overflow-x-auto px-4">
          <Table className="min-w-[22rem] text-caption">
            <TableHeader>
              <TableRow>
                <TableHead className="h-9 font-bold">{t('stats.growth.week')}</TableHead>
                <TableHead className="h-9 text-right font-bold">{t('stats.growth.size')}</TableHead>
                {[1, 2, 4, 8].map(week => (
                  <TableHead key={week} className="h-9 text-center font-bold">
                    {t('stats.growth.weekN', { count: week })}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {[...growth.cohorts].reverse().map(cohort => (
                <TableRow key={cohort.week}>
                  <TableCell className="py-1.5 font-semibold whitespace-nowrap">
                    {dayLabel(cohort.week, locale, 7)}
                  </TableCell>
                  <TableCell className="py-1.5 text-right tabular-nums">{cohort.size}</TableCell>
                  {cohort.weeks.map((share, index) => (
                    <TableCell key={index} className="p-0.5 text-center">
                      {share === null ? (
                        <span className="text-muted-foreground">·</span>
                      ) : (
                        <span
                          className="block rounded-md px-1 py-1.5 font-bold tabular-nums"
                          style={{
                            backgroundColor: `color-mix(in oklab, var(--foreground) ${Math.round(share * 85)}%, transparent)`,
                            color: share > 0.45 ? 'var(--background)' : 'var(--foreground)',
                          }}
                        >
                          {formatPercent(share, locale)}
                        </span>
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </ChartSection>

      <ChartBlock
        title={t('stats.growth.curve')}
        text={t('stats.growth.curveText')}
        label={t('stats.growth.curveLabel')}
        className="h-40 sm:h-48"
      >
        <LineChart data={curve} margin={MARGIN}>
          <CartesianGrid vertical={false} strokeDasharray="2 4" />
          <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={8} />
          <YAxis width={36} tickLine={false} axisLine={false} domain={[0, 100]} unit=" %" />
          {statsTooltip({
            name: () => t('stats.growth.kept'),
            value: value => `${value} %`,
            cursor: 'line',
          })}
          <Line
            dataKey="share"
            type="monotone"
            stroke={CHART_FILL}
            strokeWidth={2.5}
            dot={{ r: 3, fill: CHART_FILL, strokeWidth: 0 }}
            connectNulls
            isAnimationActive={false}
          />
        </LineChart>
      </ChartBlock>

      <div className="grid sm:grid-cols-2">
        <ChartSection
          title={t('stats.growth.registerFunnel')}
          text={t('stats.growth.registerFunnelText')}
        >
          <Funnel
            steps={growth.registerFunnel.map(step => ({
              key: step.key,
              label: t(`stats.growth.steps.${step.key}`),
              value: step.value,
            }))}
            dropLabel={percent => t('stats.growth.drop', { percent })}
          />
        </ChartSection>
        <ChartSection
          title={t('stats.growth.activationFunnel')}
          text={t('stats.growth.activationFunnelText')}
        >
          <Funnel
            steps={growth.activationFunnel.map(step => ({
              key: step.key,
              label: t(`stats.growth.steps.${step.key}`),
              value: step.value,
            }))}
            dropLabel={percent => t('stats.growth.drop', { percent })}
          />
        </ChartSection>
      </div>

      <ChartSection title={t('stats.growth.silent')} text={t('stats.growth.silentText')}>
        <BarList
          hollow
          items={growth.silent.map(item => ({
            key: item.key,
            label: t(`stats.growth.silentBucket.${item.key}`),
            value: item.value,
          }))}
        />
        {growth.silentUsers.length > 0 && (
          <ul className="-mx-4 mt-3 divide-y divide-border/50 border-t border-border/50">
            {growth.silentUsers.map(user => (
              <li key={user.id} className="flex items-center gap-3 px-4 py-2.5">
                <button
                  type="button"
                  onClick={() => onUser(user.id)}
                  className="flex min-w-0 flex-1 items-center gap-3 text-left"
                >
                  <StatsAvatar user={user} kind="user" className="size-9" />
                  <span className="min-w-0">
                    <span className="block truncate text-body font-bold">@{user.alias}</span>
                    <span className="block text-caption text-muted-foreground">
                      {t('stats.growth.silentFor', { count: user.days })}
                    </span>
                  </span>
                </button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={reminded.has(user.id) || busy === user.id}
                  isLoading={busy === user.id}
                  onClick={() => void remind(user.id)}
                  aria-label={t('stats.growth.remindLabel', { name: user.alias })}
                >
                  {reminded.has(user.id) ? <Check /> : <BellRing />}
                  {t(reminded.has(user.id) ? 'stats.growth.remindDone' : 'stats.growth.remind')}
                </Button>
              </li>
            ))}
          </ul>
        )}
      </ChartSection>

      <ChartBlock
        title={t('stats.growth.invites')}
        text={t('stats.growth.invitesText', { count: growth.invites.total })}
        label={t('stats.growth.invitesLabel')}
        className="h-36 sm:h-44"
        plain={!growth.invites.top.length}
      >
        <BarChart data={inviteDays} margin={MARGIN}>
          <CartesianGrid vertical={false} strokeDasharray="2 4" />
          <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={8} minTickGap={16} />
          <YAxis width={28} tickLine={false} axisLine={false} allowDecimals={false} />
          {statsTooltip({
            label: (value, row) => (row?.long as string) ?? String(value),
            name: () => t('stats.growth.invited'),
          })}
          <Bar dataKey="value" fill={CHART_FILL} radius={[4, 4, 0, 0]} isAnimationActive={false} />
        </BarChart>
      </ChartBlock>
      {growth.invites.top.length > 0 && (
        <ChartSection title={t('stats.growth.topInviters')} plain>
          <BarList
            items={growth.invites.top.map(user => ({
              key: user.id,
              label: `@${user.alias}`,
              value: user.count,
              icon: <StatsAvatar user={user} kind="user" className="size-6" />,
              onClick: () => onUser(user.id),
            }))}
          />
        </ChartSection>
      )}
    </>
  );
};
