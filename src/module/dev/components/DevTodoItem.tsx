import { cn } from '@ui/lib/utils';
import { Check, CircleDashed } from 'lucide-react';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import type { IDevTodo } from '../types';
import { htmlToText } from '../utils';

export interface IDevTodoItemProps {
  todo: IDevTodo;
  onOpen: (todo: IDevTodo) => void;
  onToggleDone: (todo: IDevTodo) => void;
}

/** One todo: status circle (tap = done / reopen), title, description preview, badges. */
export const DevTodoItem: React.FC<IDevTodoItemProps> = ({ todo, onOpen, onToggleDone }) => {
  const { t, i18n } = useTranslation('dev');
  const done = todo.status === 'done';
  // Description is HTML (editor) – the list shows plain text only.
  const preview = useMemo(() => htmlToText(todo.description), [todo.description]);
  const inProgress = todo.status === 'in_progress';
  const date = new Date(done && todo.doneAt ? todo.doneAt : todo.createdAt);
  const dateText = Number.isNaN(date.getTime())
    ? ''
    : new Intl.DateTimeFormat(i18n.resolvedLanguage, { day: '2-digit', month: 'short' }).format(
        date
      );

  return (
    <li className="flex items-start gap-3 px-4 py-3.5">
      <button
        type="button"
        role="checkbox"
        aria-checked={done}
        aria-label={
          done ? t('item.reopen', { title: todo.title }) : t('item.done', { title: todo.title })
        }
        onClick={() => onToggleDone(todo)}
        className={cn(
          'mt-0.5 grid size-6 shrink-0 place-items-center rounded-full border-2 transition-colors',
          done
            ? 'border-foreground bg-foreground text-background'
            : inProgress
              ? 'border-foreground/70 text-foreground/70 hover:bg-foreground/[0.06]'
              : 'border-foreground/30 hover:border-foreground/60'
        )}
      >
        {done ? (
          <Check className="size-3.5" strokeWidth={3} />
        ) : inProgress ? (
          <CircleDashed className="size-3.5" strokeWidth={2.5} />
        ) : null}
      </button>

      <button type="button" onClick={() => onOpen(todo)} className="min-w-0 flex-1 text-left">
        <span
          className={cn(
            'block text-body leading-5 font-semibold break-words',
            done ? 'text-muted-foreground line-through' : 'text-foreground'
          )}
        >
          {todo.title}
        </span>
        {preview && (
          <span className="mt-0.5 line-clamp-2 block text-caption break-words whitespace-pre-line text-muted-foreground">
            {preview}
          </span>
        )}
        <span className="mt-1.5 flex flex-wrap items-center gap-1.5 text-micro font-semibold">
          {todo.priority !== 'normal' && (
            <span
              className={cn(
                'rounded-full px-2 py-0.5',
                todo.priority === 'high'
                  ? 'bg-destructive/15 text-destructive'
                  : 'bg-foreground/[0.06] text-muted-foreground'
              )}
            >
              {t(`priority.${todo.priority}`)}
            </span>
          )}
          {todo.ticketId && (
            <span className="rounded-full bg-foreground/[0.06] px-2 py-0.5 text-foreground">
              {t('item.fromTicket')}
            </span>
          )}
          {todo.public === false && (
            <span className="rounded-full border border-dashed border-border px-2 py-0.5 text-muted-foreground">
              {t('item.internal')}
            </span>
          )}
          {inProgress && (
            <span className="rounded-full bg-foreground px-2 py-0.5 text-background">
              {t('status.in_progress')}
            </span>
          )}
          {dateText && (
            <span className="font-medium text-muted-foreground">
              {done ? t('item.doneAt', { date: dateText }) : dateText}
            </span>
          )}
        </span>
      </button>
    </li>
  );
};
