import {
  type ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from '@ui/shad-cn/components/chart.tsx';
import { Skeleton } from '@ui/shad-cn/components/skeleton.tsx';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Area, AreaChart, CartesianGrid, Line, LineChart, XAxis, YAxis } from 'recharts';

import { CreditsChips, CreditsStats } from '../components/CreditsUi.tsx';
import type { ICreditChartDay } from '../types.ts';
import { creditErrorText } from '../utils.ts';
import { useCreditsAdminChart } from './use.credits.admin.ts';

const RANGES = [7, 30, 90] as const;

/**
 * Categorical slots 1–3 of the validated reference palette (light / dark steps), validated
 * adjacent in both modes. Aqua is below 3:1 on light → the table view is the relief.
 */
const FLOW_CONFIG = {
  earned: { theme: { light: '#2a78d6', dark: '#3987e5' } },
  spent: { theme: { light: '#eb6834', dark: '#d95926' } },
  transferred: { theme: { light: '#1baf7a', dark: '#199e70' } },
} satisfies ChartConfig;

/** One series → the ink of the app (black / white), no legend. */
const BANK_CONFIG = {
  bank: { color: 'var(--foreground)' },
} satisfies ChartConfig;

const FLOWS = ['earned', 'spent', 'transferred'] as const;

/** Same colors for the swatches outside the chart (light / `.dark`). */
const SWATCH_CSS = `
.credits-flows { ${FLOWS.map(key => `--credits-${key}: ${FLOW_CONFIG[key].theme.light};`).join(' ')} }
.dark .credits-flows { ${FLOWS.map(key => `--credits-${key}: ${FLOW_CONFIG[key].theme.dark};`).join(' ')} }
`;

