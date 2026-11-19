import { Button } from '@ui/shad-cn/components/button';
import { Checkbox } from '@ui/shad-cn/components/checkbox';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { type IRegistrationRoleGroup, useRegistrationRoles } from '../hooks/use.registration.roles';
import { RegistrationRoleGroup } from './RegistrationRoleGroup';

/** `Registrierung` tab: which app roles every new account gets, grouped by app. */
export const AdminRegistrationView: React.FC = () => {
  const { t } = useTranslation('admin');
  const { loading, saving, error, roles, groups, save, retry } = useRegistrationRoles();
  const [draft, setDraft] = useState<string[] | null>(null);
  const [failed, setFailed] = useState(false);
  const selected = draft ?? roles;
  const dirty = draft !== null;

  const update = (change: (current: string[]) => string[]) => {
    setFailed(false);
    setDraft(prev => change(prev ?? roles));
  };
  const toggle = (role: string, checked: boolean) =>
    update(current => [...current.filter(item => item !== role), ...(checked ? [role] : [])]);
  const toggleGroup = (group: IRegistrationRoleGroup, checked: boolean) => {
    const ids = group.options.map(option => option.role);
    update(current => [...current.filter(item => !ids.includes(item)), ...(checked ? ids : [])]);
  };

  const submit = async () => {
    if (!draft) return;
    const ok = await save(draft);
    setFailed(!ok);
    if (ok) setDraft(null);
  };

  if (error) {
    return (
      <div className="flex flex-col items-start gap-3 p-4">
        <p className="text-muted-foreground text-sm">{t('registration.error')}</p>
        <Button variant="outline" onClick={() => void retry()}>
          {t('retry')}
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <p className="text-muted-foreground border-b border-border/50 px-4 py-3 text-sm">
        {t('registration.description')}
      </p>
      <div className="flex items-center gap-3 border-b border-border/50 px-4 py-3 opacity-60">
        <Checkbox checked disabled aria-label={t('registration.base')} />
        <span className="text-sm font-medium">{t('registration.base')}</span>
        <code className="text-muted-foreground ml-auto text-xs">default:user</code>
      </div>
      {loading && <p className="text-muted-foreground px-4 py-3 text-sm">…</p>}
      {!loading && groups.length === 0 && (
        <p className="text-muted-foreground px-4 py-3 text-sm">{t('registration.empty')}</p>
      )}
      {groups.map(group => (
        <RegistrationRoleGroup
          key={group.id}
          group={group}
          selected={selected}
          disabled={saving}
          onToggle={toggle}
          onToggleGroup={checked => toggleGroup(group, checked)}
        />
      ))}
      <div className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-end">
        {failed && <p className="text-destructive text-sm">{t('registration.saveError')}</p>}
        <Button className="min-h-11 sm:min-h-9" disabled={!dirty || saving} onClick={() => void submit()}>
          {t('registration.save')}
        </Button>
      </div>
    </div>
  );
};
