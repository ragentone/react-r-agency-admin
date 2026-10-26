import { Button } from '@ui/shad-cn/components/button.tsx';
import { Spinner } from '@ui/shad-cn/components/spinner.tsx';
import { Fingerprint, KeyRound, Mail, ShieldCheck } from 'lucide-react';
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { AuthApi } from '../api';
import { useErrorText } from '../hooks/use.error.text';
import { useOnOpen } from '../hooks/use.on.open';
import { useSudoStore } from '../sudo';
import type { IAuthResult, IAuthSecurity } from '../types';
import { passkeyGet, passkeySupported } from '../utils/webauthn';
import { BigButton, CodeField, ErrorNote, PasswordField, SecurityDrawer } from './ui';

type Mode = 'choose' | 'code' | 'totp';

/** Mounted once (account page). Shows the re-authentication drawer for `withSudo`. */
export const SudoHost: React.FC = () => {
  const { t } = useTranslation('security');
  const errorText = useErrorText();
  const pending = useSudoStore(state => state.pending);
  const [security, setSecurity] = useState<IAuthSecurity | null>(null);
  const [mode, setMode] = useState<Mode>('choose');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [codeSent, setCodeSent] = useState(false);

  useOnOpen(Boolean(pending), () => {
    setMode('choose');
    setPassword('');
    setCode('');
    setError(null);
    setCodeSent(false);
    setSecurity(null);
  });

  useEffect(() => {
    if (!pending) return;
    void AuthApi.security().then(result => setSecurity(result.security ?? null));
  }, [pending]);

  const close = useCallback((ok: boolean) => {
    useSudoStore.getState().pending?.(ok);
    useSudoStore.setState({ pending: null });
  }, []);

  const finish = (result: IAuthResult) => {
    setBusy(false);
    if (result.success) {
      close(true);
      return;
    }
    setError(errorText(result));
  };

  const withPasskey = async () => {
    setBusy(true);
    setError(null);
    const options = await AuthApi.sudoPasskeyOptions();
    if (!options.success || !options.challengeId || !options.options) return finish(options);
    const credential = await passkeyGet(options.options);
    if (!credential) {
      setBusy(false);
      return;
    }
    finish(await AuthApi.sudo({ challengeId: options.challengeId, credential }));
  };

  const withPassword = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!password) return;
    setBusy(true);
    setError(null);
    finish(await AuthApi.sudo({ password }));
  };

  const sendCode = async () => {
    setMode('code');
    setCode('');
    setError(null);
    setBusy(true);
    const result = await AuthApi.sudoCodeSend();
    setBusy(false);
    setCodeSent(result.success);
    if (!result.success) setError(errorText(result));
  };

  const submitCode = async (value: string) => {
    setBusy(true);
    setError(null);
    const result = await AuthApi.sudo(mode === 'totp' ? { totp: value } : { code: value });
    if (!result.success) setCode('');
    finish(result);
  };

  const canPasskey = Boolean(security?.passkeys.length) && passkeySupported();

  return (
    <SecurityDrawer
      open={Boolean(pending)}
      onOpenChange={open => !open && close(false)}
      title={t('sudo.title')}
      description={t('sudo.description')}
      locked={busy}
      compact
      onBack={mode !== 'choose' ? () => setMode('choose') : undefined}
    >
      <div className="flex flex-col gap-4 px-4 pt-4 pb-[max(env(safe-area-inset-bottom),1.25rem)]">
        <div className="flex items-start gap-3">
          <ShieldCheck aria-hidden="true" className="mt-0.5 size-6 shrink-0" strokeWidth={1.75} />
          <p className="text-body leading-5 text-muted-foreground">{t('sudo.text')}</p>
        </div>

        {!security && (
          <div className="flex justify-center py-6">
            <Spinner />
          </div>
        )}

        {security && mode === 'choose' && (
          <>
            {canPasskey && (
              <BigButton onClick={withPasskey} disabled={busy}>
                <Fingerprint />
                {t('sudo.passkey')}
              </BigButton>
            )}
            {security.hasPassword && (
              <form onSubmit={withPassword} className="flex flex-col gap-3" noValidate>
                <PasswordField
                  autoComplete="current-password"
                  value={password}
                  onChange={event => setPassword(event.target.value)}
                  placeholder={t('sudo.password')}
                  aria-label={t('sudo.password')}
                  disabled={busy}
                />
                <BigButton
                  type="submit"
                  variant={canPasskey ? 'outline' : 'default'}
                  disabled={busy || !password}
                  isLoading={busy}
                >
                  {t('sudo.confirm')}
                </BigButton>
              </form>
            )}
            <ErrorNote message={error} />
            <div className="flex flex-col gap-1">
              <Button
                variant="ghost"
                pill
                className="h-11 justify-start gap-3"
                onClick={sendCode}
                disabled={busy}
              >
                <Mail />
                {t('sudo.code', { email: security.email })}
              </Button>
              {security.totpEnabled && (
                <Button
                  variant="ghost"
                  pill
                  className="h-11 justify-start gap-3"
                  onClick={() => {
                    setMode('totp');
                    setCode('');
                    setError(null);
                  }}
                  disabled={busy}
                >
                  <KeyRound />
                  {t('sudo.totp')}
                </Button>
              )}
            </div>
          </>
        )}

        {security && mode !== 'choose' && (
          <div className="flex flex-col items-center gap-4 py-2">
            <p className="text-center text-body leading-5 text-muted-foreground">
              {mode === 'totp'
                ? t('sudo.totpText')
                : codeSent
                  ? t('sudo.codeSent', { email: security.email })
                  : t('sudo.codeSending')}
            </p>
            <CodeField
              value={code}
              onChange={setCode}
              onComplete={submitCode}
              disabled={busy}
              invalid={Boolean(error)}
              label={t('common.code')}
            />
            <ErrorNote message={error} className="text-center" />
            {mode === 'code' && (
              <Button variant="ghost" pill onClick={sendCode} disabled={busy}>
                {t('common.resend')}
              </Button>
            )}
          </div>
        )}
      </div>
    </SecurityDrawer>
  );
};
