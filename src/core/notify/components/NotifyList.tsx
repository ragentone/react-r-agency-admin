import { useLoadMoreSentinel } from '@core/friends/hooks/use.load.more.sentinel';
import { Skeleton } from '@ui/shad-cn/components/skeleton.tsx';
import { AnimatePresence } from 'framer-motion';
import { BellOff, CheckCheck, Loader2, RefreshCw } from 'lucide-react';
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
      <div className="flex flex-col items-center px-8 py-14 text-center">
        <p className="text-title font-extrabold tracking-tight">{t('errors.loadTitle')}</p>
        <p className="mt-1 max-w-xs text-body text-muted-foreground">{t('errors.loadText')}</p>
        <button
          type="button"
          onClick={() => void load(filter)}
          className="mt-5 inline-flex h-10 items-center gap-2 rounded-full bg-foreground px-5 text-sm font-bold text-background"
        >
          <RefreshCw className="size-4" />
          {t('actions.retry')}
        </button>
      </div>
    );
  }

  if (items.length === 0) {
    if (hasActivities) return null;
    const Icon = filter === 'unread' ? CheckCheck : BellOff;
    return (
      <div className="flex flex-col items-center px-8 py-14 text-center">
        <span className="grid size-14 place-items-center rounded-full bg-foreground/[0.06]">
          <Icon className="size-6" strokeWidth={2} />
        </span>
        <p className="mt-4 text-display leading-8 font-extrabold tracking-tight">
          {t(`empty.${filter}.title`)}
        </p>
        <p className="mt-2 max-w-xs text-body text-muted-foreground">{t(`empty.${filter}.text`)}</p>
      </div>
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
          <Loader2 className="size-5 animate-spin" />
        </div>
      )}
      {list.error && !list.loadingMore && (
        <div className="flex justify-center py-3">
          <button
            type="button"
            onClick={() => void more()}
            className="inline-flex h-10 items-center gap-2 rounded-full px-4 text-caption font-semibold text-muted-foreground hover:bg-foreground/[0.06] hover:text-foreground"
          >
            <RefreshCw className="size-4" />
            {t('actions.retry')}
          </button>
        </div>
      )}
      {!list.hasMore && items.length > 4 && (
        <p className="py-6 text-center text-caption text-muted-foreground">{t('end')}</p>
      )}
    </>
  );
};
