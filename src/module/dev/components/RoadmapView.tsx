import { useAuthStore } from '@core/auth/auth.store.tsx';
import { CoreVariables } from '@core/core.variables.ts';
import { Link } from '@tanstack/react-router';
import { cn } from '@ui/lib/utils';
import { Skeleton } from '@ui/shad-cn/components/skeleton.tsx';
import { CheckCircle2, CircleDashed, Hammer, LogIn, MessageSquarePlus, Users } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { TICKET_MAX_PENDING } from '../const';
import { useMyTickets, useRoadmap } from '../hooks';
import type { IRoadmapItem, ITicket } from '../types';
import { formatShortDate } from '../utils';
import { TicketStatusBadge, TicketTypeBadge } from './TicketBadges';
import { TicketFormDrawer } from './TicketFormDrawer';
import { TicketHtml } from './TicketHtml';

type Tab = 'roadmap' | 'tickets';

const SECTIONS = [
  { status: 'in_progress', icon: Hammer },
  { status: 'open', icon: CircleDashed },
  { status: 'done', icon: CheckCircle2 },
] as const;

const ListSkeleton = () => (
  <div className="space-y-3 px-4 py-4" aria-busy="true">
    {[0, 1, 2].map(i => (
      <Skeleton key={i} className="h-20 w-full rounded-2xl" />
    ))}
  </div>
);

const RoadmapCard: React.FC<{ item: IRoadmapItem }> = ({ item }) => {
  const { t, i18n } = useTranslation('dev');
  const done = item.status === 'done';
  return (
    <li className="rounded-2xl border border-border/60 p-3.5">
      <p
        className={cn(
          'text-body leading-5 font-semibold break-words',
          done ? 'text-muted-foreground' : 'text-foreground'
        )}
      >
        {item.title}
      </p>
      {item.description && (
        <p className="mt-1 line-clamp-3 text-caption break-words whitespace-pre-line text-muted-foreground">
          {item.description}
        </p>
      )}
      <div className="mt-2 flex flex-wrap items-center gap-1.5 text-micro font-semibold">
        {item.priority === 'high' && !done && (
          <span className="rounded-full bg-destructive/15 px-2 py-0.5 text-destructive">
            {t('roadmap.important')}
          </span>
        )}
        {item.fromTicket && (
          <span className="inline-flex items-center gap-1 rounded-full bg-foreground/[0.06] px-2 py-0.5 text-foreground">
            <Users className="size-3" aria-hidden="true" />
            {t('roadmap.fromCommunity')}
          </span>
        )}
        {done && item.doneAt && (
          <span className="font-medium text-muted-foreground">
            {t('item.doneAt', { date: formatShortDate(item.doneAt, i18n.resolvedLanguage) })}
          </span>
        )}
      </div>
    </li>
  );
};

const TicketCard: React.FC<{ ticket: ITicket }> = ({ ticket }) => {
  const { t, i18n } = useTranslation('dev');
  return (
    <li className="rounded-2xl border border-border/60 p-3.5">
      <div className="flex flex-wrap items-center gap-1.5">
        <TicketTypeBadge type={ticket.type} />
        <TicketStatusBadge status={ticket.status} />
        <span className="ml-auto text-micro text-muted-foreground">
          {formatShortDate(ticket.createdAt, i18n.resolvedLanguage)}
        </span>
      </div>
      <p className="mt-2 text-body leading-5 font-semibold break-words text-foreground">
        {ticket.title}
      </p>
      {ticket.description && (
        <TicketHtml
          html={ticket.description}
          className="mt-1 line-clamp-4 text-caption text-muted-foreground"
        />
      )}
      {ticket.reviewNote && (
        <div className="mt-2.5 rounded-xl bg-foreground/[0.04] px-3 py-2">
          <p className="text-micro font-semibold text-muted-foreground">{t('ticket.answer')}</p>
          <p className="mt-0.5 text-caption break-words whitespace-pre-line text-foreground">
            {ticket.reviewNote}
          </p>
        </div>
      )}
    </li>
  );
};

/**
 * Public development page: roadmap (in progress / planned / recently done) for everyone,
 * own tickets + "new ticket" for signed-in users.
 */
