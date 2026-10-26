import { Badge } from '@ui/shad-cn/components/badge.tsx';
import { Input } from '@ui/shad-cn/components/input.tsx';
import { Label } from '@ui/shad-cn/components/label.tsx';
import { Switch } from '@ui/shad-cn/components/switch.tsx';
import { ToggleGroup, ToggleGroupItem } from '@ui/shad-cn/components/toggle-group.tsx';
import { useDebounce } from '@uidotdev/usehooks';
import { Search, UsersRound } from 'lucide-react';
import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { StatsApi } from '../api';
import { useStatsQuery } from '../hooks/use.stats.query';
import type { IStatsVisitor, StatsRange, StatsVisitorFilter } from '../types';
import { formatAgo, formatDuration, formatTime, platformLabel, sourceLabel } from '../utils';
import { visitorName } from './chart.helpers';
import { StatsAvatar, StatsEmpty, StatsError, StatsSkeleton } from './common';

const FILTERS: StatsVisitorFilter[] = ['all', 'new', 'guests', 'pwa'];
type Group = 'today' | 'yesterday' | 'week' | 'older';

const groupOf = (iso: string): Group => {
  const date = new Date(iso);
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  if (date >= start) return 'today';
  const yesterday = new Date(start.getTime() - 86_400_000);
  if (date >= yesterday) return 'yesterday';
  if (date >= new Date(start.getTime() - 6 * 86_400_000)) return 'week';
  return 'older';
};

/** "Wer war da?" – list by last visit (max. 30 days, raw data). */
export const StatsVisitorsTab: React.FC<{
  range: StatsRange;
  onUser: (userId: string) => void;
}> = ({ range, onUser }) => {
  const { t } = useTranslation('admin');
  const [filter, setFilter] = useState<StatsVisitorFilter>('all');
  const [hideAdmins, setHideAdmins] = useState(true);
  const [term, setTerm] = useState('');
  const debounced = useDebounce(term, 300);
  const { data, loading, error, reload } = useStatsQuery(
    () => StatsApi.visitors(range, filter, hideAdmins, debounced),
    result =>
      result.visitors ? { visitors: result.visitors, total: result.total ?? 0 } : undefined,
    `${range}|${filter}|${hideAdmins}|${debounced}`,
    30_000
  );
  const groups = useMemo(() => {
    const map = new Map<Group, IStatsVisitor[]>();
    (data?.visitors ?? []).forEach(visitor => {
      const group = groupOf(visitor.lastAt);
      map.set(group, [...(map.get(group) ?? []), visitor]);
    });
    return (['today', 'yesterday', 'week', 'older'] as Group[])
      .filter(group => map.has(group))
      .map(group => ({ group, items: map.get(group)! }));
  }, [data]);

  return (
    <>
      <div className="space-y-3 border-b border-border/50 px-4 py-3">
        <div className="relative">
          <Search
            className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            type="search"
            value={term}
            onChange={event => setTerm(event.target.value)}
            placeholder={t('stats.visitors.search')}
            aria-label={t('stats.visitors.search')}
            autoCapitalize="off"
            autoCorrect="off"
            className="h-11 rounded-full pl-10 text-base sm:text-sm"
          />
        </div>
        <div className="-mx-4 overflow-x-auto px-4 [scrollbar-width:none]">
          <ToggleGroup
            type="single"
            value={filter}
            onValueChange={next => next && setFilter(next as StatsVisitorFilter)}
            aria-label={t('stats.visitors.filter')}
            className="flex-nowrap justify-start gap-2"
          >
            {FILTERS.map(value => (
              <ToggleGroupItem
                key={value}
                value={value}
                className="h-9 shrink-0 rounded-full border border-border/70 px-4 text-caption font-bold whitespace-nowrap data-[state=on]:border-foreground data-[state=on]:bg-foreground data-[state=on]:text-background"
              >
                {t(`stats.visitors.filters.${value}`)}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>
        <div className="flex items-center justify-between gap-3">
          <Label htmlFor="stats-hide-admins" className="text-body font-semibold">
            {t('stats.visitors.hideAdmins')}
          </Label>
          <Switch id="stats-hide-admins" checked={hideAdmins} onCheckedChange={setHideAdmins} />
        </div>
        {range > 30 && (
          <p className="text-micro text-muted-foreground">{t('stats.visitors.max30')}</p>
        )}
      </div>

      {loading ? (
        <StatsSkeleton variant="list" />
      ) : error && !data ? (
        <StatsError onRetry={() => void reload()} />
      ) : !groups.length ? (
        <StatsEmpty title={t('stats.visitors.empty')} icon={<UsersRound />} />
      ) : (
        <>
          <p className="px-4 pt-3 text-caption text-muted-foreground">
            {t('stats.visitors.count', { count: data?.total ?? 0 })}
          </p>
          {groups.map(({ group, items }) => (
            <section key={group} aria-labelledby={`visitors-${group}`}>
              <h3
                id={`visitors-${group}`}
                className="sticky top-12 z-[1] bg-background/90 px-4 pt-4 pb-1 text-title font-bold backdrop-blur"
              >
                {t(`stats.visitors.groups.${group}`)}
              </h3>
              <ul className="divide-y divide-border/50">
                {items.map(visitor => (
                  <VisitorRow key={visitor.key} visitor={visitor} onUser={onUser} />
                ))}
              </ul>
            </section>
          ))}
        </>
      )}
    </>
  );
};

const VisitorRow: React.FC<{ visitor: IStatsVisitor; onUser: (userId: string) => void }> = ({
  visitor,
  onUser,
}) => {
  const { t, i18n } = useTranslation('admin');
  const content = (
    <>
      <StatsAvatar user={visitor.user} kind={visitor.kind} />
      <span className="min-w-0 flex-1">
        <span className="flex flex-wrap items-center gap-1.5">
          <span className="truncate text-body font-bold">
            {visitorName(visitor.user, visitor.kind, t)}
          </span>
          {visitor.isNew && <Badge>{t('stats.visitors.new')}</Badge>}
          {visitor.admin && <Badge variant="outline">{t('stats.visitors.admin')}</Badge>}
          {visitor.standalone && <Badge variant="outline">{t('stats.pwaBadge')}</Badge>}
        </span>
        <span className="mt-0.5 block text-caption text-muted-foreground">
          {t('stats.visitors.line', {
            views: visitor.views,
            duration: formatDuration(visitor.seconds),
            first: formatTime(visitor.firstAt, i18n.language),
          })}
        </span>
        <span className="mt-0.5 block text-micro text-muted-foreground">
          {platformLabel(visitor.platform, t)} · {visitor.browser} ·{' '}
          {sourceLabel(visitor.source, t)}
        </span>
        <span className="mt-0.5 block font-mono text-micro break-all text-foreground/70">
          {visitor.lastPath}
        </span>
      </span>
      <span className="shrink-0 text-micro text-muted-foreground tabular-nums">
        {formatAgo(visitor.lastAt, i18n.language)}
      </span>
    </>
  );
  const className = 'flex w-full items-start gap-3 px-4 py-3 text-left';
  return (
    <li>
      {visitor.user ? (
        <button
          type="button"
          onClick={() => onUser(visitor.user!.id)}
          className={`${className} hover:bg-accent/60 active:bg-accent`}
        >
          {content}
        </button>
      ) : (
        <div className={className}>{content}</div>
      )}
    </li>
  );
};
