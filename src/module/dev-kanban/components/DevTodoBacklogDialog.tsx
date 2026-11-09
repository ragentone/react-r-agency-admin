import { AppDialog } from '@ui/components/app-dialog';
import { Empty, EmptyDescription, EmptyHeader } from '@ui/shad-cn/components/empty';
import { ChevronsDown, ChevronsUp, Equal } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import type { DevTodoPriority, IDevTodo } from '../types';

const PRIORITY_ICONS = { high: ChevronsUp, normal: Equal, low: ChevronsDown } as const;

export interface IDevTodoBacklogDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Todos with status `backlog`. */
  items: IDevTodo[];
  onOpenItem: (todo: IDevTodo) => void;
}

const keyOf = (todo: IDevTodo) => `DEV-${todo.id.slice(0, 6).toUpperCase()}`;

/** Backlog in the app dialog. A card opens the details; new items are created in the form. */
export const DevTodoBacklogDialog = ({
  open,
  onOpenChange,
  items,
  onOpenItem,
}: IDevTodoBacklogDialogProps) => {
  const { t } = useTranslation('dev-kanban');

  return (
    <AppDialog
      open={open}
      onOpenChange={onOpenChange}
      size="lg"
      title={
        <span className="flex items-center gap-2">
          {t('backlog.title')}
          <span className="rounded-full bg-muted px-2 py-0.5 text-caption tabular-nums text-muted-foreground">
            {items.length}
          </span>
        </span>
      }
      bodyClassName="gap-3 px-4 py-4"
    >
      {items.length === 0 ? (
        <Empty className="border border-dashed border-border/50 py-12">
          <EmptyHeader>
            <EmptyDescription>{t('backlog.empty')}</EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <ul className="flex flex-col gap-3">
          {items.map(todo => {
            const Icon = PRIORITY_ICONS[todo.priority as DevTodoPriority];
            return (
              <li key={todo.id}>
                <button
                  type="button"
                  onClick={() => onOpenItem(todo)}
                  className="flex w-full flex-col gap-2 rounded-lg border border-border/50 bg-background p-4 text-left shadow-sm transition-colors hover:bg-accent/50 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                >
                  <span className="text-micro font-semibold tracking-wide text-muted-foreground uppercase">
                    {keyOf(todo)}
                  </span>
                  <span className="text-body font-semibold break-words">{todo.title}</span>
                  {todo.summary && (
                    <span className="line-clamp-2 text-caption whitespace-pre-line text-muted-foreground">
                      {todo.summary}
                    </span>
                  )}
                  <span
                    className={
                      todo.priority === 'high'
                        ? 'flex items-center gap-1 text-micro font-semibold text-destructive'
                        : 'flex items-center gap-1 text-micro font-semibold text-muted-foreground'
                    }
                  >
                    <Icon className="size-3.5" aria-hidden />
                    {t(`priority.${todo.priority}`)}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </AppDialog>
  );
};
