import { Sparkline } from '@ui/patterns/chart';
import { Card, CardContent } from '@ui/shad-cn/components/card.tsx';
import { Skeleton } from '@ui/shad-cn/components/skeleton.tsx';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { StatsApi } from '../../stats/api';
import { useStatsQuery } from '../../stats/hooks/use.stats.query';
import { formatNumber } from '../../stats/utils';
import { HomeError } from './HomeSection';

/** Who is online right now (counts). Reloads every 30 s. */
export const HomeLive: React.FC = () => {
  const { t, i18n } = useTranslation('admin');
  const { data, loading, error, reload } = useStatsQuery(
    () => StatsApi.live(),
    result => result.live,
    'home-live',
    30_000
  );

  if (loading) return <Skeleton className="h-40 rounded-xl" />;
  if (error || !data) {
    return <HomeError text={t('home.error')} retry={t('retry')} onRetry={() => void reload()} />;
  }

  return (
    <Card className="rounded-xl border-border/50 shadow-none">
      <CardContent className="flex flex-col gap-3 p-4">
        <span className="flex items-center gap-2 text-caption font-medium text-muted-foreground">
          <span className="relative flex size-2.5" aria-hidden="true">
            {data.online > 0 && (
              <span className="absolute inline-flex size-full rounded-full bg-foreground opacity-60 motion-safe:animate-ping" />
            )}
            <span className="relative inline-flex size-2.5 rounded-full bg-foreground" />
          </span>
          {t('home.live.title')}
        </span>
        <span className="flex flex-col">
          <span className="text-display font-bold tabular-nums">
            {formatNumber(data.online, i18n.language)}
          </span>
          <span className="text-caption text-muted-foreground">
            {t('home.live.split', { users: data.users, guests: data.guests })}
          </span>
        </span>
        {data.curve.length > 1 && (
          <Sparkline values={data.curve.map(point => point.online)} height={36} className="h-9" />
        )}
      </CardContent>
    </Card>
  );
};
