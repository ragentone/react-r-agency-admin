import type { IAccountFormValues } from '@core/account/types';
import { ACCOUNT_DESCRIPTION_MAX_LENGTH } from '@core/account/validation';
import { LazyHtmlEditor as HtmlEditor } from '@core/editor/html/lazy.html-editor.tsx';
import type { HtmlEditorHandle } from '@core/editor/html/types.ts';
import { Field, FieldError, FieldLabel } from '@ui/shad-cn/components/field';
import { useFormikContext } from 'formik';
import React, { useRef } from 'react';
import { useTranslation } from 'react-i18next';

export interface AccountBioFieldProps {
  disabled?: boolean;
  className?: string;
}

/**
 * "About me" as rich text. Stored as HTML in `description` (→ `description.html`),
 * validated by the Yup schema (max. visible characters, tags don't count).
 */
export const AccountBioField: React.FC<AccountBioFieldProps> = ({ disabled, className }) => {
  const { t } = useTranslation('account');
  const formik = useFormikContext<IAccountFormValues>();
  const editorRef = useRef<HtmlEditorHandle>(null);

  const isSubmitting = formik?.isSubmitting ?? false;
  const isDisabled = disabled ?? isSubmitting;
  const error = formik?.errors?.description;
  const isInvalid = Boolean(formik?.touched?.description && error);
  const errorId = 'account-description-error';

  return (
    <Field data-invalid={isInvalid} className={className}>
      {/* The editor is no native input → focus it explicitly. */}
      <FieldLabel htmlFor="account-description" onClick={() => editorRef.current?.focus()}>
        {t('form.description')}
      </FieldLabel>
      <HtmlEditor
        ref={editorRef}
        id="account-description"
        name="description"
        value={formik?.values?.description ?? ''}
        onChange={html => {
          void formik?.setFieldValue('description', html);
        }}
        onBlur={() => {
          void formik?.setFieldTouched('description', true);
        }}
        placeholder={t('form.descriptionPlaceholder')}
        features={{
          bold: true,
          emoji: true,
          bulletList: true,
          orderedList: true,
          characterCount: true,
          underline: true,
          strike: true,
          italic: true,
        }}
        // Typing past the limit stays possible (outlined) – the form blocks saving.
        maxLength={ACCOUNT_DESCRIPTION_MAX_LENGTH}
        maxLengthMode="highlight"
        editable={!isDisabled}
        invalid={isInvalid}
        minHeight={140}
        maxHeight={360}
      />
      {isInvalid && <FieldError id={errorId}>{error}</FieldError>}
    </Field>
  );
};
