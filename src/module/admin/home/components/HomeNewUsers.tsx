import { Skeleton } from '@ui/shad-cn/components/skeleton.tsx';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { StatsApi } from '../../stats/api';
import { useStatsQuery } from '../../stats/hooks/use.stats.query';
import { formatAgo, formatNumber } from '../../stats/utils';
import { HomeError, HomeSection } from './HomeSection';

const RANGE = 7;
/** Rows on the start page; the rest is only counted. */
const SHOWN = 20;

/**
 * Who signed up in the last 7 days. Tap → user drawer. Under 16 only a line without name,
 * e-mail or id (privacy rule of the statistics).
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
      <div className="flex flex-col gap-2">
        {[0, 1, 2].map(index => (
          <Skeleton key={index} className="h-14 rounded-2xl" />
        ))}
      </div>
    );
  } else if (!data) {
    body = <HomeError text={t('home.error')} retry={t('retry')} onRetry={result.reload} />;
  } else if (data.users.length === 0) {
    body = <p className="text-caption text-muted-foreground">{t('home.newUsers.empty')}</p>;
  } else {
    const shown = data.users.slice(0, SHOWN);
    const rest = data.total - shown.length;
    body = (
      <>
        <ul className="divide-y divide-border/50 overflow-hidden rounded-2xl border border-border/50">
          {shown.map((user, index) => {
            const time = formatAgo(user.registeredAt, locale);
            if (user.minor || !user.id) {
              return (
                <li
                  key={`minor-${index}`}
                  className="flex min-h-14 items-center gap-3 px-4 py-3 text-caption text-muted-foreground"
                >
                  <span className="min-w-0 flex-1 truncate">{t('home.newUsers.minor')}</span>
                  <span className="shrink-0">{time}</span>
                </li>
              );
            }
            const initial = (user.alias ?? '?').trim().charAt(0).toUpperCase();
            return (
              <li key={user.id}>
                <button
                  type="button"
                  onClick={() => onUser(user.id as string)}
                  className="flex min-h-14 w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-foreground/[0.03] focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                >
                  <span
                    aria-hidden="true"
                    className="flex size-9 shrink-0 items-center justify-center rounded-full bg-foreground/[0.06] text-caption font-bold"
                  >
                    {initial}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-body font-bold">{user.alias}</span>
                    <span className="block truncate text-caption text-muted-foreground">
                      {user.email}
                    </span>
                  </span>
                  {!user.confirmed && (
                    <span className="shrink-0 rounded-full border border-border/50 px-2 py-0.5 text-micro font-semibold text-muted-foreground">
                      {t('home.newUsers.unconfirmed')}
                    </span>
                  )}
                  <span className="shrink-0 text-caption text-muted-foreground">{time}</span>
                </button>
              </li>
            );
          })}
        </ul>
        {rest > 0 && (
          <p className="text-caption text-muted-foreground">
            {t('home.newUsers.more', { count: rest, value: formatNumber(rest, locale) })}
          </p>
        )}
      </>
    );
  }

  return (
    <HomeSection
      title={t('home.newUsers.title')}
      aside={
        data ? (
          <span className="text-caption text-muted-foreground">
            {formatNumber(data.total, locale)}
          </span>
        ) : undefined
      }
    >
      {body}
    </HomeSection>
  );
};
