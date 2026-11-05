import { changePercent, StatTile } from '@ui/patterns/chart';
import { Skeleton } from '@ui/shad-cn/components/skeleton.tsx';
import { Eye, UserCheck, UserPlus, Users } from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { ADMIN_STATS_ROUTE } from '../../const';
import { StatsApi } from '../../stats/api';
import { useStatsQuery } from '../../stats/hooks/use.stats.query';
import { formatNumber } from '../../stats/utils';
import { rememberStatsTab } from '../utils';
import { HomeError, HomeSection } from './HomeSection';

const RANGE = 7;

/**
 * Counts of the last 7 days against the 7 days before (a fair comparison – "today" against the
 * whole of yesterday would always look like a drop). Today's value as hint.
 */
export const HomeKpis: React.FC = () => {
  const { t, i18n } = useTranslation('admin');
  const locale = i18n.language;
  const { data, loading, error, reload } = useStatsQuery(
    () => StatsApi.overview(RANGE),
    result => result.stats,
    'home-kpis',
    300_000
  );

  let body: React.ReactNode;
  if (loading) {
    body = (
      <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
        {[0, 1, 2, 3].map(index => (
          <Skeleton key={index} className="h-32 rounded-2xl" />
        ))}
      </div>
    );
  } else if (error || !data) {
    body = <HomeError text={t('home.error')} retry={t('retry')} onRetry={() => void reload()} />;
  } else {
    const { totals, previous, days } = data;
    const today = days[days.length - 1];
    const tiles = [
      {
        key: 'views',
        icon: <Eye />,
        label: t('stats.kpi.views'),
        now: totals.views,
        before: previous.views,
        day: today?.views ?? 0,
        spark: days.map(day => day.views),
      },
      {
        key: 'users',
        icon: <UserCheck />,
        label: t('stats.users'),
        now: totals.users,
        before: previous.users,
        day: today?.users ?? 0,
        spark: days.map(day => day.users),
      },
      {
        key: 'guests',
        icon: <Users />,
        label: t('stats.guests'),
        now: totals.guests,
        before: previous.guests,
        day: today?.guests ?? 0,
        spark: days.map(day => day.guests),
      },
      {
        key: 'registrations',
        icon: <UserPlus />,
        label: t('stats.kpi.registrations'),
        now: totals.registrations,
        before: previous.registrations,
        day: 0,
        spark: [] as number[],
      },
    ];
    body = (
      <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
        {tiles.map(tile => (
          <StatTile
            key={tile.key}
            icon={tile.icon}
            label={tile.label}
            value={formatNumber(tile.now, locale)}
            change={changePercent(tile.now, tile.before)}
            changeLabel={t('home.kpi.change')}
            hint={
              tile.key !== 'registrations' && today
                ? t('home.kpi.today', { value: formatNumber(tile.day, locale) })
                : undefined
            }
            spark={tile.spark}
          />
        ))}
      </div>
    );
  }

  return (
    <HomeSection
      title={t('home.kpi.title')}
      to={ADMIN_STATS_ROUTE}
      linkLabel={t('home.more')}
      onNavigate={() => rememberStatsTab('overview', RANGE)}
    >
      {body}
    </HomeSection>
  );
};
