import { Input } from '@ui/shad-cn/components/input.tsx';
import { Mail } from 'lucide-react';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { AuthApi } from '../api';
import { useErrorText } from '../hooks/use.error.text';
import { useOnOpen } from '../hooks/use.on.open';
import { withSudo } from '../sudo';
import { BigButton, CodeField, ErrorNote, InfoBox, SecurityDrawer } from './ui';

/** New e-mail address: enter → code to the new address → confirmed. */
export const EmailDrawer: React.FC<{
  open: boolean;
  onOpenChange: (open: boolean) => void;
  current: string | null;
  onChanged?: (email: string) => void;
}> = ({ open, onOpenChange, current, onChanged }) => {
  const { t } = useTranslation('security');
  const errorText = useErrorText();
  const [email, setEmail] = useState('');
  const [step, setStep] = useState<'email' | 'code'>('email');
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useOnOpen(open, () => {
    setEmail('');
    setStep('email');
    setCode('');
    setError(null);
  });

  const send = async (event?: React.FormEvent) => {
    event?.preventDefault();
    if (!email.trim()) return;
    setBusy(true);
    setError(null);
    const result = await withSudo(() => AuthApi.emailChange(email.trim()));
    setBusy(false);
    if (result.error === 'sudo_required') return;
    if (!result.success) {
      setError(errorText(result));
      return;
    }
    setCode('');
    setStep('code');
  };

  const confirm = async (value: string) => {
    setBusy(true);
    setError(null);
    const result = await withSudo(() => AuthApi.emailConfirm(value));
    setBusy(false);
    if (result.error === 'sudo_required') return;
    if (!result.success) {
      setCode('');
      setError(errorText(result));
      return;
    }
    toast.success(t('email.changed'));
    onChanged?.(result.email ?? email);
    onOpenChange(false);
  };

  return (
    <SecurityDrawer
      open={open}
      onOpenChange={onOpenChange}
      title={t('email.title')}
      description={t('email.description')}
      locked={busy}
      compact
      onBack={step === 'code' ? () => setStep('email') : undefined}
    >
      <div className="flex flex-col gap-4 px-4 pt-4 pb-[max(env(safe-area-inset-bottom),1.25rem)]">
        {step === 'email' ? (
          <form onSubmit={send} className="flex flex-col gap-4" noValidate>
            {current && <InfoBox icon={Mail}>{t('email.current', { email: current })}</InfoBox>}
            <Input
              type="email"
              inputMode="email"
              autoComplete="email"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              value={email}
              onChange={event => setEmail(event.target.value)}
              placeholder={t('email.new')}
              aria-label={t('email.new')}
              aria-invalid={Boolean(error) || undefined}
              className="h-12 rounded-full px-4 text-[17px]"
              disabled={busy}
            />
            <ErrorNote message={error} />
            <BigButton type="submit" isLoading={busy} disabled={busy || !email.trim()}>
              {t('email.send')}
            </BigButton>
          </form>
        ) : (
          <div className="flex flex-col items-center gap-4">
            <p className="text-center text-body leading-5 text-muted-foreground">
              {t('email.codeSent', { email: email.trim() })}
            </p>
            <CodeField
              value={code}
              onChange={setCode}
              onComplete={confirm}
              disabled={busy}
              invalid={Boolean(error)}
              label={t('common.code')}
            />
            <ErrorNote message={error} className="text-center" />
            <BigButton variant="ghost" onClick={() => send()} disabled={busy}>
              {t('common.resend')}
            </BigButton>
          </div>
        )}
      </div>
    </SecurityDrawer>
  );
};
