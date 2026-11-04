import { Input } from '@ui/shad-cn/components/input.tsx';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@ui/shad-cn/components/select.tsx';
import { Switch } from '@ui/shad-cn/components/switch.tsx';
import { Textarea } from '@ui/shad-cn/components/textarea.tsx';
import React from 'react';
import { useTranslation } from 'react-i18next';

import type { IPluginConfigField, PluginConfigPrimitive } from '../types';

interface IPluginConfigFieldControlProps {
  id: string;
  field: IPluginConfigField;
  value: PluginConfigPrimitive | undefined;
  invalid: boolean;
  disabled: boolean;
  onChange: (value: PluginConfigPrimitive | undefined) => void;
}

/** The input for one field type. Text inputs use 16 px on mobile so iOS does not zoom. */
export const PluginConfigFieldControl: React.FC<IPluginConfigFieldControlProps> = ({
  id,
  field,
  value,
  invalid,
  disabled,
  onChange,
}) => {
  const { t } = useTranslation('admin');
  const text = typeof value === 'string' ? value : '';

  switch (field.type) {
    case 'text':
      return (
        <Textarea
          id={id}
          value={text}
          rows={4}
          disabled={disabled}
          aria-invalid={invalid}
          className="text-base"
          onChange={event => onChange(event.target.value)}
        />
      );
    case 'number':
      return (
        <Input
          id={id}
          type="number"
          inputMode="decimal"
          value={typeof value === 'number' ? value : ''}
          min={field.min}
          max={field.max}
          disabled={disabled}
          aria-invalid={invalid}
          className="h-12 text-base"
          onChange={event =>
            onChange(event.target.value === '' ? undefined : Number(event.target.value))
          }
        />
      );
    case 'boolean':
      return (
        <Switch
          id={id}
          checked={value === true}
          disabled={disabled}
          aria-invalid={invalid}
          onCheckedChange={checked => onChange(checked)}
        />
      );
    case 'select':
      return (
        <Select value={text} onValueChange={next => onChange(next)} disabled={disabled}>
          <SelectTrigger id={id} aria-invalid={invalid} className="h-12 w-full text-base">
            <SelectValue placeholder={t('plugins.config.selectPlaceholder')} />
          </SelectTrigger>
          <SelectContent>
            {(field.options ?? []).map(option => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    default:
      return (
        <Input
          id={id}
          value={text}
          maxLength={field.maxLength}
          disabled={disabled}
          aria-invalid={invalid}
          className="h-12 text-base"
          onChange={event => onChange(event.target.value)}
        />
      );
  }
};
