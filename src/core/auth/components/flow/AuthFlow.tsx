import { useAuth } from '@core/auth/components/use.auth.ts';
import { AuthApi } from '@core/security/api';
import { BigButton, CodeField, ErrorNote, PasswordField } from '@core/security/components/ui.tsx';
import { useErrorText } from '@core/security/hooks/use.error.text.ts';
import { passkeyPromptDismissed } from '@core/security/store.ts';
import type { IAuthIdentifyResult, IAuthLoginResult } from '@core/security/types.ts';
import { formatDate } from '@core/security/utils/format.ts';
import {
  passkeyAbortAutofill,
  passkeyAutofillSupported,
  passkeyGet,
  passkeySupported,
} from '@core/security/utils/webauthn.ts';
import { Alert, AlertDescription, AlertTitle } from '@ui/shad-cn/components/alert.tsx';
import { Button } from '@ui/shad-cn/components/button.tsx';
import { Input } from '@ui/shad-cn/components/input.tsx';
import { ArrowBigUp, ArrowLeft, Fingerprint, RotateCw, ShieldX } from 'lucide-react';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

type Step = 'identify' | 'password' | 'totp';

/**
 * Sign-in form locked for the rest of this page load: a non-admin account tried to sign in.
 * Module state on purpose – it survives remounts and navigation, only a reload frees it.
 */
let lockedUntilReload = false;

