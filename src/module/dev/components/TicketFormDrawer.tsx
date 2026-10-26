import { LazyHtmlEditor as HtmlEditor } from '@core/editor/html/lazy.html-editor.tsx';
import type { HtmlEditorHandle } from '@core/editor/html/types.ts';
import { AppFormDrawer } from '@ui/patterns';
import { Input } from '@ui/shad-cn/components/input.tsx';
import React, { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { TICKET_DESCRIPTION_MAX, TICKET_TITLE_MAX, TICKET_TYPES } from '../const';
import type { ITicketValues } from '../types';
import { htmlTextLength, normalizeHtml } from '../utils';
import { Segmented } from './Segmented';

const EMPTY: ITicketValues = { title: '', description: '', type: 'idea' };

export interface ITicketFormDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  saving: boolean;
  onSubmit: (values: ITicketValues) => Promise<boolean>;
}

/** New ticket of a signed-in user: type (bug / feature / idea), title, description. */
export const TicketFormDrawer: React.FC<ITicketFormDrawerProps> = ({
  open,
  onOpenChange,
  saving,
  onSubmit,
}) => {
  const { t } = useTranslation('dev');
  const [values, setValues] = useState<ITicketValues>(EMPTY);
  const [touched, setTouched] = useState(false);
  const editorRef = useRef<HtmlEditorHandle>(null);

  const title = values.title.trim();
  const titleError = !title
    ? t('ticket.form.titleRequired')
    : title.length > TICKET_TITLE_MAX
      ? t('form.tooLong', { max: TICKET_TITLE_MAX })
      : null;
  const descriptionError =
    htmlTextLength(values.description) > TICKET_DESCRIPTION_MAX
      ? t('form.tooLong', { max: TICKET_DESCRIPTION_MAX })
      : null;
  const invalid = Boolean(titleError || descriptionError);

  const set = <K extends keyof ITicketValues>(key: K, value: ITicketValues[K]) => {
    setValues(prev => ({ ...prev, [key]: value }));
    setTouched(true);
  };

  const close = (next: boolean) => {
    if (saving) return;
    if (!next) {
      setValues(EMPTY);
      setTouched(false);
    }
    onOpenChange(next);
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setTouched(true);
    if (invalid || saving) return;
    const ok = await onSubmit({ ...values, title, description: normalizeHtml(values.description) });
    if (ok) {
      setValues(EMPTY);
      setTouched(false);
      onOpenChange(false);
    }
  };

  return (
    <AppFormDrawer
      open={open}
      onOpenChange={close}
      title={t('ticket.form.title')}
      description={t('ticket.form.description')}
      closeLabel={t('form.cancel')}
      submitLabel={t('ticket.form.submit')}
      submitDisabled={saving || (touched && invalid)}
      busy={saving}
      submitPlacement="header"
      onSubmit={submit}
      bodyClassName="space-y-5 py-5 sm:px-6"
    >
      <p className="text-caption text-muted-foreground">{t('ticket.form.hint')}</p>

      <Segmented
        label={t('ticket.form.type')}
        value={values.type}
        options={TICKET_TYPES}
        onChange={value => set('type', value)}
        text={value => t(`ticket.type.${value}`)}
        disabled={saving}
      />

      <div>
        <div className="mb-1.5 flex items-center justify-between">
          <label htmlFor="ticket-title" className="text-caption font-medium text-foreground">
            {t('form.title')}
          </label>
          <span className="text-xs text-muted-foreground tabular-nums">
            {values.title.length} / {TICKET_TITLE_MAX}
          </span>
        </div>
        <Input
          id="ticket-title"
          value={values.title}
          onChange={e => set('title', e.target.value)}
          placeholder={t(`ticket.form.titlePlaceholder.${values.type}`)}
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
          htmlFor="ticket-description"
          className="mb-1.5 block text-caption font-medium text-foreground"
          onClick={() => editorRef.current?.focus()}
        >
          {t('form.descriptionLabel')}
        </label>
        <HtmlEditor
          ref={editorRef}
          id="ticket-description"
          value={values.description}
          onChange={html => set('description', html)}
          placeholder={t(`ticket.form.descriptionPlaceholder.${values.type}`)}
          maxLength={TICKET_DESCRIPTION_MAX}
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
          minHeight={180}
          className="rounded-xl"
        />
        {descriptionError && (
          <p role="alert" className="mt-1.5 text-caption text-destructive">
            {descriptionError}
          </p>
        )}
      </div>
    </AppFormDrawer>
  );
};
