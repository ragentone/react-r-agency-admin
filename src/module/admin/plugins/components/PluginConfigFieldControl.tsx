import { LazyHtmlEditor } from '@core/editor/html/lazy.html-editor.tsx';
import CodeMirror from '@uiw/react-codemirror';
import { useTheme } from '@core/theme';
import { languageByName } from '../code.language';
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
    case 'code':
      return <CodeField id={id} value={text} field={field} invalid={invalid} disabled={disabled} onChange={onChange} />;
    case 'html':
      return (
        <LazyHtmlEditor
          id={id}
          value={text}
          editable={!disabled}
          invalid={invalid}
          minHeight={120}
          features={field.preset ?? 'basic'}
          onChange={html => onChange(html === '' ? undefined : html)}
        />
      );
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

interface ICodeFieldProps {
  id: string;
  field: IPluginConfigField;
  value: string;
  invalid: boolean;
  disabled: boolean;
  onChange: (value: PluginConfigPrimitive | undefined) => void;
}

/** CodeMirror for a `code` field. Empty text is stored as "not set". */
const CodeField: React.FC<ICodeFieldProps> = ({ id, field, value, invalid, disabled, onChange }) => {
  const { theme } = useTheme();
  return (
    <div
      id={id}
      data-invalid={invalid || undefined}
      className="overflow-hidden rounded-md border border-input data-[invalid=true]:border-destructive"
    >
      <CodeMirror
        value={value}
        minHeight="160px"
        maxHeight="480px"
        theme={theme === 'dark' ? 'dark' : 'light'}
        extensions={languageByName(field.language)}
        editable={!disabled}
        onChange={next => onChange(next === '' ? undefined : next)}
        basicSetup={{ foldGutter: false }}
      />
    </div>
  );
};
