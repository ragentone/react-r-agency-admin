import { cn } from '@ui/lib/utils';
import { Loader2, Ticket } from 'lucide-react';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { useCreditsStore } from '../store.ts';
import type { CreditError } from '../types.ts';
import { creditErrorText } from '../utils.ts';
import { creditsFocus } from './credits.classes.ts';

/** "Redeem code" – voucher codes created by admins (`/credits?code=…` fills it in). */
export const CreditsRedeemCard: React.FC<{ initialCode?: string | null }> = ({ initialCode }) => {
  const { t } = useTranslation('credits');
  const [code, setCode] = useState(initialCode ?? '');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<CreditError | null>(null);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!code.trim() || busy) return;
    setBusy(true);
    setError(null);
    const result = await useCreditsStore.getState().redeem(code.trim());
    setBusy(false);
    if (!result.amount) {
      setError(result.error ?? 'unknown');
      return;
    }
    setCode('');
    toast.success(t('voucher.success', { count: result.amount }));
    void useCreditsStore.getState().loadHistory(false);
  };

  return (
    <section aria-labelledby="credits-redeem" className="border-b border-border/50 px-4 py-4">
      <h2
        id="credits-redeem"
        className="flex items-center gap-2 text-body font-bold text-foreground"
      >
        <Ticket className="size-4" aria-hidden="true" />
        {t('voucher.title')}
      </h2>
      <form onSubmit={event => void submit(event)} className="mt-2 flex gap-2">
        <input
          type="text"
          value={code}
          onChange={event => {
            setCode(event.target.value.toUpperCase().slice(0, 48));
            setError(null);
          }}
          placeholder={t('voucher.placeholder')}
          aria-label={t('voucher.placeholder')}
          aria-invalid={!!error}
          aria-describedby={error ? 'credits-redeem-error' : undefined}
          enterKeyHint="go"
          autoCapitalize="characters"
          autoComplete="off"
          spellCheck={false}
          className="h-11 min-w-0 flex-1 rounded-full border border-border bg-transparent px-4 font-mono text-body tracking-wider uppercase outline-none transition-colors placeholder:font-sans placeholder:tracking-normal placeholder:normal-case placeholder:text-muted-foreground/70 focus:border-foreground aria-[invalid=true]:border-destructive"
        />
        <button
          type="submit"
          disabled={!code.trim() || busy}
          className={cn(
            'inline-flex h-11 shrink-0 items-center gap-2 rounded-full bg-foreground px-5 text-body font-bold text-background transition-opacity hover:opacity-85 active:opacity-75 disabled:opacity-40',
            creditsFocus
          )}
        >
          {busy && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
          {t('voucher.redeem')}
        </button>
      </form>
      {error && (
        <p
          id="credits-redeem-error"
          role="alert"
          className="mt-2 text-caption font-semibold text-destructive"
        >
          {creditErrorText(t, error)}
        </p>
      )}
    </section>
  );
};
