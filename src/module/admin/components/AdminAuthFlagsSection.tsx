import { Switch } from '@ui/shad-cn/components/switch';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { type IAppAuthFlags, useAppAuthFlags } from '../hooks/use.app.auth.flags';

const ROWS: { key: keyof IAppAuthFlags; label: string }[] = [
  { key: 'allowRegister', label: 'registration.allowRegister' },
  { key: 'allowLoginWithGoogle', label: 'registration.allowGoogle' },
];

/** Top of the `Registrierung` tab: sign-up and Google login on or off. Saves at once. */
export const AdminAuthFlagsSection: React.FC = () => {
  const { t } = useTranslation('admin');
  const { loading, saving, error, flags, save } = useAppAuthFlags();
  const [failed, setFailed] = useState(false);

  const toggle = async (key: keyof IAppAuthFlags, value: boolean) => {
    setFailed(false);
    const ok = await save({ [key]: value });
    setFailed(!ok);
  };

  return (
    <div className="flex flex-col border-b border-border/50">
      <p className="px-4 pt-3 text-sm font-medium">{t('registration.signIn')}</p>
      {ROWS.map(row => (
        <label key={row.key} className="flex min-h-11 items-center justify-between gap-3 px-4 py-3">
          <span className="text-sm">{t(row.label)}</span>
          <Switch
            checked={flags[row.key]}
            disabled={loading || saving || error}
            onCheckedChange={value => void toggle(row.key, value)}
          />
        </label>
      ))}
      {(error || failed) && (
        <p className="text-destructive px-4 pb-3 text-sm">
          {t(error ? 'registration.error' : 'registration.saveError')}
        </p>
      )}
    </div>
  );
};
