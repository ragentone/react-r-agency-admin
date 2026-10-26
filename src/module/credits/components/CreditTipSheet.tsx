import { cn } from '@ui/lib/utils';
import { Loader2 } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { CREDITS_NOTE_MAX, CREDITS_TIP_PRESETS } from '../const.ts';
import { useCreditsCatalog } from '../hooks.ts';
import { useCreditsStore } from '../store.ts';
import type { CreditError } from '../types.ts';
import { creditErrorText } from '../utils.ts';
import { CreditsAmount } from './CreditsAmount.tsx';
import { CreditsAvatar } from './CreditsAvatar.tsx';
import {
  creditsPrimaryButton,
  creditsSecondaryButton,
  CreditsSheet,
  CreditsSheetRow,
} from './CreditsSheet.tsx';

/** Tip / transfer to another user (rendered once by the provider). */
export const CreditTipSheet: React.FC = () => {
  const { t } = useTranslation('credits');
  const request = useCreditsStore(state => state.tipRequest);
  const wallet = useCreditsStore(state => state.wallet);
  const closeSheets = useCreditsStore(state => state.closeSheets);
  const catalog = useCreditsCatalog();
  const [picked, setPicked] = useState<number | null>(null);
  const [custom, setCustom] = useState('');
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<CreditError | null>(null);

  const tip = request ? catalog?.tips.find(item => item.key === request.context) : null;
  const min = tip?.min ?? 1;
  const max = Math.min(tip?.max ?? 100, catalog?.transfer.maxPerTransfer ?? Infinity);
  const presets = CREDITS_TIP_PRESETS.filter(value => value >= min && value <= max);
  const amount = picked ?? (presets.includes(5) ? 5 : (presets[0] ?? min));

  // Fresh balance for the confirmation (the provider remounts the sheet per request).
  useEffect(() => {
    if (request) void useCreditsStore.getState().refreshWallet();
  }, [request]);

  const value = custom ? Math.floor(Number(custom)) : amount;
  const valid = Number.isFinite(value) && value >= min && value <= max;
  const transferable = wallet?.transferable ?? 0;
  const fee = catalog ? Math.floor((value * catalog.transfer.feePercent) / 100) : 0;
  const enough = valid && value <= transferable;
  const recipient = request?.recipient;

  const send = async () => {
    if (!request || !valid || busy) return;
    setBusy(true);
    setError(null);
    const result = await useCreditsStore
      .getState()
      .tip(request.context, request.refId, value, note.trim() || undefined);
    setBusy(false);
    if (result.received === undefined) {
      setError(result.error ?? 'unknown');
      return;
    }
    toast.success(t('tip.success', { count: result.received, name: recipient?.alias ?? '' }));
    request.onSuccess?.(result.received);
    closeSheets();
  };

  return (
    <CreditsSheet
      open={!!request}
      onOpenChange={open => {
        if (!open && !busy) closeSheets();
      }}
      title={t('tip.title', { name: recipient?.alias ?? '' })}
      description={tip ? t(tip.label) : undefined}
      footer={
        <>
          <button
            type="button"
            className={creditsPrimaryButton}
            disabled={!enough || busy || !tip || !!wallet?.frozen}
            onClick={() => void send()}
          >
            {busy && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
            {t('tip.confirm', { count: valid ? value : 0 })}
          </button>
          <button
            type="button"
            className={creditsSecondaryButton}
            onClick={closeSheets}
            disabled={busy}
          >
            {t('actions.cancel')}
          </button>
        </>
      }
    >
      {recipient && (
        <div className="mb-3 flex items-center gap-3">
          <CreditsAvatar user={recipient} />
          <div className="min-w-0">
            <p className="truncate text-body font-bold">@{recipient.alias}</p>
            {request?.subject && (
              <p className="line-clamp-1 text-caption text-muted-foreground">{request.subject}</p>
            )}
          </div>
        </div>
      )}

      {!tip ? (
        <p className="py-6 text-center text-body text-muted-foreground">
          {catalog ? t('errors.disabled') : t('loading')}
        </p>
      ) : (
        <>
          <div role="radiogroup" aria-label={t('tip.amount')} className="grid grid-cols-4 gap-2">
            {presets.map(preset => {
              const selected = !custom && preset === amount;
              return (
                <button
                  key={preset}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  onClick={() => {
                    setCustom('');
                    setPicked(preset);
                  }}
                  className={cn(
                    'h-12 rounded-full border text-body font-bold tabular-nums outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring',
                    selected
                      ? 'border-foreground bg-foreground text-background'
                      : 'border-border hover:bg-foreground/[0.04]'
                  )}
                >
                  {preset}
                </button>
              );
            })}
          </div>
          <label className="mt-3 block">
            <span className="text-caption font-semibold text-muted-foreground">
              {t('tip.custom', { min, max })}
            </span>
            <input
              type="number"
              inputMode="numeric"
              min={min}
              max={max}
              step={1}
              value={custom}
              onChange={event => setCustom(event.target.value.replace(/[^0-9]/g, '').slice(0, 7))}
              placeholder={String(amount)}
              className="mt-1 h-12 w-full rounded-2xl border border-border bg-transparent px-4 text-body font-semibold tabular-nums outline-none focus:border-foreground"
            />
          </label>
          <label className="mt-3 block">
            <span className="text-caption font-semibold text-muted-foreground">
              {t('tip.note')}
            </span>
            <input
              type="text"
              value={note}
              maxLength={CREDITS_NOTE_MAX}
              onChange={event => setNote(event.target.value)}
              placeholder={t('tip.notePlaceholder')}
              className="mt-1 h-12 w-full rounded-2xl border border-border bg-transparent px-4 text-body outline-none focus:border-foreground"
            />
          </label>
          <div className="mt-2 divide-y divide-border/50">
            <CreditsSheetRow
              label={t('tip.transferable')}
              value={<CreditsAmount value={transferable} />}
            />
            {fee > 0 && (
              <CreditsSheetRow
                label={t('tip.fee', { percent: catalog?.transfer.feePercent ?? 0 })}
                value={<CreditsAmount value={fee} />}
              />
            )}
            <CreditsSheetRow
              label={t('tip.receives', { name: recipient?.alias ?? '' })}
              value={<CreditsAmount value={valid ? value - fee : 0} />}
              strong
            />
          </div>
          {valid && !enough && (
            <p className="mt-2 text-body text-muted-foreground">
              {(wallet?.balance ?? 0) >= value
                ? t('errors.held_funds', { hours: catalog?.transfer.holdHours ?? 24 })
                : t('errors.insufficient_funds')}
            </p>
          )}
        </>
      )}
      {wallet?.frozen && <p className="mt-3 text-body text-destructive">{t('errors.frozen')}</p>}
      {error && (
        <p role="alert" className="mt-3 text-body font-semibold text-destructive">
          {creditErrorText(t, error)}
        </p>
      )}
    </CreditsSheet>
  );
};
