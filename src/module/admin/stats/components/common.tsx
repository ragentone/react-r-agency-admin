import { cn } from '@ui/lib/utils';
import { Delayed } from '@ui/patterns';
import { Avatar, AvatarFallback, AvatarImage } from '@ui/shad-cn/components/avatar.tsx';
import { Button } from '@ui/shad-cn/components/button.tsx';
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@ui/shad-cn/components/empty.tsx';
import { Skeleton } from '@ui/shad-cn/components/skeleton.tsx';
import { ToggleGroup, ToggleGroupItem } from '@ui/shad-cn/components/toggle-group.tsx';
import { ChartNoAxesColumn, CloudOff, Ghost, ShieldCheck } from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { initials } from '../../utils';
import type { IStatsUserRef, StatsRange } from '../types';
import { RANGE_OPTIONS } from '../utils';

/** Range chips: Heute · 7 Tage · 30 Tage · 12 Monate. */
export const StatsRangeToggle: React.FC<{
  value: StatsRange;
  onChange: (value: StatsRange) => void;
  max?: StatsRange;
}> = ({ value, onChange, max }) => {
  const { t } = useTranslation('admin');
  return (
    <ToggleGroup
      type="single"
      value={String(value)}
      onValueChange={next => next && onChange(Number(next) as StatsRange)}
      aria-label={t('stats.range.label')}
      className="grid w-full grid-cols-4 gap-1 rounded-full border border-border/60 p-1"
    >
      {RANGE_OPTIONS.map(option => (
        <ToggleGroupItem
          key={option.value}
          value={String(option.value)}
          disabled={max !== undefined && option.value > max}
          className="h-10 rounded-full px-1 text-caption font-bold data-[state=on]:bg-foreground data-[state=on]:text-background"
        >
          {t(option.label)}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
};

/**
 * Loading placeholder of a tab – appears only after 300 ms (no flash on fast loads).
 * `charts`: key figure tiles + chart blocks · `list`: rows with avatar (live, visitors).
 */
export const StatsSkeleton: React.FC<{ tiles?: number; variant?: 'charts' | 'list' }> = ({
  tiles = 6,
  variant = 'charts',
}) => {
  const { t } = useTranslation('admin');
  return (
    <Delayed label={t('stats.loading')} className="min-h-[60vh]">
      {variant === 'list' ? (
        <ul className="divide-y divide-border/50">
          {Array.from({ length: 8 }, (_, index) => (
            <li key={index} className="flex items-start gap-3 px-4 py-3">
              <Skeleton className="size-10 shrink-0 rounded-full" />
              <span className="flex flex-1 flex-col gap-2 pt-0.5">
                <Skeleton className="h-4 w-2/5 rounded-full" />
                <Skeleton className="h-3 w-4/5 rounded-full" />
                <Skeleton className="h-3 w-1/3 rounded-full" />
              </span>
              <Skeleton className="h-3 w-10 shrink-0 rounded-full" />
            </li>
          ))}
        </ul>
      ) : (
        <div className="space-y-4 px-4 pt-4 pb-8">
          {tiles > 0 && (
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {Array.from({ length: tiles }, (_, index) => (
                <Skeleton key={index} className="h-28 rounded-2xl" />
              ))}
            </div>
          )}
          <div className="space-y-3">
            <Skeleton className="h-5 w-1/3 rounded-full" />
            <Skeleton className="h-3 w-1/2 rounded-full" />
            <Skeleton className="h-48 rounded-2xl sm:h-56" />
          </div>
          <div className="space-y-3">
            <Skeleton className="h-5 w-1/4 rounded-full" />
            {Array.from({ length: 4 }, (_, index) => (
              <Skeleton
                key={index}
                className="h-9 rounded-lg"
                style={{ width: `${92 - index * 18}%` }}
              />
            ))}
          </div>
        </div>
      )}
    </Delayed>
  );
};

export const StatsError: React.FC<{ onRetry: () => void }> = ({ onRetry }) => {
  const { t } = useTranslation('admin');
  return (
    <Empty className="py-16">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <CloudOff />
        </EmptyMedia>
        <EmptyTitle>{t('stats.error.title')}</EmptyTitle>
        <EmptyDescription>{t('stats.error.text')}</EmptyDescription>
      </EmptyHeader>
      <Button variant="outline" onClick={onRetry}>
        {t('retry')}
      </Button>
    </Empty>
  );
};

export const StatsEmpty: React.FC<{ title: string; text?: string; icon?: React.ReactNode }> = ({
  title,
  text,
  icon,
}) => (
  <Empty className="py-12">
    <EmptyHeader>
      <EmptyMedia variant="icon">{icon ?? <ChartNoAxesColumn />}</EmptyMedia>
      <EmptyTitle>{title}</EmptyTitle>
      {text && <EmptyDescription>{text}</EmptyDescription>}
    </EmptyHeader>
  </Empty>
);

/** Avatar of a user, or an icon for a guest / minor. */
export const StatsAvatar: React.FC<{
  user: IStatsUserRef | null;
  kind: 'user' | 'guest' | 'minor';
  className?: string;
}> = ({ user, kind, className }) => (
  <Avatar className={cn('size-10', className)}>
    {user?.avatarUrl && <AvatarImage src={user.avatarUrl} alt="" className="object-cover" />}
    <AvatarFallback className="bg-foreground/[0.08] text-sm font-bold">
      {user ? (
        initials(user.alias)
      ) : kind === 'minor' ? (
        <ShieldCheck className="size-4" aria-hidden="true" />
      ) : (
        <Ghost className="size-4" aria-hidden="true" />
      )}
    </AvatarFallback>
  </Avatar>
);
