import { cn } from '@ui/lib/utils';
import { Skeleton } from '@ui/shad-cn/components/skeleton.tsx';
import { Check, X } from 'lucide-react';
import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { useDevTickets } from '../hooks';
import type { ITicket, TicketFilter } from '../types';
import { formatShortDate } from '../utils';
import { TicketStatusBadge, TicketTypeBadge } from './TicketBadges';
import { TicketHtml } from './TicketHtml';
import { TicketReviewDrawer, type TicketReviewMode } from './TicketReviewDrawer';

const FILTERS: TicketFilter[] = ['pending', 'accepted', 'rejected', 'all'];

export interface IDevTicketsViewProps {
  /** Tab bar of the dev area (rendered in the sticky header). */
  tabs?: React.ReactNode;
  /** Pending count for the tab badge. */
  onPendingChange?: (count: number) => void;
}

/** Devs: user tickets – accept (creates a todo) or reject with a reason. */
export const DevTicketsView: React.FC<IDevTicketsViewProps> = ({ tabs, onPendingChange }) => {
  const { t, i18n } = useTranslation('dev');
  const { tickets, pending, loading, loaded, saving, error, load, accept, reject } =
    useDevTickets();
  const [filter, setFilter] = useState<TicketFilter>('pending');
  const [review, setReview] = useState<{ ticket: ITicket; mode: TicketReviewMode } | null>(null);

  useEffect(() => {
    void load();
  }, [load]);
  useEffect(() => {
    if (loaded) onPendingChange?.(pending);
  }, [loaded, pending, onPendingChange]);

  const visible = useMemo(
    () => (filter === 'all' ? tickets : tickets.filter(ticket => ticket.status === filter)),
    [tickets, filter]
  );
  const count = (f: TicketFilter) =>
    f === 'all' ? tickets.length : tickets.filter(ticket => ticket.status === f).length;

  let body: React.ReactNode;
  if (loading && !loaded) {
    body = (
      <div className="space-y-3 px-4 py-4" aria-busy="true">
        {[0, 1, 2].map(i => (
          <Skeleton key={i} className="h-28 w-full rounded-2xl" />
        ))}
      </div>
    );
  } else if (error && tickets.length === 0) {
    body = (
      <div role="alert" className="px-8 py-16 text-center">
        <p className="text-body text-muted-foreground">{t('ticket.error')}</p>
        <button
          type="button"
          onClick={() => void load()}
          className="mt-4 h-9 rounded-full bg-foreground px-4 text-sm font-bold text-background"
        >
          {t('retry')}
        </button>
      </div>
    );
  } else if (visible.length === 0) {
    body = (
      <p className="px-8 py-16 text-center text-title font-bold">{t(`review.empty.${filter}`)}</p>
    );
  } else {
    body = (
      <ul className="space-y-2 px-4 py-4">
        {visible.map(ticket => (
          <li key={ticket.id} className="rounded-2xl border border-border/60 p-3.5">
            <div className="flex items-center gap-2">
              {ticket.author?.avatarUrl ? (
                <img
                  src={ticket.author.avatarUrl}
                  alt=""
                  className="size-6 shrink-0 rounded-full object-cover"
                />
              ) : (
                <span className="grid size-6 shrink-0 place-items-center rounded-full bg-foreground/[0.08] text-micro font-bold">
                  {(ticket.author?.alias ?? '?').charAt(0).toUpperCase()}
                </span>
              )}
              <span className="min-w-0 flex-1 truncate text-caption font-semibold">
                {ticket.author?.alias ?? t('review.unknownUser')}
              </span>
              <span className="text-micro text-muted-foreground">
                {formatShortDate(ticket.createdAt, i18n.resolvedLanguage)}
              </span>
            </div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              <TicketTypeBadge type={ticket.type} />
              <TicketStatusBadge status={ticket.status} />
            </div>
            <p className="mt-2 text-body leading-5 font-semibold break-words">{ticket.title}</p>
            {ticket.description && (
              <TicketHtml
                html={ticket.description}
                className="mt-1 text-caption text-muted-foreground"
              />
            )}
            {ticket.reviewNote && (
              <p className="mt-2 rounded-xl bg-foreground/[0.04] px-3 py-2 text-caption break-words whitespace-pre-line">
                {ticket.reviewNote}
              </p>
            )}
            {ticket.status === 'pending' && (
              <div className="mt-3 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setReview({ ticket, mode: 'reject' })}
                  className="inline-flex h-10 items-center justify-center gap-1.5 rounded-full border border-destructive/40 text-sm font-bold text-destructive transition-colors hover:bg-destructive/10"
                >
                  <X className="size-4" aria-hidden="true" />
                  {t('review.reject')}
                </button>
                <button
                  type="button"
                  onClick={() => setReview({ ticket, mode: 'accept' })}
                  className="inline-flex h-10 items-center justify-center gap-1.5 rounded-full bg-foreground text-sm font-bold text-background transition-opacity hover:opacity-85"
                >
                  <Check className="size-4" aria-hidden="true" />
                  {t('review.accept')}
                </button>
              </div>
            )}
          </li>
        ))}
      </ul>
    );
  }

  return (
    <div className="mx-auto flex min-h-dvh w-full flex-col bg-background">
      <header className="sticky top-0 z-20 border-b border-border/50 bg-background/85 backdrop-blur-md">
        {tabs}
        <div
          role="tablist"
          aria-label={t('filter.label')}
          className="flex gap-1 overflow-x-auto px-3 py-2 [scrollbar-width:none]"
        >
          {FILTERS.map(f => (
            <button
              key={f}
              type="button"
              role="tab"
              aria-selected={filter === f}
              onClick={() => setFilter(f)}
              className={cn(
                'inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full px-3 text-sm font-semibold transition-colors',
                filter === f
                  ? 'bg-foreground text-background'
                  : 'bg-foreground/[0.06] text-muted-foreground hover:text-foreground'
              )}
            >
              {t(`review.filter.${f}`)}
              {loaded && <span className="tabular-nums opacity-70">{count(f)}</span>}
            </button>
          ))}
        </div>
      </header>

      <div className="flex-1 pb-[max(2rem,env(safe-area-inset-bottom))]">{body}</div>

      <TicketReviewDrawer
        review={review}
        onClose={() => setReview(null)}
        saving={saving}
        onAccept={async (ticket, note, isPublic) => {
          const ok = await accept(ticket.id, note, isPublic);
          if (ok) toast.success(t('review.accepted'));
          else toast.error(t('error.save'));
          return ok;
        }}
        onReject={async (ticket, note) => {
          const ok = await reject(ticket.id, note);
          if (ok) toast.success(t('review.rejected'));
          else toast.error(t('error.save'));
          return ok;
        }}
      />
    </div>
  );
};
