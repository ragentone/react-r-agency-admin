import { Kanban, type KanbanColumnDef } from '@module/dev-kanban/components/kanban';
import { Button } from '@ui/shad-cn/components/button';
import { Skeleton } from '@ui/shad-cn/components/skeleton';
import { ChevronsDown, ChevronsUp, Equal } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { DevTodoBacklogDialog } from '../components/DevTodoBacklogDialog';
import { DevTodoDetail } from '../components/DevTodoDetail';
import { DevTodoFormDialog } from '../components/DevTodoFormDialog';
import { useDevTodos } from '../hooks/use-dev-todos';
import {
  canDevTodoTransition,
  DEV_TODO_STATUSES,
  type DevTodoPriority,
  type DevTodoStatus,
  type IDevTodo,
  type IDevTodoValues,
} from '../types';

const PRIORITY_ICONS = { high: ChevronsUp, normal: Equal, low: ChevronsDown } as const;

const PriorityIcon = ({ priority }: { priority: DevTodoPriority }) => {
  const Icon = PRIORITY_ICONS[priority];
  return <Icon className="size-3.5" aria-hidden />;
};

/** Board: one column per status. The backlog lives in its own drawer, not on the board. */
export const TodoList = () => {
  const { t } = useTranslation('dev-kanban');
  const { todos, loaded, loading, saving, error, load, create, update, remove, setStatus } =
    useDevTodos();
  const [formOpen, setFormOpen] = useState(false);
  const [formKey, setFormKey] = useState(0);
  const [viewingId, setViewingId] = useState<string | null>(null);
  const [backlogOpen, setBacklogOpen] = useState(false);
  // Always the current state of the todo, so the detail reflects every change.
  const viewing = viewingId ? (todos.find(todo => todo.id === viewingId) ?? null) : null;
  const backlog = useMemo(() => todos.filter(todo => todo.status === 'backlog'), [todos]);
  const boardItems = useMemo(() => todos.filter(todo => todo.status !== 'backlog'), [todos]);

  useEffect(() => {
    void load();
  }, [load]);

  const columns = useMemo<KanbanColumnDef[]>(
    () =>
      DEV_TODO_STATUSES.filter(id => id !== 'backlog').map(id => ({
        id,
        label: t(`columns.${id}`),
      })),
    [t]
  );

  const labels = useMemo(
    () => ({ empty: t('empty'), moreActions: t('moreActions'), moveTo: t('moveTo') }),
    [t]
  );

  const canMove = (todo: IDevTodo, columnId: string) =>
    canDevTodoTransition(todo.status, columnId as DevTodoStatus);

  const move = async (todo: IDevTodo, columnId: string) => {
    if (!canMove(todo, columnId)) {
      toast.error(t('toast.transitionInvalid'));
      return;
    }
    const result = await setStatus(todo.id, columnId as DevTodoStatus);
    if (result) toast.success(t('toast.moved'));
    else toast.error(t('toast.error'));
  };

  const save = async (values: IDevTodoValues) => {
    const result = await create(values);
    if (result) {
      toast.success(t('toast.created'));
      return true;
    }
    toast.error(t('toast.error'));
    return false;
  };

  const changeFromDetail = async (todo: IDevTodo, values: Partial<IDevTodoValues>) => {
    const result = await update(todo.id, values);
    if (result) toast.success(t('toast.updated'));
    else toast.error(t('toast.error'));
    return result !== null;
  };

  const deleteTodo = async (todo: IDevTodo) => {
    const result = await remove(todo.id);
    if (result) toast.success(t('toast.deleted'));
    else toast.error(t('toast.error'));
    return result;
  };

  const openForm = () => {
    setFormKey(key => key + 1);
    setFormOpen(true);
  };

  const openFromBacklog = (todo: IDevTodo) => {
    setBacklogOpen(false);
    setViewingId(todo.id);
  };

  return (
    <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-4 px-4 py-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-title font-bold">{t('title')}</h1>
          <p className="text-caption text-muted-foreground">{t('subtitle')}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setBacklogOpen(true)}>
            {t('backlog.title')}
            <span className="text-muted-foreground tabular-nums">{backlog.length}</span>
          </Button>
          <Button onClick={openForm}>{t('new')}</Button>
        </div>
      </header>

      {!loaded || (loading && todos.length === 0) ? (
        <div className="grid gap-4 md:grid-cols-3">
          {[0, 1, 2].map(index => (
            <Skeleton key={index} className="h-40 w-full rounded-lg" />
          ))}
        </div>
      ) : error ? (
        <div className="flex flex-col items-start gap-3 py-8">
          <p className="text-body text-muted-foreground">{t('error.load')}</p>
          <Button variant="outline" onClick={() => void load()}>
            {t('retry')}
          </Button>
        </div>
      ) : (
        <Kanban
          columns={columns}
          items={boardItems}
          getId={todo => todo.id}
          getColumnId={todo => todo.status}
          labels={labels}
          onMove={move}
          canMove={canMove}
          renderCard={todo => (
            <button
              type="button"
              onClick={() => setViewingId(todo.id)}
              className="block w-full min-w-0 text-left"
            >
              <span className="block truncate text-body font-semibold">{todo.title}</span>
              {todo.summary && (
                <span className="mt-0.5 line-clamp-2 block text-caption whitespace-pre-line text-muted-foreground">
                  {todo.summary}
                </span>
              )}
              <span
                className={
                  todo.priority === 'high'
                    ? 'mt-2 flex items-center gap-1 text-micro font-semibold text-destructive'
                    : 'mt-2 flex items-center gap-1 text-micro font-semibold text-muted-foreground'
                }
              >
                <PriorityIcon priority={todo.priority} />
                {t(`priority.${todo.priority}`)}
              </span>
            </button>
          )}
        />
      )}

      <DevTodoBacklogDialog
        open={backlogOpen}
        onOpenChange={setBacklogOpen}
        items={backlog}
        onOpenItem={openFromBacklog}
      />

      <DevTodoDetail
        open={viewing !== null}
        onOpenChange={open => {
          if (!open) setViewingId(null);
        }}
        todo={viewing}
        busy={saving}
        onUpdate={changeFromDetail}
        onDelete={deleteTodo}
      />

      <DevTodoFormDialog
        key={formKey}
        open={formOpen}
        onOpenChange={setFormOpen}
        todo={null}
        busy={saving}
        onSave={save}
      />
    </div>
  );
};
