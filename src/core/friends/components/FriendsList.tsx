import { cn } from '@ui/lib/utils';
import { Button } from '@ui/shad-cn/components/button.tsx';
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@ui/shad-cn/components/empty.tsx';
import { Skeleton } from '@ui/shad-cn/components/skeleton.tsx';
import { Spinner } from '@ui/shad-cn/components/spinner.tsx';
import { AnimatePresence } from 'framer-motion';
import { Ban, Inbox, type LucideIcon, RefreshCw, Search, Send, Users, WifiOff } from 'lucide-react';
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import { useFriendsList } from '../hooks/use.friends.list';
import { useLoadMoreSentinel } from '../hooks/use.load.more.sentinel';
import type { FriendsFilter } from '../types';
import { FriendsListItem } from './FriendsListItem';

const EMPTY_ICONS: Record<FriendsFilter, LucideIcon> = {
  accepted: Users,
  incoming: Inbox,
  outgoing: Send,
  blocked: Ban,
};

export const FriendsListSkeleton = ({
  count = 6,
  withAction = true,
}: {
  count?: number;
  withAction?: boolean;
}) => (
  <ul aria-hidden className="divide-y divide-border/50">
    {Array.from({ length: count }).map((_, i) => (
      <li key={i} className="flex items-center gap-3 px-4 py-3">
        <Skeleton className="size-12 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 rounded-full" style={{ width: `${40 + ((i * 17) % 30)}%` }} />
          <Skeleton className="h-3 w-24 rounded-full" />
        </div>
        {withAction && <Skeleton className="h-8 w-8 rounded-full min-[400px]:w-24" />}
      </li>
    ))}
  </ul>
);

/** Empty / error state of a friends list (shadcn `Empty`, X look: round icon, bold title). */
export const FriendsEmpty: React.FC<{
  icon: LucideIcon;
  title: string;
  text?: string;
  action?: React.ReactNode;
  role?: string;
  className?: string;
}> = ({ icon: Icon, title, text, action, role, className }) => (
  <Empty role={role} className={cn('gap-5 rounded-none border-0 px-8 py-10 md:p-10', className)}>
    <EmptyHeader>
      <EmptyMedia variant="icon" className="size-14 rounded-full bg-accent">
        <Icon className="size-6" strokeWidth={1.75} />
      </EmptyMedia>
      <EmptyTitle className="text-title font-extrabold">{title}</EmptyTitle>
      {text && <EmptyDescription className="text-body text-pretty">{text}</EmptyDescription>}
    </EmptyHeader>
    {action && <EmptyContent>{action}</EmptyContent>}
  </Empty>
);

/** Footer below a paged list: spinner while loading more, retry if that failed. */
export const LoadMoreFooter: React.FC<{
  loadingMore: boolean;
  error: Error | null;
  onRetry: () => void;
}> = ({ loadingMore, error, onRetry }) => {
  const { t } = useTranslation('friends');
  if (loadingMore) {
    return (
      <div className="flex justify-center py-5 text-muted-foreground">
        <Spinner className="size-5" />
      </div>
    );
  }
  if (!error) return null;
  return (
    <div className="flex justify-center py-3">
      <Button variant="ghost" size="sm" className="text-muted-foreground" onClick={onRetry}>
        <RefreshCw />
        {t('actions.retry')}
      </Button>
    </div>
  );
};

/** Paged list of one tab with skeleton, empty / error state and infinite scroll. */
export interface IFriendsListProps {
  filter: FriendsFilter;
  onFindPeople?: () => void;
  /** Wait before the first request (e.g. after a tab switch). */
  initialDelayMs?: number;
  /** Reports whether the list is loading (e.g. to disable the tabs meanwhile). */
  onLoadingChange?: (loading: boolean) => void;
  /** Override for opening a profile from a row. */
  onOpenProfile?: (userId: string) => void;
}

export const FriendsList: React.FC<IFriendsListProps> = ({
  filter,
  onFindPeople,
  initialDelayMs = 0,
  onLoadingChange,
  onOpenProfile,
}) => {
  const { t } = useTranslation('friends');
  const list = useFriendsList(filter, true, initialDelayMs);
  const busy = list.loading || !list.loaded;
  useEffect(() => {
    onLoadingChange?.(busy);
  }, [busy, onLoadingChange]);
  useEffect(() => () => onLoadingChange?.(false), [onLoadingChange]);
  const { hasMore, loadMore, loadingMore, loading } = list;
  const sentinel = useLoadMoreSentinel(
    hasMore && !loading && !loadingMore && !list.error,
    loadMore
  );

  if (!list.loaded || (list.loading && list.items.length === 0)) return <FriendsListSkeleton />;

  if (list.error && list.items.length === 0) {
    return (
      <FriendsEmpty
        role="alert"
        icon={WifiOff}
        title={t('errors.loadTitle')}
        text={t('errors.loadText')}
        action={
          <Button size="lg" onClick={() => void list.reload()}>
            <RefreshCw />
            {t('actions.retry')}
          </Button>
        }
      />
    );
  }

  if (list.items.length === 0) {
    return (
      <FriendsEmpty
        icon={EMPTY_ICONS[filter]}
        title={t(`empty.${filter}.title`)}
        text={t(`empty.${filter}.text`)}
        action={
          filter === 'accepted' && onFindPeople ? (
            <Button size="lg" onClick={onFindPeople}>
              <Search />
              {t('empty.accepted.action')}
            </Button>
          ) : undefined
        }
      />
    );
  }

  return (
    <div className={cn('transition-opacity', list.loading && 'opacity-60')}>
      <ul className="divide-y divide-border/50">
        <AnimatePresence initial={false}>
          {list.items.map((item, index) => (
            <FriendsListItem
              key={item.relation.relationId}
              item={item}
              filter={filter}
              index={index}
              onOpenProfile={onOpenProfile}
            />
          ))}
        </AnimatePresence>
      </ul>
      {hasMore && <div ref={sentinel} aria-hidden className="h-px" />}
      <LoadMoreFooter
        loadingMore={loadingMore}
        error={list.error}
        onRetry={() => void loadMore()}
      />
    </div>
  );
};
