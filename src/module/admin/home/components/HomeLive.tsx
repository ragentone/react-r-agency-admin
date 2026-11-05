import { Link } from '@tanstack/react-router';
import { Sparkline } from '@ui/patterns/chart';
import { Card, CardContent } from '@ui/shad-cn/components/card.tsx';
import { Skeleton } from '@ui/shad-cn/components/skeleton.tsx';
import { ChevronRight } from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { ADMIN_STATS_ROUTE } from '../../const';
import { StatsApi } from '../../stats/api';
import { useStatsQuery } from '../../stats/hooks/use.stats.query';
import { formatNumber } from '../../stats/utils';
import { rememberStatsTab } from '../utils';
import { HomeError } from './HomeSection';

/** Who is online right now (counts) – the whole card opens the live tab. Reloads every 30 s. */
export const HomeLive: React.FC = () => {
  const { t, i18n } = useTranslation('admin');
  const { data, loading, error, reload } = useStatsQuery(
    () => StatsApi.live(),
    result => result.live,
    'home-live',
    30_000
  );

  if (loading) return <Skeleton className="h-36 rounded-2xl" />;
  if (error || !data) {
    return <HomeError text={t('home.error')} retry={t('retry')} onRetry={() => void reload()} />;
  }

  return (
    <Card className="rounded-2xl border-border/60 shadow-none transition-colors hover:bg-foreground/[0.02]">
      <Link
        to={ADMIN_STATS_ROUTE}
        onClick={() => rememberStatsTab('live')}
        aria-label={t('home.live.open', { count: data.online })}
        className="block rounded-2xl focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
      >
        <CardContent className="flex flex-col gap-2 p-4">
          <span className="flex items-center gap-2 text-caption font-semibold text-muted-foreground">
            <span className="relative flex size-2.5" aria-hidden="true">
              {data.online > 0 && (
                <span className="absolute inline-flex size-full rounded-full bg-foreground opacity-60 motion-safe:animate-ping" />
              )}
              <span className="relative inline-flex size-2.5 rounded-full bg-foreground" />
            </span>
            {t('home.live.title')}
            <ChevronRight className="ml-auto size-4" aria-hidden="true" />
          </span>
          <span className="flex flex-col">
            <span className="text-display font-black tabular-nums">
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
      </Link>
    </Card>
  );
};
