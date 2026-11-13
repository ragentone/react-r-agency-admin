import { Skeleton } from '@ui/shad-cn/components/skeleton.tsx';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { StatsApi } from '../../stats/api';
import { useStatsQuery } from '../../stats/hooks/use.stats.query';
import { formatNumber } from '../../stats/utils';
import { HomeNewUsersList, HomeNewUsersTable } from './HomeNewUsersRows';
import { HomeError, HomeSection } from './HomeSection';

const RANGE = 7;
/** Rows on the start page; the rest is only counted. */
const SHOWN = 20;

/**
 * Who signed up in the last 7 days. Tap → user drawer. Under 16 only a line without name,
 * e-mail or id (privacy rule of the statistics). List on phones, table from `md`.
 */
export const HomeNewUsers: React.FC<{ onUser: (userId: string) => void }> = ({ onUser }) => {
  const { t, i18n } = useTranslation('admin');
  const locale = i18n.language;
  const result = useStatsQuery(
    () => StatsApi.newUsers(RANGE),
    value => value.newUsers,
    'home-new-users',
    300_000
  );
  const data = result.data;

  let body: React.ReactNode;
  if (result.loading) {
    body = (
      <div className="flex flex-col gap-2 p-4">
        {[0, 1, 2].map(index => (
          <Skeleton key={index} className="h-12 rounded-lg" />
        ))}
      </div>
    );
  } else if (!data) {
    body = (
      <div className="p-4">
        <HomeError text={t('home.error')} retry={t('retry')} onRetry={result.reload} />
      </div>
    );
  } else if (data.users.length === 0) {
    body = <p className="p-4 text-caption text-muted-foreground">{t('home.newUsers.empty')}</p>;
  } else {
    const shown = data.users.slice(0, SHOWN);
    const rest = data.total - shown.length;
    const props = { users: shown, locale, onUser };
    body = (
      <>
        <HomeNewUsersList {...props} />
        <HomeNewUsersTable {...props} />
        {rest > 0 && (
          <p className="border-t border-border/50 px-4 py-3 text-caption text-muted-foreground">
            {t('home.newUsers.more', { count: rest, value: formatNumber(rest, locale) })}
          </p>
        )}
      </>
    );
  }

  return (
    <HomeSection
      flush={true}
      title={t('home.newUsers.title')}
      aside={
        data ? (
          <span className="rounded-md bg-muted px-1.5 py-0.5 text-micro font-semibold text-muted-foreground tabular-nums">
            {formatNumber(data.total, locale)}
          </span>
        ) : undefined
      }
    >
      {body}
    </HomeSection>
  );
};
