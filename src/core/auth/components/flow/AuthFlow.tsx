import { useAuth } from '@core/auth/components/use.auth.ts';
import { AuthApi } from '@core/security/api';
import { PasswordRules } from '@core/security/components/PasswordDrawer.tsx';
import {
  BigButton,
  CodeField,
  ErrorNote,
  InfoBox,
  PasswordField,
} from '@core/security/components/ui.tsx';
import { useErrorText } from '@core/security/hooks/use.error.text.ts';
import { passkeyPromptDismissed } from '@core/security/store.ts';
import type { IAuthIdentifyResult, IAuthLoginResult } from '@core/security/types.ts';
import { formatDate } from '@core/security/utils/format.ts';
import { passwordValid } from '@core/security/utils/password.ts';
import {
  passkeyAbortAutofill,
  passkeyAutofillSupported,
  passkeyGet,
  passkeySupported,
} from '@core/security/utils/webauthn.ts';
import { Button } from '@ui/shad-cn/components/button.tsx';
import { Input } from '@ui/shad-cn/components/input.tsx';
import { ArrowBigUp, ArrowLeft, Fingerprint, KeyRound, Mail, ShieldAlert } from 'lucide-react';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

type Step = 'identify' | 'password' | 'code' | 'totp' | 'reset';
type Purpose = 'login' | 'reset';

const RESEND_SECONDS = 30;
/** From this many wrong passwords on, the ways without a password become big buttons. */
const TROUBLE_AFTER = 2;

