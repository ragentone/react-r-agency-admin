import { LazyHtmlEditor as HtmlEditor } from '@core/editor/html/lazy.html-editor.tsx';
import { AppDialog } from '@module/dev-kanban/components/app-dialog';
import { kanbanMoreTriggerClassName } from '@module/dev-kanban/components/kanban';
import { cn } from '@ui/lib/utils';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@ui/shad-cn/components/alert-dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@ui/shad-cn/components/avatar';
import { Button, buttonVariants } from '@ui/shad-cn/components/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@ui/shad-cn/components/dropdown-menu';
import { Field, FieldError, FieldLabel } from '@ui/shad-cn/components/field';
import { Input } from '@ui/shad-cn/components/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@ui/shad-cn/components/select';
import { Textarea } from '@ui/shad-cn/components/textarea';
import DOMPurify from 'dompurify';
import { ChevronDown, MoreHorizontal, Pencil } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import {
  DEV_TODO_DESCRIPTION_MAX,
  DEV_TODO_PRIORITIES,
  DEV_TODO_SUMMARY_MAX,
  DEV_TODO_TITLE_MAX,
  DEV_TODO_TRANSITIONS,
  type DevTodoPriority,
  type IDevTodo,
  type IDevTodoActor,
  type IDevTodoValues,
} from '../types';

export interface IDevTodoDetailProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  todo: IDevTodo | null;
  busy: boolean;
  onUpdate: (todo: IDevTodo, values: Partial<IDevTodoValues>) => Promise<boolean>;
  onDelete: (todo: IDevTodo) => Promise<boolean>;
}

type IDraft = Pick<IDevTodoValues, 'title' | 'summary' | 'description' | 'priority'>;

const toDraft = (todo: IDevTodo): IDraft => ({
  title: todo.title,
  summary: todo.summary ?? '',
  description: todo.description ?? '',
  priority: todo.priority,
});

const initials = (name: string | null | undefined) =>
  (name ?? '?')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0]?.toUpperCase() ?? '')
    .join('') || '?';

const Field2 = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="flex flex-col gap-1.5">
    <dt className="text-micro font-semibold tracking-wide text-muted-foreground uppercase">
      {label}
    </dt>
    <dd className="text-body text-foreground">{children}</dd>
  </div>
);

/** Avatar with the name, or initials if the user has no avatar. */
const ActorRow = ({ actor, line }: { actor: IDevTodoActor | null | undefined; line: string }) => (
  <span className="flex items-center gap-2">
    <Avatar className="size-7 shrink-0">
      {actor?.avatarUrl && <AvatarImage src={actor.avatarUrl} alt={actor.alias ?? ''} />}
      <AvatarFallback className="text-micro">{initials(actor?.alias)}</AvatarFallback>
    </Avatar>
    <span className="min-w-0 break-words">{line}</span>
  </span>
);

