import {
  BarList,
  CHART_FILL,
  CHART_HOLLOW,
  ChartBlock,
  ChartLegendItem,
  ChartSection,
  StatTile,
} from '@ui/patterns/chart';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@ui/shad-cn/components/table.tsx';
import { Bot, KeyRound, ShieldAlert } from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Bar, BarChart, CartesianGrid, Line, LineChart, XAxis, YAxis } from 'recharts';

import { StatsApi } from '../api';
import { useStatsQuery } from '../hooks/use.stats.query';
import type { IStatsSecurity, StatsRange } from '../types';
import { dayLabel, dayLong, formatAgo, formatNumber, groupWeeks } from '../utils';
import { statsTooltip } from './chart.helpers';
import { StatsError, StatsSkeleton } from './common';

const MARGIN = { left: 0, right: 8, top: 8, bottom: 0 };

/** Tab "Sicherheit": failed sign-ins, methods, step-ups, bots, conspicuous IPs. */
export const StatsSecurityTab: React.FC<{ range: StatsRange }> = ({ range }) => {
  const { data, loading, error, reload } = useStatsQuery(
    () => StatsApi.security(range),
    result => result.security,
    String(range)
  );
  if (loading) return <StatsSkeleton tiles={3} />;
  if (error && !data) return <StatsError onRetry={() => void reload()} />;
  if (!data) return null;
  return <Security security={data} range={range} />;
};