/** `95` → `1:35` */
const clock = (seconds: number): string =>
  `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;

/** Caps Lock state from a key event (not every browser knows it). */
const capsLockOn = (event: React.KeyboardEvent): boolean =>
  typeof event.getModifierState === 'function' && event.getModifierState('CapsLock');

/**
 * Admin sign-in (like X): one field "e-mail or user name" → the server says which way works
 * (passkey, password, e-mail code) → optional second factor → signed in.
 * No sign-up and no Google here: unknown accounts get an error, Google-only accounts the e-mail code.
 */
export const AuthFlow: React.FC = () => {
  const { t, i18n } = useTranslation('security');
  const errorText = useErrorText();
  const { completeLogin } = useAuth();

  const [step, setStep] = useState<Step>('identify');
  const [identifier, setIdentifier] = useState('');
  const [info, setInfo] = useState<IAuthIdentifyResult | null>(null);
  const [purpose, setPurpose] = useState<Purpose>('login');
  const [ticket, setTicket] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [recovery, setRecovery] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [banReason, setBanReason] = useState<string | null>(null);
  const [resendIn, setResendIn] = useState(0);
  /** Wrong passwords in this flow (only for the hints, the server decides). */
  const [passwordFails, setPasswordFails] = useState(0);
  /** The server asked for the e-mail code instead of the password (step-up). */
  const [stepUp, setStepUp] = useState(false);
  const [capsLock, setCapsLock] = useState(false);
  /** Rate limit: no new attempt before this time (ms), shown as countdown. */
  const [waitUntil, setWaitUntil] = useState(0);
  const [now, setNow] = useState(() => Date.now());

  /** New password of the reset step. */
  const [newPassword, setNewPassword] = useState('');

  const usedPasskey = useRef(false);
  const canPasskey = passkeySupported();

  // Countdown of a rate limit; when it is over the "too many attempts" note disappears.
  const waitLeft = waitUntil > now ? Math.ceil((waitUntil - now) / 1000) : 0;
  useEffect(() => {
    if (!waitUntil) return;
    const timer = window.setTimeout(
      () => {
        const current = Date.now();
        if (current >= waitUntil) {
          setWaitUntil(0);
          setError(null);
        }
        setNow(current);
      },
      Math.min(1000, Math.max(0, waitUntil - Date.now()))
    );
    return () => window.clearTimeout(timer);
  }, [now, waitUntil]);

  /** `true` when the result carries a wait time (then the countdown takes over). */
  const applyWait = useCallback(
    (result: { retryAfter?: number | null }) => {
      if (!result.retryAfter || result.retryAfter <= 0) return false;
      const start = Date.now();
      setNow(start);
      setWaitUntil(start + result.retryAfter * 1000);
      setError(t('flow.tooMany'));
      return true;
    },
    [t]
  );

  useEffect(() => {
    if (resendIn <= 0) return;
    const timer = window.setTimeout(() => setResendIn(value => value - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [resendIn]);

  const reset = (next: Step) => {
    setError(null);
    setBanReason(null);
    setFieldError(null);
    setCode('');
    setStep(next);
  };

  // ---- result of every sign-in call ----
  const handle = useCallback(
    async (result: IAuthLoginResult, method: 'passkey' | 'other' = 'other') => {
      if (!result.success) {
        if (result.error === 'banned') {
          setError(
            result.bannedUntil
              ? t('flow.bannedUntil', { date: formatDate(result.bannedUntil, i18n.language) })
              : t('flow.banned')
          );
          setBanReason(result.banReason ?? null);
          return;
        }
        setFieldError(result.field ?? null);
        if (applyWait(result)) return;
        setError(errorText(result));
        return;
      }
      if (result.step === 'totp' && result.ticket) {
        setTicket(result.ticket);
        setRecovery(false);
        reset('totp');
        return;
      }
      if (result.step === 'register') {
        // No sign-up in the admin.
        setError(t('flow.adminNoAccount'));
        reset('identify');
        return;
      }
      if (result.step === 'reset' && result.ticket) {
        setTicket(result.ticket);
        setNewPassword('');
        reset('reset');
        return;
      }
      if (result.step === 'done' && result.authToken) {
        passkeyAbortAutofill();
        await completeLogin(result, {
          offerPasskey:
            method !== 'passkey' &&
            !usedPasskey.current &&
            canPasskey &&
            !info?.methods?.passkey &&
            !passkeyPromptDismissed(),
        });
      }
    },
    [applyWait, canPasskey, completeLogin, errorText, i18n.language, info, t]
  );

  // ---- passkey (button or autofill) ----
  const signInWithPasskey = useCallback(
    async (forIdentifier: string | null, conditional = false) => {
      if (!conditional) setBusy(true);
      setError(null);
      const options = await AuthApi.passkeyOptions(forIdentifier);
      if (!options.success || !options.challengeId || !options.options) {
        if (!conditional) {
          setBusy(false);
          setError(errorText(options));
        }
        return;
      }
      const credential = await passkeyGet(options.options, conditional);
      if (!credential) {
        if (!conditional) setBusy(false);
        return;
      }
      setBusy(true);
      usedPasskey.current = true;
      const result = await AuthApi.passkeyLogin(options.challengeId, credential);
      setBusy(false);
      await handle(result, 'passkey');
    },
    [errorText, handle]
  );

  // Autofill: passkeys appear in the keyboard suggestions of the identifier field.
  useEffect(() => {
    if (step !== 'identify') return;
    let active = true;
    void passkeyAutofillSupported().then(supported => {
      if (supported && active) void signInWithPasskey(null, true);
    });
    return () => {
      active = false;
      passkeyAbortAutofill();
    };
  }, [step, signInWithPasskey]);

  // ---- steps ----
  const sendCode = async (value: string, nextPurpose: Purpose) => {
    setBusy(true);
    setError(null);
    const result = await AuthApi.codeSend(value, nextPurpose);
    setBusy(false);
    if (!result.success) {
      if (!applyWait(result)) setError(errorText(result));
      return false;
    }
    setPurpose(nextPurpose);
    setResendIn(RESEND_SECONDS);
    reset('code');
    return true;
  };

  const submitIdentifier = async (event: React.FormEvent) => {
    event.preventDefault();
    const value = identifier.trim();
    if (!value) return;
    passkeyAbortAutofill();
    setBusy(true);
    setError(null);
    setFieldError(null);
    const result = await AuthApi.identify(value);
    setBusy(false);
    if (!result.success) {
      if (!applyWait(result)) setError(errorText(result));
      setFieldError('identifier');
      return;
    }
    setInfo(result);
    setPasswordFails(0);
    setStepUp(false);
    if (!result.exists) {
      setError(t('flow.adminNoAccount'));
      setFieldError('identifier');
      return;
    }
    const methods = result.methods;
    if (methods?.password) {
      setPassword('');
      reset('password');
      return;
    }
    await sendCode(value, 'login');
  };

  const submitPassword = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!password) return;
    setBusy(true);
    setError(null);
    const result = await AuthApi.password(identifier.trim(), password);
    setBusy(false);
    if (!result.success) setPassword('');
    if (result.error === 'code_required') {
      // Step-up: continue with the e-mail code (shows the reason on the code step).
      setStepUp(true);
      if (!(await sendCode(identifier.trim(), 'login'))) setFieldError('password');
      return;
    }
    if (result.error === 'invalid_password') setPasswordFails(count => count + 1);
    await handle(result);
  };

  const trackCapsLock = (event: React.KeyboardEvent) => setCapsLock(capsLockOn(event));
  const capsLockNote = capsLock ? (
    <p className="flex items-center gap-2 px-4 text-caption leading-4 font-bold" aria-live="polite">
      <ArrowBigUp aria-hidden="true" className="size-4 shrink-0" />
      {t('flow.capsLock')}
    </p>
  ) : null;
  const waitLabel = waitLeft > 0 ? t('flow.retryIn', { time: clock(waitLeft) }) : null;
  const trouble = passwordFails >= TROUBLE_AFTER;

  const submitCode = async (value: string) => {
    setBusy(true);
    setError(null);
    const result = await AuthApi.codeVerify(identifier.trim(), purpose, value);
    setBusy(false);
    if (!result.success) setCode('');
    await handle(result);
  };

  const submitTotp = async (value: string) => {
    if (!value.trim()) return;
    setBusy(true);
    setError(null);
    const result = await AuthApi.totp(ticket, value.trim());
    setBusy(false);
    if (!result.success) setCode('');
    if (result.error === 'expired') {
      setError(t('flow.expired'));
      reset('identify');
      return;
    }
    await handle(result);
  };

  const submitReset = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!passwordValid(newPassword)) return;
    setBusy(true);
    setError(null);
    const result = await AuthApi.reset(ticket, newPassword);
    setBusy(false);
    if (result.error === 'expired') {
      setError(t('flow.expired'));
      reset('identify');
      return;
    }
    await handle(result);
  };

  // ---- view ----
  const headline: Record<Step, string> = {
    identify: t('flow.adminTitle'),
    password: t('flow.passwordTitle'),
    code: t('flow.codeTitle'),
    totp: t('flow.totpTitle'),
    reset: t('flow.resetTitle'),
  };

  const shownEmail = info?.email ?? (identifier.includes('@') ? identifier.trim() : '');

  const identifierChip = (
    <button
      type="button"
      onClick={() => reset('identify')}
      disabled={busy}
      className="mb-5 inline-flex max-w-full items-center gap-2 self-start rounded-full border border-border/60 py-1.5 pr-3 pl-3 text-body active:bg-foreground/[0.06]"
      aria-label={t('flow.change')}
    >
      <span className="truncate font-medium">{identifier.trim()}</span>
      <span className="shrink-0 text-muted-foreground">· {t('flow.change')}</span>
    </button>
  );

  const passkeyButton = (forIdentifier: string | null, primary = false) =>
    canPasskey ? (
      <BigButton
        type="button"
        variant={primary ? 'default' : 'outline'}
        onClick={() => void signInWithPasskey(forIdentifier)}
        disabled={busy}
      >
        <Fingerprint />
        {t('flow.passkey')}
      </BigButton>
    ) : null;

  return (
    <div className="flex flex-col">
      {step !== 'identify' && (
        <Button
          variant="ghost"
          pill
          className="-ml-3 mb-3 h-10 w-fit gap-1.5 px-3"
          onClick={() => reset('identify')}
          disabled={busy}
        >
          <ArrowLeft />
          {t('common.back')}
        </Button>
      )}

      <h1 className="mb-2 text-[31px] leading-9 font-extrabold tracking-tight text-foreground sm:text-4xl">
        {headline[step]}
      </h1>

      {step === 'identify' && (
        <>
          <p className="mb-6 text-body leading-5 text-muted-foreground">{t('flow.identifyText')}</p>
          <form onSubmit={submitIdentifier} className="flex flex-col gap-3" noValidate>
            <Input
              type="text"
              inputMode="email"
              name="username"
              autoComplete="username webauthn"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              value={identifier}
              onChange={event => setIdentifier(event.target.value)}
              placeholder={t('flow.identifier')}
              aria-label={t('flow.identifier')}
              aria-invalid={fieldError === 'identifier' || undefined}
              className="h-12 rounded-full px-4 text-[17px]"
              disabled={busy}
            />
            <ErrorNote message={error} />
            <BigButton
              type="submit"
              isLoading={busy}
              disabled={busy || waitLeft > 0 || !identifier.trim()}
            >
              {waitLabel ?? t('flow.next')}
            </BigButton>
          </form>
          {canPasskey && (
            <>
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                  <span className="w-full border-t border-border/60" />
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-background px-3 text-body text-muted-foreground">
                    {t('flow.or')}
                  </span>
                </div>
              </div>
              {passkeyButton(null)}
            </>
          )}
          <p className="mt-6 text-caption leading-4 text-muted-foreground">{t('flow.adminHint')}</p>
        </>
      )}

      {step === 'password' && (
        <>
          {identifierChip}
          <form onSubmit={submitPassword} className="flex flex-col gap-3" noValidate>
            {/* Hidden user name → password managers save the right account. */}
            <input
              type="text"
              name="username"
              autoComplete="username"
              value={identifier}
              readOnly
              hidden
            />
            <PasswordField
              autoComplete="current-password"
              value={password}
              onChange={event => setPassword(event.target.value)}
              onKeyDown={trackCapsLock}
              onKeyUp={trackCapsLock}
              onBlur={() => setCapsLock(false)}
              placeholder={t('flow.password')}
              aria-label={t('flow.password')}
              aria-invalid={fieldError === 'password' || undefined}
              autoFocus
              disabled={busy}
            />
            {capsLockNote}
            <ErrorNote message={error} />
            <BigButton type="submit" isLoading={busy} disabled={busy || waitLeft > 0 || !password}>
              {waitLabel ?? t('flow.signIn')}
            </BigButton>
          </form>
          {trouble ? (
            // After a few wrong passwords: the ways without a password, big and first.
            <div className="mt-6 flex flex-col gap-3">
              <p className="text-body leading-5 font-bold">{t('flow.troubleText')}</p>
              {info?.methods?.passkey && passkeyButton(identifier.trim(), true)}
              <BigButton
                type="button"
                variant={info?.methods?.passkey && canPasskey ? 'outline' : 'default'}
                onClick={() => void sendCode(identifier.trim(), 'login')}
                disabled={busy}
              >
                <Mail />
                {t('flow.useCode')}
              </BigButton>
              <BigButton
                type="button"
                variant="outline"
                onClick={() => void sendCode(identifier.trim(), 'reset')}
                disabled={busy}
              >
                <KeyRound />
                {t('flow.forgot')}
              </BigButton>
            </div>
          ) : (
            <div className="mt-3 flex flex-col gap-3">
              {info?.methods?.passkey && passkeyButton(identifier.trim())}
              <Button
                variant="ghost"
                pill
                className="h-11 font-bold"
                onClick={() => void sendCode(identifier.trim(), 'login')}
                disabled={busy}
              >
                <Mail />
                {t('flow.useCode')}
              </Button>
              <Button
                variant="ghost"
                pill
                className="h-11 font-bold"
                onClick={() => void sendCode(identifier.trim(), 'reset')}
                disabled={busy}
              >
                <KeyRound />
                {t('flow.forgot')}
              </Button>
            </div>
          )}
        </>
      )}

      {step === 'code' && (
        <>
          {stepUp && purpose === 'login' && (
            <InfoBox icon={ShieldAlert} className="mb-4">
              {t('flow.codeRequired')}
            </InfoBox>
          )}
          <p className="mb-6 text-body leading-5 text-muted-foreground">
            {t('flow.codeText', { email: shownEmail })}
          </p>
          <div className="flex flex-col items-center gap-4">
            <CodeField
              value={code}
              onChange={setCode}
              onComplete={submitCode}
              disabled={busy || waitLeft > 0}
              invalid={Boolean(error)}
              label={t('common.code')}
            />
            <ErrorNote message={error} className="text-center" />
            {waitLabel && (
              <p
                className="text-center text-body leading-5 text-muted-foreground"
                aria-live="polite"
              >
                {waitLabel}
              </p>
            )}
            <Button
              variant="ghost"
              pill
              className="h-11 font-bold"
              onClick={() => void sendCode(identifier.trim(), purpose)}
              disabled={busy || resendIn > 0}
            >
              {resendIn > 0 ? t('flow.resendIn', { count: resendIn }) : t('common.resend')}
            </Button>
          </div>
          {purpose === 'login' && (
            <div className="mt-4 flex flex-col gap-3">
              {info?.methods?.passkey && passkeyButton(identifier.trim(), true)}
              {info?.methods?.password && !stepUp && (
                <Button
                  variant="outline"
                  pill
                  className="h-12 font-bold"
                  onClick={() => reset('password')}
                  disabled={busy}
                >
                  {t('flow.usePassword')}
                </Button>
              )}
            </div>
          )}
          <p className="mt-6 text-caption leading-4 text-muted-foreground">{t('flow.codeHint')}</p>
        </>
      )}

      {step === 'totp' && (
        <>
          <p className="mb-6 text-body leading-5 text-muted-foreground">
            {recovery ? t('flow.recoveryText') : t('flow.totpText')}
          </p>
          {recovery ? (
            <form
              onSubmit={event => {
                event.preventDefault();
                void submitTotp(code);
              }}
              className="flex flex-col gap-3"
              noValidate
            >
              <Input
                value={code}
                onChange={event => setCode(event.target.value)}
                placeholder="abcd-efgh"
                aria-label={t('flow.recovery')}
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                autoComplete="off"
                className="h-12 rounded-full px-4 text-center font-mono text-[17px] tracking-wider"
                autoFocus
                disabled={busy}
              />
              <ErrorNote message={error} />
              <BigButton type="submit" isLoading={busy} disabled={busy || code.trim().length < 8}>
                {t('flow.signIn')}
              </BigButton>
            </form>
          ) : (
            <div className="flex flex-col items-center gap-4">
              <CodeField
                value={code}
                onChange={setCode}
                onComplete={submitTotp}
                disabled={busy || waitLeft > 0}
                invalid={Boolean(error)}
                label={t('common.code')}
              />
              <ErrorNote message={error} className="text-center" />
              {waitLabel && (
                <p
                  className="text-center text-body leading-5 text-muted-foreground"
                  aria-live="polite"
                >
                  {waitLabel}
                </p>
              )}
            </div>
          )}
          <Button
            variant="ghost"
            pill
            className="mt-4 h-11 font-bold"
            onClick={() => {
              setRecovery(value => !value);
              setCode('');
              setError(null);
            }}
            disabled={busy}
          >
            {recovery ? t('flow.useTotp') : t('flow.useRecovery')}
          </Button>
        </>
      )}

      {step === 'reset' && (
        <form onSubmit={submitReset} className="flex flex-col gap-3" noValidate>
          <p className="mb-3 text-body leading-5 text-muted-foreground">{t('flow.resetText')}</p>
          <input
            type="text"
            name="username"
            autoComplete="username"
            value={identifier}
            readOnly
            hidden
          />
          <PasswordField
            autoComplete="new-password"
            value={newPassword}
            onChange={event => setNewPassword(event.target.value)}
            onKeyDown={trackCapsLock}
            onKeyUp={trackCapsLock}
            onBlur={() => setCapsLock(false)}
            placeholder={t('password.new')}
            aria-label={t('password.new')}
            maxLength={64}
            autoFocus
            disabled={busy}
          />
          {capsLockNote}
          <PasswordRules password={newPassword} />
          <ErrorNote message={error} />
          <BigButton type="submit" isLoading={busy} disabled={busy || !passwordValid(newPassword)}>
            {t('flow.resetSave')}
          </BigButton>
        </form>
      )}

      {banReason && (
        <p className="mt-3 text-body leading-5 text-muted-foreground">
          {t('flow.banReason', { reason: banReason })}
        </p>
      )}
    </div>
  );
};
