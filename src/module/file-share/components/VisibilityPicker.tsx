import { cn } from '@ui/lib/utils';
import { EyeOff, Globe, Lock } from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { FILE_SHARE_VISIBILITIES } from '../const';
import type { FileShareVisibility } from '../types';

const ICONS = { public: Globe, authenticated: Lock, private: EyeOff } as const;

export interface IVisibilityPickerProps {
  value: FileShareVisibility;
  onChange: (value: FileShareVisibility) => void;
  disabled?: boolean;
}

/** Who may see / download the file: everyone or only signed-in users (big radio cards). */
export const VisibilityPicker: React.FC<IVisibilityPickerProps> = ({
  value,
  onChange,
  disabled,
}) => {
  const { t } = useTranslation('file-share');
  return (
    <div>
      <p id="file-share-visibility" className="mb-1.5 text-caption font-medium text-foreground">
        {t('form.visibility')}
      </p>
      <div role="radiogroup" aria-labelledby="file-share-visibility" className="grid gap-2">
        {FILE_SHARE_VISIBILITIES.map(option => {
          const Icon = ICONS[option];
          const checked = value === option;
          return (
            <button
              key={option}
              type="button"
              role="radio"
              aria-checked={checked}
              disabled={disabled}
              onClick={() => onChange(option)}
              className={cn(
                'flex min-h-14 items-center gap-3 rounded-xl border px-3.5 py-2.5 text-left transition-colors disabled:opacity-60',
                checked
                  ? 'border-foreground bg-foreground/[0.04]'
                  : 'border-border/60 hover:bg-foreground/[0.03]'
              )}
            >
              <Icon className="size-5 shrink-0" aria-hidden="true" />
              <span className="min-w-0 flex-1">
                <span className="block text-body font-semibold">
                  {t(`visibility.${option}.label`)}
                </span>
                <span className="block text-caption text-muted-foreground">
                  {t(`visibility.${option}.hint`)}
                </span>
              </span>
              <span
                aria-hidden="true"
                className={cn(
                  'grid size-5 shrink-0 place-items-center rounded-full border-2',
                  checked ? 'border-foreground' : 'border-muted-foreground/40'
                )}
              >
                {checked && <span className="size-2.5 rounded-full bg-foreground" />}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
