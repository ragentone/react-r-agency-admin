import { Skeleton } from '@ui/shad-cn/components/skeleton.tsx';
import { ChevronRight } from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { ADMIN_STATS_ROUTE } from '../../const';
import { StatsApi } from '../../stats/api';
import { StatsAvatar } from '../../stats/components/common';
import { useStatsQuery } from '../../stats/hooks/use.stats.query';
import { formatAgo, platformLabel } from '../../stats/utils';
import { HOME_MEMBERS_MAX, rememberStatsTab } from '../utils';
import { HomeError, HomeSection } from './HomeSection';

const RANGE = 7;

/** Newest sign-ups of the last 7 days (timeline rows) – tap opens the user drawer. */
export const HomeMembers: React.FC<{ onUser: (userId: string) => void; className?: string }> = ({
  onUser,
  className,
}) => {
  const { t, i18n } = useTranslation('admin');
  const locale = i18n.language;
  const { data, loading, error, reload } = useStatsQuery(
    () => StatsApi.visitors(RANGE, 'new', true, ''),
    result => result.visitors,
    'home-members',
    60_000
  );

  const members = (data ?? [])
    .filter(visitor => visitor.user)
    .sort((a, b) => b.firstAt.localeCompare(a.firstAt))
    .slice(0, HOME_MEMBERS_MAX);

  let body: React.ReactNode;
  if (loading) {
    body = (
      <ul className="space-y-3" aria-busy="true">
        {[0, 1, 2].map(index => (
          <li key={index} className="flex items-center gap-3">
            <Skeleton className="size-10 shrink-0 rounded-full" />
            <span className="flex flex-1 flex-col gap-2">
              <Skeleton className="h-4 w-2/5 rounded-full" />
              <Skeleton className="h-3 w-3/5 rounded-full" />
            </span>
          </li>
        ))}
      </ul>
    );
  } else if (error && !data) {
    body = <HomeError text={t('home.error')} retry={t('retry')} onRetry={() => void reload()} />;
  } else if (!members.length) {
    body = <p className="text-caption text-muted-foreground">{t('home.members.empty')}</p>;
  } else {
    body = (
      <ul className="-mx-4 divide-y divide-border/50 border-y border-border/50">
        {members.map(member => (
          <li key={member.key}>
            <button
              type="button"
              onClick={() => onUser(member.user!.id)}
              aria-label={t('home.openUser', { name: member.user!.alias })}
              className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-foreground/[0.03] focus-visible:bg-foreground/[0.05] focus-visible:outline-none active:bg-foreground/[0.06]"
            >
              <StatsAvatar user={member.user} kind={member.kind} />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-body font-bold">@{member.user!.alias}</span>
                <span className="block truncate text-caption text-muted-foreground">
                  {t('home.members.joined', {
                    ago: formatAgo(member.firstAt, locale),
                    platform: platformLabel(member.platform, t),
                  })}
                </span>
              </span>
              <ChevronRight className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
            </button>
          </li>
        ))}
      </ul>
    );
  }

  return (
    <HomeSection
      title={t('home.members.title')}
      to={ADMIN_STATS_ROUTE}
      linkLabel={t('home.more')}
      onNavigate={() => rememberStatsTab('visitors', RANGE)}
      className={className}
    >
      {body}
    </HomeSection>
  );
};
