import { cn } from '@ui/lib/utils';
import { Maximize, PanelTop } from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next';

import type { SitePageDisplayMode } from '../types';

const OPTIONS: { value: SitePageDisplayMode; icon: typeof PanelTop }[] = [
  { value: 'route', icon: PanelTop },
  { value: 'fullscreen', icon: Maximize },
];

export interface IPageDisplayModeFieldProps {
  value: SitePageDisplayMode;
  onChange: (value: SitePageDisplayMode) => void;
  disabled?: boolean;
}

/** How visitors open the page: inside the app layout (menu stays visible) or fullscreen. */
export const PageDisplayModeField: React.FC<IPageDisplayModeFieldProps> = ({
  value,
  onChange,
  disabled,
}) => {
  const { t } = useTranslation('admin');
  return (
    <fieldset className="rounded-xl border border-border/50 p-3">
      <legend className="px-1 text-caption font-medium text-foreground">
        {t('pages.displayMode.title')}
      </legend>
      <div
        role="radiogroup"
        aria-label={t('pages.displayMode.title')}
        className="grid grid-cols-2 gap-2"
      >
        {OPTIONS.map(({ value: option, icon: Icon }) => {
          const active = value === option;
          return (
            <button
              key={option}
              type="button"
              role="radio"
              aria-checked={active}
              disabled={disabled}
              onClick={() => onChange(option)}
              className={cn(
                'flex flex-col items-start gap-1 rounded-xl border p-3 text-left transition-colors disabled:opacity-50',
                active
                  ? 'border-foreground bg-foreground/[0.04]'
                  : 'border-border/60 hover:border-foreground/30'
              )}
            >
              <Icon className="size-4" aria-hidden="true" />
              <span className="text-body font-bold">{t(`pages.displayMode.${option}`)}</span>
              <span className="text-[11px] leading-snug text-muted-foreground">
                {t(`pages.displayMode.${option}Hint`)}
              </span>
            </button>
          );
        })}
      </div>
    </fieldset>
  );
};
