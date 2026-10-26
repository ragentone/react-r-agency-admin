import { BarList, CHART_FILL, ChartBlock, ChartSection } from '@ui/patterns/chart';
import { Badge } from '@ui/shad-cn/components/badge.tsx';
import { Monitor, Smartphone, Tablet, Users } from 'lucide-react';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts';

import { StatsApi } from '../api';
import { useStatsQuery } from '../hooks/use.stats.query';
import type { IStatsLive, IStatsLiveItem } from '../types';
import { appLabel, formatAgo, formatTime, platformLabel, sourceLabel } from '../utils';
import { statsTooltip, visitorName } from './chart.helpers';
import { StatsAvatar, StatsEmpty, StatsError, StatsSkeleton } from './common';

const DEVICE_ICON = { mobile: Smartphone, tablet: Tablet, desktop: Monitor } as const;

/** "Wer ist gerade da?" – updates every 10 s while the page is visible. */
export const StatsLiveTab: React.FC<{ onUser: (userId: string) => void }> = ({ onUser }) => {
  const { t, i18n } = useTranslation('admin');
  const { data, loading, error, reload } = useStatsQuery(
    StatsApi.live,
    result => result.live,
    'live',
    10_000
  );
  const curve = useMemo(
    () =>
      (data?.curve ?? []).map(point => ({
        time: formatTime(point.at, i18n.language),
        online: point.online,
      })),
    [data, i18n.language]
  );

  if (loading) return <StatsSkeleton variant="list" />;
  if (error && !data) return <StatsError onRetry={() => void reload()} />;
  if (!data) return null;

  return (
    <>
      <LiveHeader live={data} />
      <ChartBlock
        title={t('stats.live.curve')}
        text={t('stats.live.curveText')}
        label={t('stats.live.curveLabel')}
        className="h-36 sm:h-44"
      >
        <AreaChart data={curve} margin={{ left: 0, right: 8, top: 8, bottom: 0 }}>
          <CartesianGrid vertical={false} strokeDasharray="2 4" />
          <XAxis dataKey="time" tickLine={false} axisLine={false} tickMargin={8} minTickGap={32} />
          <YAxis width={28} tickLine={false} axisLine={false} allowDecimals={false} />
          {statsTooltip({ name: () => t('stats.live.online'), cursor: 'line' })}
          <Area
            dataKey="online"
            type="stepAfter"
            stroke={CHART_FILL}
            strokeWidth={2}
            fill={CHART_FILL}
            fillOpacity={0.12}
            isAnimationActive={false}
          />
        </AreaChart>
      </ChartBlock>

      {data.apps.length > 0 && (
        <ChartSection title={t('stats.live.apps')}>
          <BarList
            items={data.apps.map(app => ({
              key: app.key,
              label: appLabel(app.key, t),
              value: app.online,
            }))}
          />
        </ChartSection>
      )}

      <ChartSection title={t('stats.live.list')} text={t('stats.live.listText')} plain>
        {data.items.length ? (
          <ul className="-mx-4 divide-y divide-border/50">
            {data.items.map((item, index) => (
              <LiveRow key={index} item={item} onUser={onUser} />
            ))}
          </ul>
        ) : (
          <StatsEmpty title={t('stats.live.empty')} icon={<Users />} />
        )}
      </ChartSection>
    </>
  );
};

const LiveHeader: React.FC<{ live: IStatsLive }> = ({ live }) => {
  const { t, i18n } = useTranslation('admin');
  return (
    <div className="flex items-end justify-between gap-4 border-b border-border/50 px-4 py-5">
      <div>
        <p className="flex items-center gap-2 text-caption font-semibold text-muted-foreground">
          <span className="relative flex size-2.5" aria-hidden="true">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-foreground opacity-40 motion-reduce:animate-none" />
            <span className="relative inline-flex size-2.5 rounded-full bg-foreground" />
          </span>
          {t('stats.live.now')}
        </p>
        <p className="mt-1 text-[3.5rem] leading-none font-black tabular-nums">
          {live.online.toLocaleString(i18n.language)}
        </p>
        <p className="mt-1 text-body text-muted-foreground">
          {t('stats.live.online', { count: live.online })}
        </p>
      </div>
      <dl className="grid grid-cols-2 gap-4 text-right">
        <div>
          <dt className="text-caption text-muted-foreground">{t('stats.users')}</dt>
          <dd className="text-display font-black tabular-nums">{live.users}</dd>
        </div>
        <div>
          <dt className="text-caption text-muted-foreground">{t('stats.guests')}</dt>
          <dd className="text-display font-black tabular-nums">{live.guests}</dd>
        </div>
      </dl>
    </div>
  );
};

const LiveRow: React.FC<{ item: IStatsLiveItem; onUser: (userId: string) => void }> = ({
  item,
  onUser,
}) => {
  const { t, i18n } = useTranslation('admin');
  const DeviceIcon = DEVICE_ICON[item.device] ?? Monitor;
  const content = (
    <>
      <StatsAvatar user={item.user} kind={item.kind} />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-body font-bold">
          {visitorName(item.user, item.kind, t)}
        </span>
        <span className="block font-mono text-caption break-all text-foreground/80">
          {item.path}
        </span>
        <span className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-micro text-muted-foreground">
          <span className="flex items-center gap-1">
            <DeviceIcon className="size-3.5" aria-hidden="true" />
            {platformLabel(item.platform, t)} · {item.browser}
          </span>
          {item.standalone && <Badge variant="outline">{t('stats.pwaBadge')}</Badge>}
          {item.source !== 'internal' && item.source !== 'direct' && (
            <span>{sourceLabel(item.source, t)}</span>
          )}
        </span>
      </span>
      <span className="shrink-0 text-right text-micro text-muted-foreground tabular-nums">
        {t('stats.live.since', { time: formatAgo(item.since, i18n.language) })}
      </span>
    </>
  );
  const className = 'flex w-full items-start gap-3 px-4 py-3 text-left';
  return (
    <li>
      {item.user ? (
        <button
          type="button"
          onClick={() => onUser(item.user!.id)}
          className={`${className} active:bg-accent hover:bg-accent/60`}
        >
          {content}
        </button>
      ) : (
        <div className={className}>{content}</div>
      )}
    </li>
  );
};
