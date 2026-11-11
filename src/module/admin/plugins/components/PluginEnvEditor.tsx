import { Button } from '@ui/shad-cn/components/button.tsx';
import { Input } from '@ui/shad-cn/components/input.tsx';
import { FieldArray, useFormikContext } from 'formik';
import { Plus, X } from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next';

import type { IEnvFormValues } from '../env.validation';

interface IPluginEnvEditorProps {
  disabled?: boolean;
}

/** Key/value rows of an env file inside a Formik form (`rows`). Errors show under each row. */
export const PluginEnvEditor: React.FC<IPluginEnvEditorProps> = ({ disabled }) => {
  const { t } = useTranslation('admin');
  const { values, errors, touched, getFieldProps } = useFormikContext<IEnvFormValues>();
  const rowErrors = Array.isArray(errors.rows) ? errors.rows : [];
  const rowTouched = Array.isArray(touched.rows) ? touched.rows : [];

  return (
    <FieldArray name="rows">
      {helpers => (
        <div className="flex flex-col gap-3">
          {typeof errors.rows === 'string' && (
            <p role="alert" className="text-sm text-destructive">
              {errors.rows}
            </p>
          )}
          {values.rows.length === 0 && (
            <p className="text-sm text-muted-foreground">{t('plugins.code.env.empty')}</p>
          )}
          {values.rows.map((_, index) => {
            const rowError = rowErrors[index];
            const keyError =
              rowTouched[index]?.key && typeof rowError === 'object' ? rowError.key : undefined;
            return (
              <div key={index} className="flex flex-col gap-1">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                  <Input
                    aria-label={t('plugins.code.env.key')}
                    aria-invalid={Boolean(keyError)}
                    placeholder={t('plugins.code.env.key')}
                    className="font-mono sm:w-56"
                    disabled={disabled}
                    {...getFieldProps(`rows.${index}.key`)}
                  />
                  <Input
                    aria-label={t('plugins.code.env.value')}
                    placeholder={t('plugins.code.env.value')}
                    className="font-mono sm:flex-1"
                    disabled={disabled}
                    {...getFieldProps(`rows.${index}.value`)}
                  />
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label={t('plugins.code.env.remove')}
                    disabled={disabled}
                    onClick={() => helpers.remove(index)}
                  >
                    <X />
                  </Button>
                </div>
                {keyError && <p className="text-xs text-destructive">{keyError}</p>}
              </div>
            );
          })}
          <Button
            variant="outline"
            size="sm"
            className="self-start"
            disabled={disabled}
            onClick={() => helpers.push({ key: '', value: '' })}
          >
            <Plus />
            {t('plugins.code.env.add')}
          </Button>
        </div>
      )}
    </FieldArray>
  );
};