/** Jira-style issue dialog. „Bearbeiten“ turns the fields in place into inputs – no second dialog. */
export const DevTodoDetail = ({
  open,
  onOpenChange,
  todo,
  busy,
  onUpdate,
  onDelete,
}: IDevTodoDetailProps) => {
  const { t, i18n } = useTranslation('dev-kanban');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<IDraft | null>(null);
  const [titleTouched, setTitleTouched] = useState(false);

  const description = todo?.description ?? '';
  const html = useMemo(
    () => (description ? DOMPurify.sanitize(description, { USE_PROFILES: { html: true } }) : ''),
    [description]
  );

  if (!todo) return null;

  const key = `DEV-${todo.id.slice(0, 6).toUpperCase()}`;
  const transitions = DEV_TODO_TRANSITIONS[todo.status];
  const current = editing && draft ? draft : toDraft(todo);
  const titleError = current.title.trim().length === 0 ? t('form.errors.titleRequired') : null;
  const valid = titleError === null && current.summary.length <= DEV_TODO_SUMMARY_MAX;

  const formatDate = (iso: string | null | undefined) => {
    if (!iso) return '–';
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return '–';
    return new Intl.DateTimeFormat(i18n.resolvedLanguage, {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const nameOf = (actor: IDevTodoActor | null | undefined) => actor?.alias ?? t('detail.unknown');
  const actorLine = (actor: IDevTodoActor | null | undefined, iso: string) =>
    actor || iso ? t('detail.by', { name: nameOf(actor), date: formatDate(iso) }) : '–';

  const startEditing = () => {
    setDraft(toDraft(todo));
    setTitleTouched(false);
    setEditing(true);
  };

  const cancelEditing = () => {
    setEditing(false);
    setDraft(null);
  };

  const patch = (values: Partial<IDraft>) =>
    setDraft(prev => ({ ...(prev ?? toDraft(todo)), ...values }));

  const save = async () => {
    setTitleTouched(true);
    if (!valid || busy) return;
    const ok = await onUpdate(todo, {
      title: current.title.trim(),
      summary: current.summary.trim(),
      description: current.description,
      priority: current.priority,
    });
    if (ok) cancelEditing();
  };

  const confirmDelete = async () => {
    const ok = await onDelete(todo);
    setConfirmOpen(false);
    if (ok) onOpenChange(false);
  };

  const close = (next: boolean) => {
    if (!next) cancelEditing();
    onOpenChange(next);
  };

  return (
    <>
      <AppDialog
        open={open}
        onOpenChange={close}
        size="xl"
        description={key}
        title={
          editing ? (
            <Field data-invalid={titleTouched && titleError ? true : undefined}>
              <FieldLabel htmlFor="dev-todo-title" className="sr-only">
                {t('form.title')}
              </FieldLabel>
              <Input
                id="dev-todo-title"
                autoFocus
                value={current.title}
                maxLength={DEV_TODO_TITLE_MAX}
                placeholder={t('form.titlePlaceholder')}
                aria-invalid={titleTouched && titleError ? true : undefined}
                className="text-title font-bold"
                onChange={event => patch({ title: event.target.value })}
              />
              {titleTouched && titleError && <FieldError>{titleError}</FieldError>}
            </Field>
          ) : (
            todo.title
          )
        }
        headerActions={
          editing ? undefined : (
            <>
              <Button variant="outline" size="sm" disabled={busy} onClick={startEditing}>
                <Pencil className="size-4" />
                {t('detail.edit')}
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger
                  aria-label={t('moreActions')}
                  className={kanbanMoreTriggerClassName}
                >
                  <MoreHorizontal className="size-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    className="text-destructive"
                    disabled={busy}
                    onSelect={() => setConfirmOpen(true)}
                  >
                    {t('delete.button')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          )
        }
        footer={
          editing ? (
            <>
              <Button type="button" variant="outline" disabled={busy} onClick={cancelEditing}>
                {t('form.cancel')}
              </Button>
              <Button type="button" disabled={busy || !valid} onClick={() => void save()}>
                {t('save')}
              </Button>
            </>
          ) : undefined
        }
      >
        <div className="flex flex-col gap-6 md:flex-row md:gap-8">
          <div className="flex min-w-0 flex-1 flex-col gap-6">
            <section className="flex flex-col gap-2">
              <h3 className="text-caption font-semibold text-muted-foreground">
                {t('detail.summary')}
              </h3>
              {editing ? (
                <>
                  <Textarea
                    rows={2}
                    value={current.summary}
                    maxLength={DEV_TODO_SUMMARY_MAX}
                    placeholder={t('form.summaryPlaceholder')}
                    aria-label={t('form.summary')}
                    onChange={event => patch({ summary: event.target.value })}
                  />
                  <span className="text-micro text-muted-foreground tabular-nums">
                    {t('form.counter', {
                      count: current.summary.length,
                      max: DEV_TODO_SUMMARY_MAX,
                    })}
                  </span>
                </>
              ) : (
                <p className="text-body break-words whitespace-pre-line text-foreground">
                  {todo.summary || t('detail.noSummary')}
                </p>
              )}
            </section>

            <section className="flex flex-col gap-2">
              <h3 className="text-caption font-semibold text-muted-foreground">
                {t('detail.description')}
              </h3>
              {editing ? (
                <HtmlEditor
                  name="description"
                  value={current.description}
                  onChange={next => patch({ description: next })}
                  placeholder={t('form.descriptionPlaceholder')}
                  features={{
                    bold: true,
                    italic: true,
                    underline: true,
                    strike: true,
                    bulletList: true,
                    orderedList: true,
                    characterCount: true,
                  }}
                  maxLength={DEV_TODO_DESCRIPTION_MAX}
                  maxLengthMode="block"
                  minHeight={160}
                  maxHeight={360}
                />
              ) : html ? (
                <div
                  className="text-body break-words text-foreground [&_a]:underline [&_ol]:list-decimal [&_ol]:pl-5 [&_p+p]:mt-2 [&_strong]:font-bold [&_ul]:list-disc [&_ul]:pl-5"
                  dangerouslySetInnerHTML={{ __html: html }}
                />
              ) : (
                <p className="text-body text-muted-foreground">{t('detail.noDescription')}</p>
              )}
            </section>
          </div>

          <aside className="flex w-full shrink-0 flex-col gap-5 rounded-lg bg-muted/60 p-4 md:w-64">
            <dl className="flex flex-col gap-5">
              <Field2 label={t('detail.status')}>
                <DropdownMenu>
                  <DropdownMenuTrigger
                    disabled={busy || editing || transitions.length === 0}
                    aria-label={t('detail.status')}
                    className={cn(
                      buttonVariants({ variant: 'secondary' }),
                      'w-full justify-between'
                    )}
                  >
                    {t(`columns.${todo.status}`)}
                    <ChevronDown className="size-4" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start">
                    {transitions.map(next => (
                      <DropdownMenuItem
                        key={next}
                        onSelect={() => void onUpdate(todo, { status: next })}
                      >
                        {t('workflow.moveTo')} {t(`columns.${next}`)}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </Field2>

              <Field2 label={t('detail.priority')}>
                <Select
                  value={editing ? current.priority : todo.priority}
                  disabled={busy}
                  onValueChange={value =>
                    editing
                      ? patch({ priority: value as DevTodoPriority })
                      : void onUpdate(todo, { priority: value as DevTodoPriority })
                  }
                >
                  <SelectTrigger className="w-full bg-background" aria-label={t('detail.priority')}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DEV_TODO_PRIORITIES.map(priority => (
                      <SelectItem key={priority} value={priority}>
                        {t(`priority.${priority}`)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field2>

              <Field2 label={t('detail.createdBy', { name: nameOf(todo.createdBy) })}>
                <ActorRow actor={todo.createdBy} line={actorLine(todo.createdBy, todo.createdAt)} />
              </Field2>

              <Field2 label={t('detail.updatedBy', { name: nameOf(todo.updatedBy) })}>
                <ActorRow actor={todo.updatedBy} line={actorLine(todo.updatedBy, todo.updatedAt)} />
              </Field2>

              {todo.doneAt && <Field2 label={t('detail.done')}>{formatDate(todo.doneAt)}</Field2>}
            </dl>
          </aside>
        </div>
      </AppDialog>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('delete.title')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('delete.description', { title: todo.title })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('delete.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              className={buttonVariants({ variant: 'destructive' })}
              disabled={busy}
              onClick={() => void confirmDelete()}
            >
              {t('delete.confirm')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
