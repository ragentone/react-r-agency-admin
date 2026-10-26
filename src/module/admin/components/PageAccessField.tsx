import { useUserRoleRegistry } from '@core/auth/roles/role.manager.ts';
import { cn } from '@ui/lib/utils';
import { Globe, Lock, X } from 'lucide-react';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import type { SitePageVisibility } from '../types';
import { RoleChip } from './RoleChip';
import { RoleSelect } from './RoleSelect';

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
  const { roles: registered } = useUserRoleRegistry();
  const options = useMemo(
    () => registered.filter(definition => !roles.includes(definition.role)),
    [registered, roles]
  );

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
                  : 'border-border/60 hover:border-foreground/30'
              )}
            >
              <Icon className="size-4" aria-hidden="true" />
              <span className="text-body font-bold">{t(`pages.access.${value}`)}</span>
              <span className="text-[11px] leading-snug text-muted-foreground">
                {t(`pages.access.${value}Hint`)}
              </span>
            </button>
          );
        })}
      </div>

      {visibility === 'authenticated' && (
        <div className="mt-4">
          <p className="mb-1.5 text-caption font-medium text-foreground">
            {t('pages.access.roles')}
          </p>
          {roles.length > 0 ? (
            <ul className="mb-2 flex flex-wrap gap-1.5">
              {roles.map(role => (
                <li key={role} className="flex items-center">
                  <RoleChip role={role} className="pr-1" />
                  <button
                    type="button"
                    onClick={() =>
                      onChange(
                        visibility,
                        roles.filter(item => item !== role)
                      )
                    }
                    disabled={disabled}
                    aria-label={t('pages.access.removeRole', { role })}
                    className="-ml-1 grid size-7 place-items-center rounded-full text-muted-foreground hover:bg-foreground/10 hover:text-foreground disabled:opacity-50"
                  >
                    <X className="size-3.5" />
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mb-2 text-caption text-muted-foreground">
              {t('pages.access.rolesEmpty')}
            </p>
          )}
          {options.length > 0 && (
            <RoleSelect
              value=""
              onValueChange={role => role && onChange(visibility, [...roles, role])}
              options={options}
              placeholder={t('pages.access.addRole')}
              ariaLabel={t('pages.access.addRole')}
              disabled={disabled}
              className="h-11 w-full rounded-xl"
            />
          )}
          <p className="mt-1.5 text-caption text-muted-foreground">{t('pages.access.rolesHint')}</p>
        </div>
      )}
    </fieldset>
  );
};
