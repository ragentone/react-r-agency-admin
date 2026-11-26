import { useUserRoleRegistry } from '@core/auth/roles/role.manager.ts';
import { Button } from '@ui/shad-cn/components/button.tsx';
import { Plus, X } from 'lucide-react';
import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useBackendRoles } from '../hooks/use.backend.roles';
import { RoleChip } from './RoleChip';
import { RolePickerSheet } from './RolePickerSheet';

export interface IRoleListFieldProps {
  roles: string[];
  onChange: (roles: string[]) => void;
  /** Shown when no role is picked. */
  emptyText: string;
  hint: string;
  disabled?: boolean;
}

/** Optional roles (any of them grants access): chips + picker sheet. Used by page and block access. */
export const RoleListField: React.FC<IRoleListFieldProps> = ({
  roles,
  onChange,
  emptyText,
  hint,
  disabled,
}) => {
  const { t } = useTranslation('admin');
  const { roles: registered } = useUserRoleRegistry();
  useBackendRoles();
  const [picking, setPicking] = useState(false);
  const options = useMemo(
    () => registered.filter(definition => !roles.includes(definition.role)),
    [registered, roles]
  );

  return (
    <div>
      <p className="mb-1.5 text-caption font-medium text-foreground">{t('pages.access.roles')}</p>
      {roles.length > 0 ? (
        <ul className="mb-2 flex flex-wrap gap-1.5">
          {roles.map(role => (
            <li key={role} className="flex items-center">
              <RoleChip role={role} className="pr-1" />
              <button
                type="button"
                onClick={() => onChange(roles.filter(item => item !== role))}
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
        <p className="mb-2 text-caption text-muted-foreground">{emptyText}</p>
      )}
      {options.length > 0 && (
        <>
          <Button
            type="button"
            variant="outline"
            pill
            size="lg"
            fullWidth
            onClick={() => setPicking(true)}
            disabled={disabled}
            aria-haspopup="dialog"
          >
            <Plus />
            {t('pages.access.addRole')}
          </Button>
          <RolePickerSheet
            open={picking}
            onOpenChange={setPicking}
            title={t('pages.access.addRole')}
            description={hint}
            options={options}
            mode="multiple"
            confirmLabel={count =>
              count ? t('rolePicker.addConfirm', { count }) : t('rolePicker.addNone')
            }
            onConfirm={picked => {
              onChange([...roles, ...picked.filter(role => !roles.includes(role))]);
              return true;
            }}
          />
        </>
      )}
      <p className="mt-1.5 text-caption text-muted-foreground">{hint}</p>
    </div>
  );
};
