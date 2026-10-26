import { LazyHtmlEditor as HtmlEditor } from '@core/editor/html/lazy.html-editor.tsx';
import type { HtmlEditorHandle } from '@core/editor/html/types.ts';
import { AppFormDrawer } from '@ui/patterns';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@ui/shad-cn/components/alert-dialog.tsx';
import { Button } from '@ui/shad-cn/components/button.tsx';
import { Input } from '@ui/shad-cn/components/input.tsx';
import { Switch } from '@ui/shad-cn/components/switch.tsx';
import { Trash2 } from 'lucide-react';
import React, { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import {
  DEV_TODO_DESCRIPTION_MAX,
  DEV_TODO_PRIORITIES,
  DEV_TODO_STATUSES,
  DEV_TODO_TITLE_MAX,
} from '../const';
import type { IDevTodo, IDevTodoValues } from '../types';
import { htmlTextLength, normalizeHtml } from '../utils';
import { Segmented } from './Segmented';

const EMPTY: IDevTodoValues = {
  title: '',
  description: '',
  status: 'open',
  priority: 'normal',
  public: true,
};

export interface IDevTodoFormDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Edit this todo – without it a new one is created. */
  todo: IDevTodo | null;
  saving: boolean;
  onSubmit: (values: IDevTodoValues) => Promise<boolean>;
  onDelete: (id: string) => Promise<boolean>;
}