const Security: React.FC<{ security: IStatsSecurity; range: StatsRange }> = ({
  security,
  range,
}) => {
  const { t, i18n } = useTranslation('admin');
  const locale = i18n.language;
  const yearly = range === 365;
  const label = (day: string) => ({
    label: dayLabel(day, locale, range),
    long: dayLong(day, locale),
  });
  const failures = (
    yearly
      ? groupWeeks(security.failures, items => ({
          known: items.reduce((s, d) => s + d.known, 0),
          unknown: items.reduce((s, d) => s + d.unknown, 0),
        }))
      : security.failures
  ).map(day => ({ ...label(day.day), known: day.known, unknown: day.unknown }));
  const lines = (
    yearly
      ? groupWeeks(
          security.stepUps.map((item, index) => ({
            day: item.day,
            stepUps: item.value,
            bots: security.bots[index]?.value ?? 0,
          })),
          items => ({
            stepUps: items.reduce((s, d) => s + d.stepUps, 0),
            bots: items.reduce((s, d) => s + d.bots, 0),
          })
        )
      : security.stepUps.map((item, index) => ({
          day: item.day,
          stepUps: item.value,
          bots: security.bots[index]?.value ?? 0,
        }))
  ).map(item => ({ ...label(item.day), stepUps: item.stepUps, bots: item.bots }));
  const tooltipLabel = (value: unknown, row?: Record<string, unknown>) =>
    (row?.long as string) ?? String(value);

  return (
    <>
      <div className="grid grid-cols-3 gap-2 px-4 pt-4 pb-4">
        <StatTile
          icon={<ShieldAlert />}
          label={t('stats.security.failures')}
          value={formatNumber(security.totals.failures, locale)}
          hint={range > 30 ? t('stats.security.keep30') : undefined}
        />
        <StatTile
          icon={<KeyRound />}
          label={t('stats.security.stepUps')}
          value={formatNumber(security.totals.stepUps, locale)}
        />
        <StatTile
          icon={<Bot />}
          label={t('stats.security.bots')}
          value={formatNumber(security.totals.bots, locale)}
        />
      </div>

      <ChartBlock
        title={t('stats.security.failuresChart')}
        text={t('stats.security.failuresText')}
        label={t('stats.security.failuresLabel')}
        legend={
          <>
            <ChartLegendItem variant="filled" label={t('stats.security.known')} />
            <ChartLegendItem variant="hollow" label={t('stats.security.unknown')} />
          </>
        }
      >
        <BarChart data={failures} margin={MARGIN}>
          <CartesianGrid vertical={false} strokeDasharray="2 4" />
          <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={8} minTickGap={16} />
          <YAxis width={28} tickLine={false} axisLine={false} allowDecimals={false} />
          {statsTooltip({ label: tooltipLabel, name: key => t(`stats.security.${key}`) })}
          <Bar dataKey="known" stackId="f" fill={CHART_FILL} isAnimationActive={false} />
          <Bar
            dataKey="unknown"
            stackId="f"
            fill={CHART_HOLLOW}
            stroke={CHART_FILL}
            strokeWidth={1.5}
            radius={[4, 4, 0, 0]}
            isAnimationActive={false}
          />
        </BarChart>
      </ChartBlock>

      <ChartBlock
        title={t('stats.security.trend')}
        text={t('stats.security.trendText')}
        label={t('stats.security.trendLabel')}
        className="h-40 sm:h-48"
        legend={
          <>
            <ChartLegendItem variant="line" label={t('stats.security.stepUps')} />
            <ChartLegendItem variant="dashed" label={t('stats.security.bots')} />
          </>
        }
      >
        <LineChart data={lines} margin={MARGIN}>
          <CartesianGrid vertical={false} strokeDasharray="2 4" />
          <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={8} minTickGap={16} />
          <YAxis yAxisId="a" width={28} tickLine={false} axisLine={false} allowDecimals={false} />
          <YAxis
            yAxisId="b"
            orientation="right"
            width={36}
            tickLine={false}
            axisLine={false}
            allowDecimals={false}
          />
          {statsTooltip({
            label: tooltipLabel,
            name: key => t(`stats.security.${key}`),
            cursor: 'line',
          })}
          <Line
            yAxisId="a"
            dataKey="stepUps"
            type="monotone"
            stroke={CHART_FILL}
            strokeWidth={2.5}
            dot={false}
            isAnimationActive={false}
          />
          <Line
            yAxisId="b"
            dataKey="bots"
            type="monotone"
            stroke={CHART_FILL}
            strokeWidth={1.75}
            strokeDasharray="6 4"
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ChartBlock>

      <ChartSection title={t('stats.security.methods')} text={t('stats.security.methodsText')}>
        <BarList
          items={security.methods.map(item => ({
            key: item.key,
            label: t(`stats.security.method.${item.key}`, { defaultValue: item.key }),
            value: item.value,
          }))}
          empty={<p className="text-caption text-muted-foreground">{t('stats.noData')}</p>}
        />
      </ChartSection>

      <ChartSection title={t('stats.security.ips')} text={t('stats.security.ipsText')} plain>
        {security.ips.length ? (
          <div className="-mx-4 overflow-x-auto px-4">
            <Table className="min-w-[20rem] text-caption">
              <TableHeader>
                <TableRow>
                  <TableHead className="h-9 font-bold">{t('stats.security.ip')}</TableHead>
                  <TableHead className="h-9 text-right font-bold">
                    {t('stats.security.failuresShort')}
                  </TableHead>
                  <TableHead className="h-9 text-right font-bold">
                    {t('stats.security.accounts')}
                  </TableHead>
                  <TableHead className="h-9 text-right font-bold">
                    {t('stats.security.last')}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {security.ips.map(item => (
                  <TableRow key={item.ip}>
                    <TableCell className="py-2 font-mono break-all">{item.ip}</TableCell>
                    <TableCell className="py-2 text-right font-bold tabular-nums">
                      {item.failures}
                    </TableCell>
                    <TableCell className="py-2 text-right tabular-nums">{item.accounts}</TableCell>
                    <TableCell className="py-2 text-right whitespace-nowrap text-muted-foreground">
                      {formatAgo(item.lastAt, locale)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <p className="text-caption text-muted-foreground">{t('stats.security.ipsEmpty')}</p>
        )}
      </ChartSection>
    </>
  );
};
