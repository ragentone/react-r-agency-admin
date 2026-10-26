import { cn } from '@ui/lib/utils';
import { Skeleton } from '@ui/shad-cn/components/skeleton.tsx';
import { Plus, ShieldAlert } from 'lucide-react';
import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { useDevAccess, useDevTodos } from '../hooks';
import type { DevTodoFilter, IDevTodo } from '../types';
import { DevTodoFormDrawer } from './DevTodoFormDrawer';
import { DevTodoItem } from './DevTodoItem';

const FILTERS: DevTodoFilter[] = ['active', 'in_progress', 'done', 'all'];

const matches = (todo: IDevTodo, filter: DevTodoFilter) =>
  filter === 'all' ? true : filter === 'active' ? todo.status !== 'done' : todo.status === filter;

export interface IDevTodosViewProps {
  /** Title + tab bar of the dev area (rendered in the sticky header). */
  tabs?: React.ReactNode;
}

/** Dev area: todo list with filters, create / edit / delete in a drawer. */
export const DevTodosView: React.FC<IDevTodosViewProps> = ({ tabs }) => {
  const { t } = useTranslation('dev');
  const access = useDevAccess();
  const { todos, loading, loaded, saving, error, load, create, update, remove } = useDevTodos();
  const [filter, setFilter] = useState<DevTodoFilter>('active');
  const [editing, setEditing] = useState<IDevTodo | null>(null);
  const [formOpen, setFormOpen] = useState(false);

  useEffect(() => {
    if (access) void load();
  }, [access, load]);

  const counts = useMemo(
    () =>
      Object.fromEntries(
        FILTERS.map(f => [f, todos.filter(todo => matches(todo, f)).length])
      ) as Record<DevTodoFilter, number>,
    [todos]
  );
  const visible = useMemo(() => todos.filter(todo => matches(todo, filter)), [todos, filter]);

  const openForm = (todo: IDevTodo | null) => {
    setEditing(todo);
    setFormOpen(true);
  };

  const toggleDone = async (todo: IDevTodo) => {
    const result = await update(todo.id, { status: todo.status === 'done' ? 'open' : 'done' });
    if (!result) toast.error(t('error.save'));
  };

  let body: React.ReactNode;
  if (!access) {
    body = (
      <div className="mx-auto flex max-w-sm flex-col items-center px-8 py-16 text-center">
        <span className="grid size-12 place-items-center rounded-full bg-foreground/[0.07]">
          <ShieldAlert className="size-5" aria-hidden="true" />
        </span>
        <h2 className="mt-4 text-title font-bold">{t('noAccess.title')}</h2>
        <p className="mt-1 text-body text-muted-foreground">{t('noAccess.description')}</p>
      </div>
    );
  } else if (loading && !loaded) {
    body = (
      <div className="space-y-4 px-4 py-4" aria-busy="true">
        {[0, 1, 2, 3].map(i => (
          <div key={i} className="flex gap-3">
            <Skeleton className="size-6 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-3/4 rounded-full" />
              <Skeleton className="h-3 w-1/2 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    );
  } else if (error && todos.length === 0) {
    body = (
      <div role="alert" className="px-8 py-16 text-center">
        <p className="text-body text-muted-foreground">{t('error.load')}</p>
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
      <div className="mx-auto max-w-sm px-8 py-16 text-center">
        <h2 className="text-title font-bold">{t(`empty.${filter}`)}</h2>
        {filter !== 'done' && (
          <button
            type="button"
            onClick={() => openForm(null)}
            className="mt-4 inline-flex h-10 items-center gap-1.5 rounded-full border border-border/60 px-4 text-sm font-bold transition-colors hover:bg-foreground/[0.06]"
          >
            <Plus className="size-4" aria-hidden="true" />
            {t('new')}
          </button>
        )}
      </div>
    );
  } else {
    body = (
      <ul className="divide-y divide-border/50">
        {visible.map(todo => (
          <DevTodoItem
            key={todo.id}
            todo={todo}
            onOpen={openForm}
            onToggleDone={item => void toggleDone(item)}
          />
        ))}
      </ul>
    );
  }

  return (
    <div data-slot="dev-todos" className="mx-auto flex min-h-dvh w-full flex-col bg-background">
      <header className="sticky top-0 z-20 border-b border-border/50 bg-background/85 backdrop-blur-md">
        {tabs}
        {access && (
          <div
            role="tablist"
            aria-label={t('filter.label')}
            className="flex items-center gap-1 overflow-x-auto px-3 py-2 [scrollbar-width:none]"
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
                {t(`filter.${f}`)}
                {loaded && <span className="tabular-nums opacity-70">{counts[f]}</span>}
              </button>
            ))}
            <button
              type="button"
              onClick={() => openForm(null)}
              className="ml-auto inline-flex h-8 shrink-0 items-center gap-1 rounded-full bg-foreground px-3 text-sm font-bold text-background transition-opacity hover:opacity-85"
            >
              <Plus className="size-4" aria-hidden="true" />
              {t('new')}
            </button>
          </div>
        )}
      </header>

      <div className="flex-1 pb-[max(2rem,env(safe-area-inset-bottom))]">{body}</div>

      {access && (
        <DevTodoFormDrawer
          open={formOpen}
          onOpenChange={setFormOpen}
          todo={editing}
          saving={saving}
          onSubmit={async values => {
            const result = editing ? await update(editing.id, values) : await create(values);
            if (!result) toast.error(t('error.save'));
            return Boolean(result);
          }}
          onDelete={async id => {
            const ok = await remove(id);
            if (!ok) toast.error(t('error.delete'));
            return ok;
          }}
        />
      )}
    </div>
  );
};
