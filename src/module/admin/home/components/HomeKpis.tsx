import { changePercent, StatTile } from '@ui/patterns/chart';
import { Skeleton } from '@ui/shad-cn/components/skeleton.tsx';
import { Eye, UserCheck, UserPlus, Users } from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { ADMIN_STATS_ROUTE } from '../../const';
import { StatsApi } from '../../stats/api';
import { useStatsQuery } from '../../stats/hooks/use.stats.query';
import type { IStatsKpi, IStatsSeriesDay } from '../../stats/types';
import { formatNumber } from '../../stats/utils';
import { rememberStatsTab } from '../utils';
import { HomeError, HomeSection } from './HomeSection';

const RANGE = 7;

interface ITile {
  key: keyof Pick<IStatsKpi, 'visitors' | 'activeUsers' | 'registrations' | 'views'>;
  icon: React.ReactNode;
  day: (day: IStatsSeriesDay) => number;
}

const TILES: ITile[] = [
  { key: 'visitors', icon: <Users />, day: day => day.users + day.guests },
  { key: 'activeUsers', icon: <UserCheck />, day: day => day.users },
  { key: 'registrations', icon: <UserPlus />, day: day => day.registrations },
  { key: 'views', icon: <Eye />, day: day => day.views },
];

/**
 * Key figures of the last 7 days against the 7 days before (a fair comparison – "today"
 * against the whole of yesterday would always look like a drop). Today's value as hint.
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
        {TILES.map(tile => (
          <Skeleton key={tile.key} className="h-32 rounded-2xl" />
        ))}
      </div>
    );
  } else if (error || !data) {
    body = <HomeError text={t('home.error')} retry={t('retry')} onRetry={() => void reload()} />;
  } else {
    const today = data.days[data.days.length - 1];
    body = (
      <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
        {TILES.map(tile => (
          <StatTile
            key={tile.key}
            icon={tile.icon}
            label={t(`home.kpi.${tile.key}`)}
            value={formatNumber(data.kpi[tile.key], locale)}
            change={changePercent(data.kpi[tile.key], data.previous[tile.key])}
            changeLabel={t('home.kpi.change')}
            hint={
              today
                ? t('home.kpi.today', { value: formatNumber(tile.day(today), locale) })
                : undefined
            }
            spark={data.days.map(tile.day)}
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
