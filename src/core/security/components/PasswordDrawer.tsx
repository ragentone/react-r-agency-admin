import { Check, Circle } from 'lucide-react';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { AuthApi } from '../api';
import { useErrorText } from '../hooks/use.error.text';
import { useOnOpen } from '../hooks/use.on.open';
import { withSudo } from '../sudo';
import { passwordValid } from '../utils/password';
import { BigButton, ErrorNote, PasswordField, SecurityDrawer } from './ui';

/** Rules shown live while typing (the server checks the same + data leaks). */
export const PasswordRules: React.FC<{ password: string }> = ({ password }) => {
  const { t } = useTranslation('security');
  const rules = [
    { ok: password.length >= 8, label: t('password.ruleLength') },
    { ok: /[A-Za-z]/.test(password) && /\d/.test(password), label: t('password.ruleMix') },
  ];
  return (
    <ul className="flex flex-col gap-1.5" aria-live="polite">
      {rules.map(rule => (
        <li key={rule.label} className="flex items-center gap-2 text-caption leading-4">
          {rule.ok ? (
            <Check aria-hidden="true" className="size-4" />
          ) : (
            <Circle aria-hidden="true" className="size-4 text-muted-foreground" />
          )}
          <span className={rule.ok ? 'text-foreground' : 'text-muted-foreground'}>
            {rule.label}
          </span>
        </li>
      ))}
    </ul>
  );
};

/** Set a (new) password without the old one – identity confirmed via sudo instead. */
export const PasswordDrawer: React.FC<{
  open: boolean;
  onOpenChange: (open: boolean) => void;
  hasPassword: boolean;
  onChanged?: () => void;
}> = ({ open, onOpenChange, hasPassword, onChanged }) => {
  const { t } = useTranslation('security');
  const errorText = useErrorText();
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useOnOpen(open, () => {
    setPassword('');
    setError(null);
  });

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!passwordValid(password)) return;
    setBusy(true);
    setError(null);
    const result = await withSudo(() => AuthApi.passwordSet(password));
    setBusy(false);
    if (result.error === 'sudo_required') return;
    if (!result.success) {
      setError(errorText(result));
      return;
    }
    toast.success(t('password.saved'));
    onChanged?.();
    onOpenChange(false);
  };

  return (
    <SecurityDrawer
      open={open}
      onOpenChange={onOpenChange}
      title={hasPassword ? t('password.titleChange') : t('password.titleSet')}
      description={t('password.description')}
      locked={busy}
      compact
    >
      <form
        onSubmit={save}
        className="flex flex-col gap-4 px-4 pt-4 pb-[max(env(safe-area-inset-bottom),1.25rem)]"
        noValidate
      >
        <p className="text-body leading-5 text-muted-foreground">
          {hasPassword ? t('password.textChange') : t('password.textSet')}
        </p>
        <PasswordField
          autoComplete="new-password"
          value={password}
          onChange={event => setPassword(event.target.value)}
          placeholder={t('password.new')}
          aria-label={t('password.new')}
          aria-invalid={Boolean(error) || undefined}
          maxLength={64}
          disabled={busy}
        />
        <PasswordRules password={password} />
        <ErrorNote message={error} />
        <BigButton type="submit" isLoading={busy} disabled={busy || !passwordValid(password)}>
          {t('common.save')}
        </BigButton>
      </form>
    </SecurityDrawer>
  );
};
