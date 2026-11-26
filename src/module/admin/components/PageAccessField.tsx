import { cn } from '@ui/lib/utils';
import { Globe, Lock } from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next';

import type { SitePageVisibility } from '../types';
import { RoleListField } from './RoleListField';

const OPTIONS: { value: SitePageVisibility; icon: typeof Globe }[] = [
  { value: 'all', icon: Globe },
  { value: 'authenticated', icon: Lock },
];

export interface IPageAccessFieldProps {
  visibility: SitePageVisibility;
  roles: string[];
  onChange: (visibility: SitePageVisibility, roles: string[]) => void;
  disabled?: boolean;
}

/**
 * Who may see the page: everybody or only signed-in users – for signed-in users optionally
 * restricted to roles (any of them grants access, admins always see the page).
 */
export const PageAccessField: React.FC<IPageAccessFieldProps> = ({
  visibility,
  roles,
  onChange,
  disabled,
}) => {
  const { t } = useTranslation('admin');

  return (
    <fieldset className="rounded-xl border border-border/50 p-3">
      <legend className="px-1 text-caption font-medium text-foreground">
        {t('pages.access.title')}
      </legend>
      <div
        role="radiogroup"
        aria-label={t('pages.access.title')}
        className="grid grid-cols-2 gap-2"
      >
        {OPTIONS.map(({ value, icon: Icon }) => {
          const active = visibility === value;
          return (
            <button
              key={value}
              type="button"
              role="radio"
              aria-checked={active}
              disabled={disabled}
              onClick={() => onChange(value, value === 'all' ? [] : roles)}
              className={cn(
                'flex flex-col items-start gap-1 rounded-xl border p-3 text-left transition-colors disabled:opacity-50',
                active
                  ? 'border-foreground bg-foreground/[0.04]'
                  : 'border-border/50 hover:border-foreground/30'
              )}
            >
              <Icon className="size-4" aria-hidden="true" />
              <span className="text-body font-bold">{t(`pages.access.${value}`)}</span>
              <span className="text-micro leading-snug text-muted-foreground">
                {t(`pages.access.${value}Hint`)}
              </span>
            </button>
          );
        })}
      </div>

      {visibility === 'authenticated' && (
        <div className="mt-4">
          <RoleListField
            roles={roles}
            onChange={next => onChange(visibility, next)}
            emptyText={t('pages.access.rolesEmpty')}
            hint={t('pages.access.rolesHint')}
            disabled={disabled}
          />
        </div>
      )}
    </fieldset>
  );
};