/** `95` → `1:35` */
const clock = (seconds: number): string =>
  `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;

/** Caps Lock state from a key event (not every browser knows it). */
const capsLockOn = (event: React.KeyboardEvent): boolean =>
  typeof event.getModifierState === 'function' && event.getModifierState('CapsLock');

/**
 * Admin sign-in (like X): "e-mail or user name" → password or passkey → optional 2FA.
 * No sign-up, no Google, no e-mail codes (runtime shared/auth, scope `admin`).
 *
 * Non-admin account: the runtime answers `admin_required` (at `identify`, or – if someone gets
 * past it – when the session would be issued). The form is then locked until the page is
 * reloaded. The AuthProvider guard signs out anyone who still ends up signed in.
 */
export const AuthFlow: React.FC = () => {
  const { t, i18n } = useTranslation('security');
  const errorText = useErrorText();
  const { completeLogin } = useAuth();

  const [locked, setLocked] = useState(lockedUntilReload);
  const [step, setStep] = useState<Step>('identify');
  const [identifier, setIdentifier] = useState('');
  const [info, setInfo] = useState<IAuthIdentifyResult | null>(null);
  const [ticket, setTicket] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [recovery, setRecovery] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [banReason, setBanReason] = useState<string | null>(null);
  const [capsLock, setCapsLock] = useState(false);
  /** Rate limit: no new attempt before this time (ms), shown as countdown. */
  const [waitUntil, setWaitUntil] = useState(0);
  const [now, setNow] = useState(() => Date.now());

  const usedPasskey = useRef(false);
  const canPasskey = passkeySupported();

  const lock = useCallback(() => {
    lockedUntilReload = true;
    passkeyAbortAutofill();
    setPassword('');
    setCode('');
    setLocked(true);
  }, []);

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
        if (result.error === 'admin_required') {
          lock();
          return;
        }
        if (result.error === 'banned') {
          setError(
            result.bannedUntil
              ? t('flow.bannedUntil', { date: formatDate(result.bannedUntil, i18n.language) })
              : t('flow.banned')
          );
          setBanReason(result.banReason ?? null);
          return;
        }
        // Step-up after wrong passwords needs the e-mail code – not available in the admin.
        if (result.error === 'code_required') {
          setFieldError('password');
          setError(t('flow.adminCodeRequired'));
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
        return;
      }
      // Any other step (sign-up, reset) does not exist in the admin.
      setError(t('errors.unknown'));
    },
    [applyWait, canPasskey, completeLogin, errorText, i18n.language, info, lock, t]
  );

  // ---- passkey (button or autofill) ----
  const signInWithPasskey = useCallback(
    async (forIdentifier: string | null, conditional = false) => {
      if (lockedUntilReload) return;
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
    if (step !== 'identify' || locked) return;
    let active = true;
    void passkeyAutofillSupported().then(supported => {
      if (supported && active) void signInWithPasskey(null, true);
    });
    return () => {
      active = false;
      passkeyAbortAutofill();
    };
  }, [locked, step, signInWithPasskey]);

  // ---- steps ----
  const submitIdentifier = async (event: React.FormEvent) => {
    event.preventDefault();
    const value = identifier.trim();
    if (!value || lockedUntilReload) return;
    passkeyAbortAutofill();
    setBusy(true);
    setError(null);
    setFieldError(null);
    const result = await AuthApi.identify(value);
    setBusy(false);
    if (!result.success) {
      if (result.error === 'admin_required') {
        lock();
        return;
      }
      if (!applyWait(result)) setError(errorText(result));
      setFieldError('identifier');
      return;
    }
    setInfo(result);
    if (!result.exists) {
      setError(t('flow.adminNoAccount'));
      setFieldError('identifier');
      return;
    }
    if (result.methods?.password) {
      setPassword('');
      reset('password');
      return;
    }
    // No password: only a passkey works here (no e-mail codes in the admin).
    setFieldError('identifier');
    setError(result.methods?.passkey ? t('flow.adminPasskeyOnly') : t('flow.adminNoPassword'));
  };

  const submitPassword = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!password || lockedUntilReload) return;
    setBusy(true);
    setError(null);
    const result = await AuthApi.password(identifier.trim(), password);
    setBusy(false);
    if (!result.success) setPassword('');
    await handle(result);
  };

  const submitTotp = async (value: string) => {
    if (!value.trim() || lockedUntilReload) return;
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

  const trackCapsLock = (event: React.KeyboardEvent) => setCapsLock(capsLockOn(event));
  const capsLockNote = capsLock ? (
    <p className="flex items-center gap-2 px-4 text-caption leading-4 font-bold" aria-live="polite">
      <ArrowBigUp aria-hidden="true" className="size-4 shrink-0" />
      {t('flow.capsLock')}
    </p>
  ) : null;
  const waitLabel = waitLeft > 0 ? t('flow.retryIn', { time: clock(waitLeft) }) : null;

  // ---- view ----
  if (locked) {
    return (
      <div className="flex flex-col">
        <h1 className="mb-6 text-[31px] leading-9 font-extrabold tracking-tight text-foreground sm:text-4xl">
          {t('flow.adminTitle')}
        </h1>
        <Alert className="mb-6 rounded-2xl border-foreground/20 px-4 py-4">
          <ShieldX aria-hidden="true" className="size-5" />
          <AlertTitle className="text-body font-bold">{t('flow.adminLockedTitle')}</AlertTitle>
          <AlertDescription className="text-body leading-5 text-muted-foreground">
            {t('flow.adminLockedText')}
          </AlertDescription>
        </Alert>
        <fieldset disabled aria-disabled="true" className="flex flex-col gap-3 opacity-50">
          <Input
            value={identifier}
            readOnly
            aria-label={t('flow.identifier')}
            placeholder={t('flow.identifier')}
            className="h-12 rounded-full px-4 text-[17px]"
          />
          <BigButton type="button">{t('flow.next')}</BigButton>
        </fieldset>
        <BigButton
          type="button"
          variant="outline"
          className="mt-6"
          onClick={() => window.location.reload()}
        >
          <RotateCw />
          {t('flow.adminReload')}
        </BigButton>
      </div>
    );
  }

  const headline: Record<Step, string> = {
    identify: t('flow.adminTitle'),
    password: t('flow.passwordTitle'),
    totp: t('flow.totpTitle'),
  };

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
          {info?.methods?.passkey && (
            <div className="mt-4 flex flex-col gap-3">{passkeyButton(identifier.trim())}</div>
          )}
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

      {banReason && (
        <p className="mt-3 text-body leading-5 text-muted-foreground">
          {t('flow.banReason', { reason: banReason })}
        </p>
      )}
    </div>
  );
};
