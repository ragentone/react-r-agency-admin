import { cn } from '@ui/lib/utils';
import { CircleAlert, CircleCheck, Landmark, Loader2 } from 'lucide-react';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { creditsAdminAction } from '../api.ts';
import { creditsFocus } from '../components/credits.classes.ts';
import { CreditsStats } from '../components/CreditsUi.tsx';
import { CREDITS_NOTE_MAX } from '../const.ts';
import { useCreditsFormat } from '../hooks.ts';
import type { ICreditBankStatus } from '../types.ts';
import { creditErrorText } from '../utils.ts';

/** Application bank: balance, reserved for vouchers, total supply + top up. */
export const CreditsAdminBank: React.FC<{ bank: ICreditBankStatus; onChanged: () => void }> = ({
  bank,
  onChanged,
}) => {
  const { t } = useTranslation('credits');
  const format = useCreditsFormat();
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);

  const topUp = async () => {
    const value = Math.trunc(Number(amount));
    if (value <= 0 || busy) return;
    setBusy(true);
    const result = await creditsAdminAction('bankTopUp', { amount: value, note });
    setBusy(false);
    if (!result.success) {
      toast.error(creditErrorText(t, result.error));
      return;
    }
    toast.success(t('admin.bank.toppedUp', { value: format(value) }));
    setAmount('');
    setNote('');
    onChanged();
  };

  const stats = [
    ['reserved', bank.reserved],
    ['users', bank.users],
    ['supply', bank.supply],
  ] as const;

  return (
    <section aria-labelledby="credits-bank" className="border-b border-border/50 px-4 py-4">
      <h2
        id="credits-bank"
        className="flex items-center gap-2 text-caption font-semibold text-muted-foreground"
      >
        <Landmark className="size-4" aria-hidden="true" />
        {t('admin.bank.title')}
      </h2>
      <p className="mt-1 truncate text-display font-extrabold tracking-tight tabular-nums sm:text-[2.25rem] sm:leading-10">
        {format(bank.balance)}
      </p>
      <CreditsStats
        className="mt-3"
        items={stats.map(([key, value]) => ({
          key,
          label: t(`admin.bank.${key}`),
          value: format(value),
        }))}
      />
      <p
        className={
          bank.consistent
            ? 'mt-3 flex items-center gap-1.5 text-caption font-semibold text-muted-foreground'
            : 'mt-3 flex items-center gap-1.5 text-caption font-semibold text-destructive'
        }
      >
        {bank.consistent ? (
          <CircleCheck className="size-4" aria-hidden="true" />
        ) : (
          <CircleAlert className="size-4" aria-hidden="true" />
        )}
        {t(bank.consistent ? 'admin.bank.consistent' : 'admin.bank.inconsistent')}
      </p>

      <div className="mt-5 border-t border-border/50 pt-4">
        <p className="text-body font-semibold">{t('admin.bank.topUp')}</p>
        <p className="text-caption text-muted-foreground">{t('admin.bank.topUpText')}</p>
        <div className="mt-2 flex gap-2">
          <input
            type="number"
            inputMode="numeric"
            min={1}
            value={amount}
            onChange={event => setAmount(event.target.value.replace(/[^0-9]/g, '').slice(0, 10))}
            placeholder={t('admin.amount')}
            aria-label={t('admin.amount')}
            className="h-11 w-28 shrink-0 rounded-full border border-border bg-transparent px-4 text-body font-semibold tabular-nums outline-none focus:border-foreground sm:w-36"
          />
          <input
            type="text"
            value={note}
            maxLength={CREDITS_NOTE_MAX}
            onChange={event => setNote(event.target.value)}
            placeholder={t('admin.note')}
            aria-label={t('admin.note')}
            className="h-11 min-w-0 flex-1 rounded-full border border-border bg-transparent px-4 text-body outline-none focus:border-foreground"
          />
        </div>
        <button
          type="button"
          disabled={!Math.trunc(Number(amount)) || busy}
          onClick={() => void topUp()}
          className={cn(
            'mt-2 inline-flex h-11 w-full items-center justify-center gap-2 rounded-full bg-foreground text-body font-bold text-background transition-opacity hover:opacity-85 active:opacity-75 disabled:opacity-40',
            creditsFocus
          )}
        >
          {busy && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
          {t('admin.bank.topUpButton')}
        </button>
      </div>
    </section>
  );
};