/** Create / edit a dev todo (bottom drawer) incl. delete with confirm. */
export const DevTodoFormDrawer: React.FC<IDevTodoFormDrawerProps> = ({
  open,
  onOpenChange,
  todo,
  saving,
  onSubmit,
  onDelete,
}) => {
  const { t } = useTranslation('dev');
  const [values, setValues] = useState<IDevTodoValues>(EMPTY);
  const [touched, setTouched] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const editorRef = useRef<HtmlEditorHandle>(null);

  // Fresh values whenever the drawer opens (new or another todo) – adjusted during render.
  const [source, setSource] = useState<{ open: boolean; todo: IDevTodo | null }>({
    open: false,
    todo: null,
  });
  if (open && (!source.open || source.todo !== todo)) {
    setSource({ open, todo });
    setValues(
      todo
        ? {
            title: todo.title,
            description: todo.description,
            status: todo.status,
            priority: todo.priority,
            public: todo.public ?? true,
          }
        : EMPTY
    );
    setTouched(false);
  } else if (!open && source.open) {
    setSource({ open: false, todo: null });
  }

  const title = values.title.trim();
  const titleError = !title
    ? t('form.titleRequired')
    : title.length > DEV_TODO_TITLE_MAX
      ? t('form.tooLong', { max: DEV_TODO_TITLE_MAX })
      : null;
  const descriptionError =
    htmlTextLength(values.description) > DEV_TODO_DESCRIPTION_MAX
      ? t('form.tooLong', { max: DEV_TODO_DESCRIPTION_MAX })
      : null;
  const invalid = Boolean(titleError || descriptionError);

  const set = <K extends keyof IDevTodoValues>(key: K, value: IDevTodoValues[K]) => {
    setValues(prev => ({ ...prev, [key]: value }));
    setTouched(true);
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setTouched(true);
    if (invalid || saving) return;
    const ok = await onSubmit({ ...values, title, description: normalizeHtml(values.description) });
    if (ok) onOpenChange(false);
  };

  return (
    <AppFormDrawer
      open={open}
      onOpenChange={next => !saving && onOpenChange(next)}
      title={todo ? t('form.editTitle') : t('form.createTitle')}
      description={t('form.description')}
      closeLabel={t('form.cancel')}
      submitLabel={todo ? t('form.save') : t('form.create')}
      submitDisabled={saving || (touched && invalid)}
      busy={saving}
      submitPlacement="header"
      onSubmit={submit}
      bodyClassName="space-y-5 py-5 sm:px-6"
    >
      <div>
        <div className="mb-1.5 flex items-center justify-between">
          <label htmlFor="dev-todo-title" className="text-caption font-medium text-foreground">
            {t('form.title')}
          </label>
          <span className="text-xs text-muted-foreground tabular-nums">
            {values.title.length} / {DEV_TODO_TITLE_MAX}
          </span>
        </div>
        <Input
          id="dev-todo-title"
          value={values.title}
          onChange={e => set('title', e.target.value)}
          placeholder={t('form.titlePlaceholder')}
          disabled={saving}
          aria-invalid={Boolean(touched && titleError)}
          className="h-12 rounded-xl text-base font-semibold sm:text-body"
        />
        {touched && titleError && (
          <p role="alert" className="mt-1.5 text-caption text-destructive">
            {titleError}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="dev-todo-description"
          className="mb-1.5 block text-caption font-medium text-foreground"
          onClick={() => editorRef.current?.focus()}
        >
          {t('form.descriptionLabel')}
        </label>
        <HtmlEditor
          ref={editorRef}
          id="dev-todo-description"
          value={values.description}
          onChange={html => set('description', html)}
          placeholder={t('form.descriptionPlaceholder')}
          maxLength={DEV_TODO_DESCRIPTION_MAX}
          maxLengthMode={'highlight'}
          features={{
            bold: true,
            italic: true,
            strike: true,
            underline: true,
            orderedList: true,
            bulletList: true,
            characterCount: true,
          }}
          editable={!saving}
          invalid={Boolean(descriptionError)}
          minHeight={200}
          className="rounded-xl"
        />
        {descriptionError && (
          <p role="alert" className="mt-1.5 text-caption text-destructive">
            {descriptionError}
          </p>
        )}
      </div>

      <Segmented
        label={t('form.priority')}
        value={values.priority}
        options={DEV_TODO_PRIORITIES}
        onChange={value => set('priority', value)}
        text={value => t(`priority.${value}`)}
        disabled={saving}
      />
      <Segmented
        label={t('form.status')}
        value={values.status}
        options={DEV_TODO_STATUSES}
        onChange={value => set('status', value)}
        text={value => t(`status.${value}`)}
        disabled={saving}
      />

      <label
        htmlFor="dev-todo-public"
        className="flex cursor-pointer items-center gap-4 rounded-xl border border-border/50 px-3 py-3"
      >
        <span className="min-w-0 flex-1">
          <span className="block text-body font-semibold text-foreground">{t('form.public')}</span>
          <span className="mt-0.5 block text-caption text-muted-foreground">
            {t('form.publicHint')}
          </span>
        </span>
        <Switch
          id="dev-todo-public"
          checked={values.public}
          onCheckedChange={checked => set('public', checked)}
          disabled={saving}
        />
      </label>

      {todo && (
        <Button
          type="button"
          onClick={() => setConfirmDelete(true)}
          disabled={saving}
          variant="destructive-outline"
          size="lg"
          fullWidth
        >
          <Trash2 className="size-4" aria-hidden="true" />
          {t('delete.action')}
        </Button>
      )}

      {todo && (
        <AlertDialog open={confirmDelete} onOpenChange={next => !saving && setConfirmDelete(next)}>
          <AlertDialogContent className="w-[calc(100%-2rem)] max-w-[340px] gap-6 rounded-2xl p-8">
            <AlertDialogHeader className="space-y-2 text-left">
              <AlertDialogTitle className="text-xl font-bold tracking-tight">
                {t('delete.title')}
              </AlertDialogTitle>
              <AlertDialogDescription className="text-body leading-5">
                {t('delete.description', { title: todo.title })}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="flex-col gap-3 sm:flex-col sm:space-x-0">
              <Button
                type="button"
                disabled={saving}
                onClick={async () => {
                  const ok = await onDelete(todo.id);
                  if (ok) {
                    setConfirmDelete(false);
                    onOpenChange(false);
                  }
                }}
                variant="destructive"
                size="lg"
                fullWidth
                isLoading={saving}
              >
                {t('delete.confirm')}
              </Button>
              <AlertDialogCancel disabled={saving} className="mt-0 h-11 w-full text-body sm:mt-0">
                {t('form.cancel')}
              </AlertDialogCancel>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </AppFormDrawer>
  );
};
