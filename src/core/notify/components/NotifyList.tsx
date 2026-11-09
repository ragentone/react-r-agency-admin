import { useLoadMoreSentinel } from '@core/friends/hooks/use.load.more.sentinel';
import { Button } from '@ui/shad-cn/components/button';
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@ui/shad-cn/components/empty';
import { Skeleton } from '@ui/shad-cn/components/skeleton.tsx';
import { Spinner } from '@ui/shad-cn/components/spinner.tsx';
import { AnimatePresence } from 'framer-motion';
import { BellOff, CheckCheck, CloudOff, RefreshCw } from 'lucide-react';
import React, { useCallback, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { useNotifyActivityStore } from '../activity';
import { useNotifyStore } from '../store';
import type { INotifyAction, INotifyItem, NotifyFilter } from '../types';
import { NotifyItem } from './NotifyItem';

export const NotifyListSkeleton = ({ count = 6 }: { count?: number }) => (
  <ul aria-hidden className="divide-y divide-border/50">
    {Array.from({ length: count }).map((_, i) => (
      <li key={i} className="flex gap-3 px-4 py-3">
        <Skeleton className="size-10 shrink-0 rounded-full" />
        <div className="flex-1 space-y-2 pt-1">
          <Skeleton className="h-4 rounded-full" style={{ width: `${45 + ((i * 17) % 35)}%` }} />
          <Skeleton className="h-3.5 rounded-full" style={{ width: `${60 + ((i * 11) % 30)}%` }} />
          <Skeleton className="h-3 w-12 rounded-full" />
        </div>
      </li>
    ))}
  </ul>
);

export interface INotifyListProps {
  filter: NotifyFilter;
  onOpen: (item: INotifyItem) => void;
  onOpenProfile: (userId: string) => void;
  onAction: (item: INotifyItem, action: INotifyAction) => void;
  onDelete: (item: INotifyItem) => void;
}

/** Paged list of one tab: skeleton → items (infinite scroll) / empty state / error. */
export const NotifyList: React.FC<INotifyListProps> = ({
  filter,
  onOpen,
  onOpenProfile,
  onAction,
  onDelete,
}) => {
  const { t } = useTranslation('notify');
  const list = useNotifyStore(state => state.lists[filter]);
  const hidden = useNotifyStore(state => state.hidden);
  const busy = useNotifyStore(state => state.busy);
  const { load, loadMore, markSeen } = useNotifyStore.getState();
  /** Live activities above the list → no "nothing here" empty state below them. */
  const hasActivities = useNotifyActivityStore(state => state.items.length > 0);

  // Fresh first page whenever the tab is shown (live events keep it current afterwards).
  useEffect(() => {
    void load(filter);
  }, [filter, load]);

  const items = useMemo(() => list.items.filter(item => !hidden[item.id]), [list.items, hidden]);
  const more = useCallback(() => loadMore(filter), [filter, loadMore]);
  const sentinel = useLoadMoreSentinel(list.loaded && list.hasMore && !list.error, more);
  const onSeen = useCallback((item: INotifyItem) => void markSeen(item.id), [markSeen]);

  if (!list.loaded) return <NotifyListSkeleton />;

  if (list.error && items.length === 0) {
    return (
      <Empty role="alert" className="px-8 py-14">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <CloudOff aria-hidden="true" />
          </EmptyMedia>
          <EmptyTitle>{t('errors.loadTitle')}</EmptyTitle>
          <EmptyDescription>{t('errors.loadText')}</EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button size="lg" onClick={() => void load(filter)}>
            <RefreshCw className="size-4" />
            {t('actions.retry')}
          </Button>
        </EmptyContent>
      </Empty>
    );
  }

  if (items.length === 0) {
    if (hasActivities) return null;
    const Icon = filter === 'unread' ? CheckCheck : BellOff;
    return (
      <Empty className="px-8 py-14">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Icon aria-hidden="true" />
          </EmptyMedia>
          <EmptyTitle>{t(`empty.${filter}.title`)}</EmptyTitle>
          <EmptyDescription>{t(`empty.${filter}.text`)}</EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <>
      <ul aria-busy={list.loading}>
        <AnimatePresence initial={false}>
          {items.map((item, index) => (
            <NotifyItem
              key={item.id}
              item={item}
              index={index}
              busy={busy[item.id]}
              onOpen={onOpen}
              onOpenProfile={onOpenProfile}
              onAction={onAction}
              onSeen={onSeen}
              onDelete={onDelete}
            />
          ))}
        </AnimatePresence>
      </ul>
      <div ref={sentinel} aria-hidden className="h-px" />
      {list.loadingMore && (
        <div className="flex justify-center py-5 text-muted-foreground">
          <Spinner className="size-5" />
        </div>
      )}
      {list.error && !list.loadingMore && (
        <div className="flex justify-center py-3">
          <Button variant="ghost" size="lg" onClick={() => void more()}>
            <RefreshCw className="size-4" />
            {t('actions.retry')}
          </Button>
        </div>
      )}
      {!list.hasMore && items.length > 4 && (
        <p className="py-6 text-center text-caption text-muted-foreground">{t('end')}</p>
      )}
    </>
  );
};
