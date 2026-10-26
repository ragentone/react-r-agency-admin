import { QrCode } from '@ui/base/QrCode.tsx';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@ui/shad-cn/components/alert-dialog.tsx';
import { Button } from '@ui/shad-cn/components/button.tsx';
import { Copy, ExternalLink, KeyRound, ShieldCheck } from 'lucide-react';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { AuthApi } from '../api';
import { useErrorText } from '../hooks/use.error.text';
import { useOnOpen } from '../hooks/use.on.open';
import { withSudo } from '../sudo';
import type { IAuthSecurity } from '../types';
import { RecoveryCodes } from './RecoveryCodes';
import { BigButton, CodeField, ErrorNote, InfoBox, SecurityDrawer } from './ui';

type Step = 'overview' | 'setup' | 'codes';

/** Authenticator app: set up (link + secret → confirm code → recovery codes), renew codes, turn off. */
export const TotpDrawer: React.FC<{
  open: boolean;
  onOpenChange: (open: boolean) => void;
  security: IAuthSecurity | null;
  onChanged?: () => void;
}> = ({ open, onOpenChange, security, onChanged }) => {
  const { t } = useTranslation('security');
  const errorText = useErrorText();
  const [step, setStep] = useState<Step>('overview');
  const [setup, setSetup] = useState<{ secret: string; uri: string } | null>(null);
  const [code, setCode] = useState('');
  const [codes, setCodes] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmOff, setConfirmOff] = useState(false);

  useOnOpen(open, () => {
    setStep('overview');
    setSetup(null);
    setCode('');
    setCodes([]);
    setError(null);
  });

  const start = async () => {
    setBusy(true);
    setError(null);
    const result = await withSudo(() => AuthApi.totpSetup());
    setBusy(false);
    if (result.error === 'sudo_required') return;
    if (!result.success || !result.secret || !result.uri) {
      setError(errorText(result));
      return;
    }
    setSetup({ secret: result.secret, uri: result.uri });
    setStep('setup');
  };

  const enable = async (value: string) => {
    setBusy(true);
    setError(null);
    const result = await withSudo(() => AuthApi.totpEnable(value));
    setBusy(false);
    if (result.error === 'sudo_required') return;
    if (!result.success) {
      setCode('');
      setError(errorText(result));
      return;
    }
    setCodes(result.recoveryCodes ?? []);
    setStep('codes');
    onChanged?.();
  };

  const renew = async () => {
    setBusy(true);
    const result = await withSudo(() => AuthApi.recoveryRenew());
    setBusy(false);
    if (result.error === 'sudo_required') return;
    if (!result.success) {
      toast.error(errorText(result));
      return;
    }
    setCodes(result.recoveryCodes ?? []);
    setStep('codes');
    onChanged?.();
  };

  const disable = async () => {
    setConfirmOff(false);
    setBusy(true);
    const result = await withSudo(() => AuthApi.totpDisable());
    setBusy(false);
    if (result.error === 'sudo_required') return;
    if (!result.success) {
      toast.error(errorText(result));
      return;
    }
    toast.success(t('totp.disabled'));
    onChanged?.();
    onOpenChange(false);
  };

  const copySecret = async () => {
    if (!setup) return;
    try {
      await navigator.clipboard.writeText(setup.secret);
      toast.success(t('common.copied'));
    } catch {
      toast.error(t('errors.unknown'));
    }
  };

  const enabled = Boolean(security?.totpEnabled);
  const grouped = setup?.secret.match(/.{1,4}/g)?.join(' ') ?? '';

  return (
    <SecurityDrawer
      open={open}
      onOpenChange={onOpenChange}
      title={t('totp.title')}
      description={t('totp.description')}
      locked={busy}
      onBack={step === 'setup' ? () => setStep('overview') : undefined}
      footer={
        step === 'codes' ? (
          <BigButton onClick={() => onOpenChange(false)}>{t('totp.done')}</BigButton>
        ) : step === 'overview' && !enabled ? (
          <BigButton onClick={start} isLoading={busy} disabled={busy}>
            {t('totp.setup')}
          </BigButton>
        ) : undefined
      }
    >
      <div className="flex flex-col gap-4 p-4">
        {step === 'overview' && (
          <>
            <InfoBox icon={ShieldCheck}>{t('totp.text')}</InfoBox>
            {enabled && (
              <>
                <div className="rounded-2xl border border-border/60 p-4">
                  <p className="text-body font-bold">{t('totp.on')}</p>
                  <p className="mt-1 text-caption text-muted-foreground">
                    {t('totp.recoveryLeft', { count: security?.recoveryLeft ?? 0 })}
                  </p>
                </div>
                <Button
                  variant="outline"
                  pill
                  className="h-12 font-bold"
                  onClick={renew}
                  disabled={busy}
                >
                  <KeyRound />
                  {t('totp.renew')}
                </Button>
                <Button
                  variant="ghost"
                  pill
                  className="h-12 font-bold"
                  onClick={() => setConfirmOff(true)}
                  disabled={busy}
                >
                  {t('totp.disable')}
                </Button>
              </>
            )}
            <ErrorNote message={error} />
          </>
        )}

        {step === 'setup' && setup && (
          <>
            <ol className="flex flex-col gap-4">
              <li className="flex flex-col gap-3">
                <p className="text-body leading-5">
                  <span className="font-bold">1. </span>
                  {t('totp.step1')}
                </p>
                {/* Mouse / trackpad (desktop): scan with the phone. Touch: the app is on this
                    device, the link opens it directly. */}
                <div className="hidden flex-col items-center gap-3 rounded-2xl border border-border/60 p-4 pointer-fine:flex">
                  <QrCode value={setup.uri} label={t('totp.qrLabel')} className="w-full max-w-52" />
                  <p className="text-center text-caption leading-4 text-muted-foreground">
                    {t('totp.scan')}
                  </p>
                </div>
                <a
                  href={setup.uri}
                  className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-foreground px-5 text-body font-bold text-background active:opacity-80 pointer-fine:border pointer-fine:border-border pointer-fine:bg-transparent pointer-fine:text-foreground"
                >
                  <ExternalLink className="size-4" />
                  {t('totp.openApp')}
                </a>
                <p className="text-caption leading-4 text-muted-foreground">{t('totp.manual')}</p>
                <button
                  type="button"
                  onClick={copySecret}
                  className="flex items-center justify-between gap-3 rounded-2xl border border-border/60 px-4 py-3 text-left font-mono text-[16px] tracking-wider break-all active:bg-foreground/[0.06]"
                  aria-label={t('totp.copySecret')}
                >
                  <span className="select-all">{grouped}</span>
                  <Copy aria-hidden="true" className="size-4 shrink-0" />
                </button>
              </li>
              <li className="flex flex-col items-center gap-3">
                <p className="self-start text-body leading-5">
                  <span className="font-bold">2. </span>
                  {t('totp.step2')}
                </p>
                <CodeField
                  value={code}
                  onChange={setCode}
                  onComplete={enable}
                  disabled={busy}
                  invalid={Boolean(error)}
                  label={t('common.code')}
                />
                <ErrorNote message={error} className="text-center" />
              </li>
            </ol>
          </>
        )}

        {step === 'codes' && (
          <>
            <p className="text-body leading-5 font-bold">{t('totp.codesTitle')}</p>
            <p className="text-body leading-5 text-muted-foreground">{t('totp.codesText')}</p>
            <RecoveryCodes codes={codes} />
          </>
        )}
      </div>

      <AlertDialog open={confirmOff} onOpenChange={setConfirmOff}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('totp.disableTitle')}</AlertDialogTitle>
            <AlertDialogDescription>{t('totp.disableText')}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={disable}>{t('totp.disable')}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </SecurityDrawer>
  );
};
