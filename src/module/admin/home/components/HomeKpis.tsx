import { changePercent } from '@ui/patterns/chart';
import { Skeleton } from '@ui/shad-cn/components/skeleton.tsx';
import { Bot, Eye, KeyRound, UserCheck, UserPlus, Users } from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { StatsApi } from '../../stats/api';
import { useStatsQuery } from '../../stats/hooks/use.stats.query';
import { formatNumber } from '../../stats/utils';
import { AdminKpi } from '../../ui/AdminKpi';
import { HomeError, HomeSection } from './HomeSection';

const RANGE = 7;

/**
 * Counts of the last 7 days against the 7 days before (a fair comparison – "today" against the
 * whole of yesterday would always look like a drop). Today's value as hint. Bots and failed
 * sign-ins come from the security counts.
 */
export const HomeKpis: React.FC = () => {
  const { t, i18n } = useTranslation('admin');
  const locale = i18n.language;
  const overview = useStatsQuery(
    () => StatsApi.overview(RANGE),
    result => result.stats,
    'home-kpis',
    300_000
  );
  const security = useStatsQuery(
    () => StatsApi.security(RANGE),
    result => result.security,
    'home-security',
    300_000
  );

  const reloadAll = () => {
    overview.reload();
    security.reload();
  };

  let body: React.ReactNode;
  if (overview.loading || security.loading) {
    body = (
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        {[0, 1, 2, 3, 4, 5].map(index => (
          <Skeleton key={index} className="h-36 rounded-xl" />
        ))}
      </div>
    );
  } else if (!overview.data && !security.data) {
    body = <HomeError text={t('home.error')} retry={t('retry')} onRetry={reloadAll} />;
  } else {
    const o = overview.data;
    const s = security.data;
    const today = o?.days[o.days.length - 1];
    const count = (value?: number) => (value === undefined ? '–' : formatNumber(value, locale));
    const change = (now?: number, before?: number) =>
      now === undefined || before === undefined ? undefined : changePercent(now, before);
    const hint = (day?: number) =>
      today && day !== undefined
        ? t('home.kpi.today', { value: formatNumber(day, locale) })
        : undefined;

    const tiles = [
      {
        key: 'views',
        icon: <Eye />,
        label: t('stats.kpi.views'),
        value: o?.totals.views,
        change: change(o?.totals.views, o?.previous.views),
        hint: hint(today?.views),
        spark: o?.days.map(day => day.views),
      },
      {
        key: 'users',
        icon: <UserCheck />,
        label: t('stats.users'),
        value: o?.totals.users,
        change: change(o?.totals.users, o?.previous.users),
        hint: hint(today?.users),
        spark: o?.days.map(day => day.users),
      },
      {
        key: 'guests',
        icon: <Users />,
        label: t('stats.guests'),
        value: o?.totals.guests,
        change: change(o?.totals.guests, o?.previous.guests),
        hint: hint(today?.guests),
        spark: o?.days.map(day => day.guests),
      },
      {
        key: 'registrations',
        icon: <UserPlus />,
        label: t('stats.kpi.registrations'),
        value: o?.totals.registrations,
        change: change(o?.totals.registrations, o?.previous.registrations),
        hint: undefined,
        spark: undefined,
      },
      {
        key: 'bots',
        icon: <Bot />,
        label: t('stats.bots'),
        value: o?.totals.bots,
        change: change(o?.totals.bots, o?.previous.bots),
        hint: hint(today?.bots),
        spark: o?.days.map(day => day.bots),
      },
      {
        key: 'failures',
        icon: <KeyRound />,
        label: t('stats.security.failures'),
        value: s?.totals.failures,
        change: undefined,
        hint: t('stats.range.7'),
        spark: s?.failures.map(day => day.known + day.unknown),
      },
    ];

    body = (
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        {tiles.map(tile => (
          <AdminKpi
            key={tile.key}
            icon={tile.icon}
            label={tile.label}
            value={count(tile.value)}
            change={tile.change}
            changeLabel={t('home.kpi.change')}
            hint={tile.hint}
            spark={tile.spark}
          />
        ))}
      </div>
    );
  }

  return (
    <HomeSection bare={true} title={t('home.kpi.title')}>
      {body}
    </HomeSection>
  );
};
