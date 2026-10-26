import { cn } from '@ui/lib/utils';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useDevAccess, useDevTickets } from '../hooks';
import { DevTicketsView } from './DevTicketsView';
import { DevTodosView } from './DevTodosView';

type Tab = 'todos' | 'tickets';

/** `/developer`: title + tabs "Todos | Tickets" (pending count). */
export const DevArea: React.FC = () => {
  const { t } = useTranslation('dev');
  const [tab, setTab] = useState<Tab>('todos');
  const access = useDevAccess();
  // Pending count for the tab badge right away (the tickets tab keeps it up to date).
  const initial = useDevTickets();
  const { load: loadInitial } = initial;
  useEffect(() => {
    if (access) void loadInitial();
  }, [access, loadInitial]);
  const [pendingOverride, setPending] = useState<number | null>(null);
  const pending = pendingOverride ?? initial.pending;

  const tabs = (
    <>
      <div className="px-4 pt-3">
        <h1 className="truncate text-xl font-bold tracking-tight text-foreground">{t('title')}</h1>
      </div>
      <div role="tablist" className="grid grid-cols-2 px-2">
        {(['todos', 'tickets'] as const).map(value => (
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
            {t(`tabs.${value}`)}
            {value === 'tickets' && pending > 0 && (
              <span className="ml-1.5 rounded-full bg-foreground px-1.5 text-micro text-background tabular-nums">
                {pending}
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
    </>
  );

  // No access → the todo view shows the "no access" message (no tabs).
  if (!access) return <DevTodosView />;

  return tab === 'todos' ? (
    <DevTodosView tabs={tabs} />
  ) : (
    <DevTicketsView tabs={tabs} onPendingChange={setPending} />
  );
};
