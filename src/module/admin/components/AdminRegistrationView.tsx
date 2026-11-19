import { Button } from '@ui/shad-cn/components/button';
import { Checkbox } from '@ui/shad-cn/components/checkbox';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useRegistrationRoles } from '../hooks/use.registration.roles';

/** `Registrierung` tab: which roles every new account gets. */
export const AdminRegistrationView: React.FC = () => {
  const { t } = useTranslation('admin');
  const { loading, saving, error, roles, options, save, retry } = useRegistrationRoles();
  const [draft, setDraft] = useState<string[] | null>(null);
  const [failed, setFailed] = useState(false);
  const selected = draft ?? roles;
  const dirty = draft !== null;

  const toggle = (role: string, checked: boolean) => {
    setFailed(false);
    setDraft(prev => {
      const base = (prev ?? roles).filter(item => item !== role);
      return checked ? [...base, role] : base;
    });
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
      {!loading && options.length === 0 && (
        <p className="text-muted-foreground px-4 py-3 text-sm">{t('registration.empty')}</p>
      )}
      {options.map(option => (
        <label
          key={option.role}
          className="hover:bg-muted/50 flex min-h-11 cursor-pointer items-center gap-3 border-b border-border/50 px-4 py-3"
        >
          <Checkbox
            checked={selected.includes(option.role)}
            disabled={saving}
            onCheckedChange={value => toggle(option.role, value === true)}
          />
          <span className="text-sm font-medium">{option.label}</span>
          <code className="text-muted-foreground ml-auto truncate text-xs">{option.role}</code>
        </label>
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
