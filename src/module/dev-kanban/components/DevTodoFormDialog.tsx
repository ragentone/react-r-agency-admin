import { LazyHtmlEditor as HtmlEditor } from '@core/editor/html/lazy.html-editor.tsx';
import { AppDialog } from '@ui/components/app-dialog';
import { Button } from '@ui/shad-cn/components/button';
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
import type { FormEvent } from 'react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import {
  DEV_TODO_DESCRIPTION_MAX,
  DEV_TODO_PRIORITIES,
  DEV_TODO_SUMMARY_MAX,
  DEV_TODO_TITLE_MAX,
  type DevTodoPriority,
  type DevTodoStatus,
  type IDevTodo,
  type IDevTodoValues,
} from '../types';

/** Statuses a new todo can start in. */
const CREATE_STATUSES: readonly DevTodoStatus[] = ['open', 'backlog'];

export interface IDevTodoFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** `null` = new todo (the only mode used now). */
  todo: IDevTodo | null;
  busy: boolean;
  onSave: (values: IDevTodoValues, id: string | null) => Promise<boolean>;
}

const emptyValues: IDevTodoValues = {
  title: '',
  summary: '',
  description: '',
  status: 'open',
  priority: 'normal',
};

/** Create dialog: title, summary, description, priority and the start status (open or backlog). */
export const DevTodoFormDialog = ({
  open,
  onOpenChange,
  todo,
  busy,
  onSave,
}: IDevTodoFormDialogProps) => {
  const { t } = useTranslation('dev-kanban');
  // The parent gives the dialog a new `key` each time it opens, so the state starts fresh.
  const [values, setValues] = useState<IDevTodoValues>(emptyValues);
  const [touched, setTouched] = useState(false);

  // Own validation (no Formik): the title error shows once the user touched the form.
  const titleError = values.title.trim().length === 0 ? t('form.errors.titleRequired') : null;
  const valid = titleError === null && values.summary.length <= DEV_TODO_SUMMARY_MAX;

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setTouched(true);
    if (!valid || busy) return;
    const ok = await onSave(
      { ...values, title: values.title.trim(), summary: values.summary.trim() },
      todo?.id ?? null
    );
    if (ok) onOpenChange(false);
  };

  return (
    <AppDialog
      open={open}
      onOpenChange={onOpenChange}
      title={t('create.title')}
      description={t('form.description')}
      size="lg"
      onSubmit={submit}
      footer={
        <>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={busy}
          >
            {t('form.cancel')}
          </Button>
          <Button type="submit" disabled={busy || !valid}>
            {t('save')}
          </Button>
        </>
      }
    >
      <Field data-invalid={touched && titleError ? true : undefined}>
        <FieldLabel htmlFor="dev-todo-title">{t('form.title')}</FieldLabel>
        <Input
          id="dev-todo-title"
          autoFocus
          value={values.title}
          maxLength={DEV_TODO_TITLE_MAX}
          placeholder={t('form.titlePlaceholder')}
          aria-invalid={touched && titleError ? true : undefined}
          onChange={event => setValues(prev => ({ ...prev, title: event.target.value }))}
        />
        {touched && titleError && <FieldError>{titleError}</FieldError>}
      </Field>

      <Field>
        <FieldLabel htmlFor="dev-todo-summary">{t('form.summary')}</FieldLabel>
        <Textarea
          id="dev-todo-summary"
          rows={2}
          value={values.summary}
          maxLength={DEV_TODO_SUMMARY_MAX}
          placeholder={t('form.summaryPlaceholder')}
          onChange={event => setValues(prev => ({ ...prev, summary: event.target.value }))}
        />
        <span className="text-micro text-muted-foreground tabular-nums">
          {t('form.counter', { count: values.summary.length, max: DEV_TODO_SUMMARY_MAX })}
        </span>
      </Field>

      <Field>
        <FieldLabel htmlFor="dev-todo-description">{t('form.description')}</FieldLabel>
        <HtmlEditor
          id="dev-todo-description"
          name="description"
          value={values.description}
          onChange={html => setValues(prev => ({ ...prev, description: html }))}
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
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field>
          <FieldLabel htmlFor="dev-todo-status">{t('form.status')}</FieldLabel>
          <Select
            value={values.status}
            onValueChange={status =>
              setValues(prev => ({ ...prev, status: status as DevTodoStatus }))
            }
          >
            <SelectTrigger id="dev-todo-status" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CREATE_STATUSES.map(status => (
                <SelectItem key={status} value={status}>
                  {t(`columns.${status}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        <Field>
          <FieldLabel htmlFor="dev-todo-priority">{t('form.priority')}</FieldLabel>
          <Select
            value={values.priority}
            onValueChange={priority =>
              setValues(prev => ({ ...prev, priority: priority as DevTodoPriority }))
            }
          >
            <SelectTrigger id="dev-todo-priority" className="w-full">
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
        </Field>
      </div>
    </AppDialog>
  );
};
