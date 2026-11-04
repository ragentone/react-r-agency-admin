import { Checkbox } from '@ui/shad-cn/components/checkbox.tsx';
import { Label } from '@ui/shad-cn/components/label.tsx';
import React from 'react';
import { useTranslation } from 'react-i18next';

import type { PluginScope } from '../types';

export const PLUGIN_SCOPE_OPTIONS: PluginScope[] = ['frontend', 'admin'];

interface IPluginScopeCheckboxesProps {
  value: PluginScope[];
  onChange: (next: PluginScope[]) => void;
  disabled?: boolean;
}

/** One checkbox per scope. The last checked scope cannot be unchecked, so one always stays selected. */
export const PluginScopeCheckboxes: React.FC<IPluginScopeCheckboxesProps> = ({ value, onChange, disabled }) => {
  const { t } = useTranslation('admin');

  const toggle = (option: PluginScope, checked: boolean) => {
    if (checked) {
      if (!value.includes(option)) onChange([...value, option]);
      return;
    }
    const next = value.filter(item => item !== option);
    if (next.length > 0) onChange(next);
  };

  return (
    <div className="flex flex-col gap-2">
      {PLUGIN_SCOPE_OPTIONS.map(option => (
        <Label
          key={option}
          className="flex min-h-12 cursor-pointer items-center gap-3 rounded-md border border-border px-3 py-2 text-base font-normal"
        >
          <Checkbox
            checked={value.includes(option)}
            disabled={disabled}
            onCheckedChange={next => toggle(option, next === true)}
            className="size-5 shrink-0"
          />
          {t(`plugins.create.scope.${option}`)}
        </Label>
      ))}
    </div>
  );
};