/** Admin overview: bank balance and daily credit flows over 7 / 30 / 90 days (sums only). */
export const CreditsAdminChart: React.FC = () => {
  const { t, i18n } = useTranslation('credits');
  const locale = i18n.resolvedLanguage || i18n.language;
  const { days, error, load } = useCreditsAdminChart();
  const [range, setRange] = useState<(typeof RANGES)[number]>(30);
  const [table, setTable] = useState(false);

  useEffect(() => {
    void load(range);
  }, [load, range]);

  const compact = (value: number) =>
    new Intl.NumberFormat(locale, { notation: 'compact', maximumFractionDigits: 1 }).format(value);
  const full = (value: number) => new Intl.NumberFormat(locale).format(value);
  const dayLabel = (day: string, long = false) =>
    new Intl.DateTimeFormat(locale, {
      day: 'numeric',
      month: long ? 'long' : 'short',
      ...(long ? { weekday: 'short' } : {}),
    }).format(new Date(`${day}T12:00:00`));

  const config = {
    earned: { ...FLOW_CONFIG.earned, label: t('admin.chart.earned') },
    spent: { ...FLOW_CONFIG.spent, label: t('admin.chart.spent') },
    transferred: { ...FLOW_CONFIG.transferred, label: t('admin.chart.transferred') },
  } satisfies ChartConfig;
  const bankConfig = {
    bank: { ...BANK_CONFIG.bank, label: t('admin.chart.bank') },
  } satisfies ChartConfig;

  const totals = (days ?? []).reduce(
    (sum, day) => ({
      earned: sum.earned + day.earned,
      spent: sum.spent + day.spent,
      transferred: sum.transferred + day.transferred,
    }),
    { earned: 0, spent: 0, transferred: 0 }
  );

  const axis = {
    xAxis: (
      <XAxis
        dataKey="day"
        tickLine={false}
        axisLine={false}
        tickMargin={8}
        minTickGap={24}
        tickFormatter={(value: string) => dayLabel(value)}
      />
    ),
    yAxis: (
      <YAxis
        tickLine={false}
        axisLine={false}
        width={44}
        tickMargin={4}
        allowDecimals={false}
        tickFormatter={(value: number) => compact(value)}
      />
    ),
    grid: <CartesianGrid vertical={false} strokeDasharray="0" />,
  };

  const tooltip = (
    <ChartTooltip
      cursor={{ strokeWidth: 1 }}
      content={
        <ChartTooltipContent
          indicator="line"
          labelFormatter={(_, payload) =>
            payload?.[0]?.payload?.day ? dayLabel(payload[0].payload.day as string, true) : ''
          }
          formatter={(value, name, item) => (
            <div className="flex w-full items-center justify-between gap-4">
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <span
                  className="h-2.5 w-1 shrink-0 rounded-full"
                  style={{ backgroundColor: item.color ?? `var(--color-${String(name)})` }}
                />
                {config[name as keyof typeof config]?.label ?? bankConfig.bank.label}
              </span>
              <span className="font-mono font-medium text-foreground tabular-nums">
                {full(Number(value))}
              </span>
            </div>
          )}
        />
      }
    />
  );

  return (
    <section aria-labelledby="credits-chart" className="border-b border-border/50 py-4">
      <div className="flex flex-wrap items-center justify-between gap-2 px-4">
        <h2 id="credits-chart" className="text-title font-bold">
          {t('admin.chart.title')}
        </h2>
        <CreditsChips
          className="mx-0 px-0"
          options={RANGES}
          value={range}
          onChange={setRange}
          labelOf={item => t('admin.chart.days', { count: item })}
          label={t('admin.chart.range')}
        />
      </div>

      {error && !days ? (
        <p role="alert" className="px-4 py-10 text-center text-body text-muted-foreground">
          {creditErrorText(t, error)}
        </p>
      ) : !days ? (
        <div className="space-y-3 px-4 pt-4" aria-busy="true">
          <Skeleton className="h-40 w-full rounded-2xl" />
          <Skeleton className="h-48 w-full rounded-2xl" />
        </div>
      ) : (
        <>
          <div className="px-4 pt-4">
            <p className="text-caption font-semibold text-muted-foreground">
              {t('admin.chart.bank')}
            </p>
            <p className="text-title font-bold tabular-nums">
              {full(days[days.length - 1]?.bank ?? 0)}
            </p>
          </div>
          <ChartContainer config={bankConfig} className="aspect-auto h-40 w-full px-1 pt-2">
            <AreaChart data={days} margin={{ left: 4, right: 12, top: 8, bottom: 0 }}>
              {axis.grid}
              {axis.xAxis}
              {axis.yAxis}
              {tooltip}
              <Area
                dataKey="bank"
                type="monotone"
                stroke="var(--color-bank)"
                strokeWidth={2}
                fill="var(--color-bank)"
                fillOpacity={0.08}
                dot={false}
                activeDot={{ r: 4, strokeWidth: 2, stroke: 'var(--background)' }}
                isAnimationActive={false}
              />
            </AreaChart>
          </ChartContainer>

          <style>{SWATCH_CSS}</style>
          <CreditsStats
            className="credits-flows mt-4 px-4"
            items={FLOWS.map(key => ({
              key,
              label: t(`admin.chart.${key}`),
              value: full(totals[key]),
              swatch: `var(--credits-${key})`,
            }))}
          />

          <ChartContainer config={config} className="aspect-auto h-56 w-full px-1 pt-3 sm:h-64">
            <LineChart data={days} margin={{ left: 4, right: 12, top: 8, bottom: 0 }}>
              {axis.grid}
              {axis.xAxis}
              {axis.yAxis}
              {tooltip}
              <ChartLegend content={<ChartLegendContent />} />
              {FLOWS.map(key => (
                <Line
                  key={key}
                  dataKey={key}
                  type="monotone"
                  stroke={`var(--color-${key})`}
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  dot={false}
                  activeDot={{ r: 4, strokeWidth: 2, stroke: 'var(--background)' }}
                  isAnimationActive={false}
                />
              ))}
            </LineChart>
          </ChartContainer>

          <div className="px-4 pt-2">
            <button
              type="button"
              aria-expanded={table}
              onClick={() => setTable(value => !value)}
              className="inline-flex h-9 items-center rounded-full text-caption font-bold underline underline-offset-2 outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {t(table ? 'admin.chart.hideTable' : 'admin.chart.showTable')}
            </button>
          </div>
          {table && <ChartTable days={days} dayLabel={dayLabel} full={full} />}
        </>
      )}
    </section>
  );
};

/** Same numbers as a table (accessibility / exact values). */
const ChartTable: React.FC<{
  days: ICreditChartDay[];
  dayLabel: (day: string) => string;
  full: (value: number) => string;
}> = ({ days, dayLabel, full }) => {
  const { t } = useTranslation('credits');
  return (
    <div className="mt-2 max-h-80 overflow-auto px-4">
      <table className="w-full text-caption">
        <caption className="sr-only">{t('admin.chart.title')}</caption>
        <thead className="sticky top-0 bg-background">
          <tr className="text-muted-foreground">
            <th scope="col" className="py-2 text-left font-semibold">
              {t('admin.chart.day')}
            </th>
            {(['earned', 'spent', 'transferred', 'bank'] as const).map(key => (
              <th key={key} scope="col" className="py-2 text-right font-semibold">
                {t(`admin.chart.${key}`)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border/40">
          {[...days].reverse().map(day => (
            <tr key={day.day}>
              <th scope="row" className="py-1.5 text-left font-medium">
                {dayLabel(day.day)}
              </th>
              <td className="py-1.5 text-right tabular-nums">{full(day.earned)}</td>
              <td className="py-1.5 text-right tabular-nums">{full(day.spent)}</td>
              <td className="py-1.5 text-right tabular-nums">{full(day.transferred)}</td>
              <td className="py-1.5 text-right tabular-nums">{full(day.bank)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
