import { Badge } from '@ui/shad-cn/components/badge.tsx';
import { Button } from '@ui/shad-cn/components/button.tsx';
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldLabel,
} from '@ui/shad-cn/components/field.tsx';
import { RotateCcw } from 'lucide-react';
import React, { useId } from 'react';
import { useTranslation } from 'react-i18next';

import { localizedText } from '../config.utils';
import type { IPluginConfigError, IPluginConfigField, PluginConfigPrimitive } from '../types';
import { PluginConfigFieldControl } from './PluginConfigFieldControl';

interface IPluginConfigFieldProps {
  field: IPluginConfigField;
  value: PluginConfigPrimitive | undefined;
  errors: IPluginConfigError[];
  disabled: boolean;
  onChange: (value: PluginConfigPrimitive | undefined) => void;
}

/** Label, help text, control, error and reset of one configuration field. */
export const PluginConfigField: React.FC<IPluginConfigFieldProps> = ({
  field,
  value,
  errors,
  disabled,
  onChange,
}) => {
  const { t, i18n } = useTranslation('admin');
  const language = i18n.resolvedLanguage ?? i18n.language ?? 'en';
  const id = useId();
  const isBoolean = field.type === 'boolean';
  const changed = value !== field.default;
  const title = localizedText(field.label, language) ?? field.key;
  const help = localizedText(field.help, language);
  const messages = errors.map(error => ({
    message: t(`plugins.config.errors.${error.code}`, {
      ...error.params,
      defaultValue: t('plugins.config.errors.unknown'),
    }),
  }));

  return (
    <Field
      orientation={isBoolean ? 'horizontal' : 'vertical'}
      data-invalid={errors.length > 0}
      className="items-start"
    >
      <FieldContent>
        <div className="flex flex-wrap items-center gap-2">
          <FieldLabel htmlFor={id} className="text-body font-bold">
            {title}
            {field.required && <span className="text-destructive"> *</span>}
          </FieldLabel>
          {field.public && <Badge variant="outline">{t('plugins.config.public')}</Badge>}
          {changed && field.default !== undefined && (
            <Button
              type="button"
              variant="ghost"
              size="xs"
              disabled={disabled}
              aria-label={t('plugins.config.resetFieldAria', { name: title })}
              onClick={() => onChange(field.default)}
            >
              <RotateCcw className="size-3.5" />
              {t('plugins.config.resetField')}
            </Button>
          )}
        </div>
        {help && <FieldDescription>{help}</FieldDescription>}
      </FieldContent>
      <PluginConfigFieldControl
        id={id}
        field={field}
        value={value}
        invalid={errors.length > 0}
        disabled={disabled}
        onChange={onChange}
      />
      {messages.length > 0 && <FieldError errors={messages} />}
    </Field>
  );
};