export const RoadmapView: React.FC = () => {
  const { t } = useTranslation('dev');
  const authorized = useAuthStore(state => state.authorized);
  const roadmap = useRoadmap();
  const mine = useMyTickets();
  const [tab, setTab] = useState<Tab>('roadmap');
  const [formOpen, setFormOpen] = useState(false);
  const { load: loadRoadmap } = roadmap;
  const { load: loadMine } = mine;

  useEffect(() => {
    void loadRoadmap();
  }, [loadRoadmap]);
  useEffect(() => {
    if (authorized && tab === 'tickets') void loadMine();
  }, [authorized, tab, loadMine]);

  const limitReached = mine.pending >= TICKET_MAX_PENDING;

  const openForm = () => {
    if (limitReached) {
      toast.error(t('ticket.limit', { max: TICKET_MAX_PENDING }));
      return;
    }
    setFormOpen(true);
  };

  const roadmapBody =
    roadmap.loading && !roadmap.loaded ? (
      <ListSkeleton />
    ) : roadmap.error && roadmap.items.length === 0 ? (
      <p role="alert" className="px-8 py-16 text-center text-body text-muted-foreground">
        {t('roadmap.error')}
      </p>
    ) : (
      <div className="space-y-6 px-4 py-4">
        {SECTIONS.map(({ status, icon: Icon }) => {
          const items = roadmap.items.filter(item => item.status === status);
          return (
            <section key={status} aria-labelledby={`roadmap-${status}`}>
              <h2
                id={`roadmap-${status}`}
                className="mb-2 flex items-center gap-2 text-title font-extrabold tracking-tight"
              >
                <Icon className="size-4.5" aria-hidden="true" />
                {t(`roadmap.sections.${status}`)}
                <span className="text-caption font-semibold text-muted-foreground tabular-nums">
                  {items.length}
                </span>
              </h2>
              {items.length === 0 ? (
                <p className="rounded-2xl border border-dashed border-border/60 px-3.5 py-4 text-caption text-muted-foreground">
                  {t(`roadmap.empty.${status}`)}
                </p>
              ) : (
                <ul className="space-y-2">
                  {items.map(item => (
                    <RoadmapCard key={item.id} item={item} />
                  ))}
                </ul>
              )}
            </section>
          );
        })}
      </div>
    );

  const ticketsBody = !authorized ? (
    <div className="mx-auto flex max-w-sm flex-col items-center px-8 py-14 text-center">
      <span className="grid size-12 place-items-center rounded-full bg-foreground/[0.07]">
        <MessageSquarePlus className="size-5" aria-hidden="true" />
      </span>
      <h2 className="mt-4 text-title font-bold">{t('ticket.guestTitle')}</h2>
      <p className="mt-1 text-body text-muted-foreground">{t('ticket.guestDescription')}</p>
      <Link
        to={CoreVariables.routePathAuth as '/'}
        className="mt-5 inline-flex h-11 items-center gap-2 rounded-full bg-foreground px-5 text-body font-bold text-background transition-opacity hover:opacity-90"
      >
        <LogIn className="size-4" aria-hidden="true" />
        {t('ticket.login')}
      </Link>
    </div>
  ) : mine.loading && !mine.loaded ? (
    <ListSkeleton />
  ) : mine.error && mine.tickets.length === 0 ? (
    <p role="alert" className="px-8 py-16 text-center text-body text-muted-foreground">
      {t('ticket.error')}
    </p>
  ) : mine.tickets.length === 0 ? (
    <div className="mx-auto max-w-sm px-8 py-14 text-center">
      <h2 className="text-title font-bold">{t('ticket.emptyTitle')}</h2>
      <p className="mt-1 text-body text-muted-foreground">{t('ticket.emptyDescription')}</p>
    </div>
  ) : (
    <ul className="space-y-2 px-4 py-4">
      {mine.tickets.map(ticket => (
        <TicketCard key={ticket.id} ticket={ticket} />
      ))}
    </ul>
  );

  return (
    <div data-slot="roadmap" className="mx-auto flex min-h-dvh w-full flex-col bg-background">
      <header className="sticky top-0 z-20 border-b border-border/50 bg-background/85 backdrop-blur-md">
        <div className="flex items-center gap-3 px-4 pt-3 pb-2">
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-xl font-bold tracking-tight text-foreground">
              {t('roadmap.title')}
            </h1>
            <p className="truncate text-caption text-muted-foreground">{t('roadmap.subtitle')}</p>
          </div>
          {authorized && (
            <button
              type="button"
              onClick={openForm}
              className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full bg-foreground px-3.5 text-sm font-bold text-background transition-opacity hover:opacity-85"
            >
              <MessageSquarePlus className="size-4" aria-hidden="true" />
              <span className="hidden sm:inline">{t('ticket.new')}</span>
              <span className="sm:hidden">{t('ticket.newShort')}</span>
            </button>
          )}
        </div>
        <div role="tablist" className="grid grid-cols-2 px-2">
          {(['roadmap', 'tickets'] as const).map(value => (
            <button
              key={value}
              type="button"
              role="tab"
              aria-selected={tab === value}
              onClick={() => setTab(value)}
              className={cn(
                'relative h-11 text-body font-semibold transition-colors',
                tab === value ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {t(`roadmap.tabs.${value}`)}
              {value === 'tickets' && authorized && mine.pending > 0 && (
                <span className="ml-1.5 rounded-full bg-foreground/[0.08] px-1.5 text-micro tabular-nums">
                  {mine.pending}
                </span>
              )}
              {tab === value && (
                <span
                  aria-hidden="true"
                  className="absolute bottom-0 left-1/2 h-1 w-14 -translate-x-1/2 rounded-full bg-foreground"
                />
              )}
            </button>
          ))}
        </div>
      </header>

      <div className="flex-1 pb-[max(2rem,env(safe-area-inset-bottom))]">
        {tab === 'roadmap' ? roadmapBody : ticketsBody}
      </div>

      {authorized && (
        <TicketFormDrawer
          open={formOpen}
          onOpenChange={setFormOpen}
          saving={mine.saving}
          onSubmit={async values => {
            const ticket = await mine.create(values);
            if (!ticket) {
              toast.error(t('ticket.form.error'));
              return false;
            }
            setTab('tickets');
            return true;
          }}
        />
      )}
    </div>
  );
};
