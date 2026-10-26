import { Link } from '@tanstack/react-router';
import { Loader2 } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { CREDITS_ROUTE } from '../const.ts';
import { useCreditsCatalog } from '../hooks.ts';
import { useCreditsStore } from '../store.ts';
import type { CreditError } from '../types.ts';
import { creditErrorText, durationText } from '../utils.ts';
import { CreditsAmount } from './CreditsAmount.tsx';
import {
  creditsPrimaryButton,
  creditsSecondaryButton,
  CreditsSheet,
  CreditsSheetRow,
} from './CreditsSheet.tsx';

/** Confirmation before credits are spent on a product (rendered once by the provider). */
export const CreditPurchaseSheet: React.FC = () => {
  const { t } = useTranslation('credits');
  const request = useCreditsStore(state => state.purchaseRequest);
  const wallet = useCreditsStore(state => state.wallet);
  const closeSheets = useCreditsStore(state => state.closeSheets);
  const catalog = useCreditsCatalog();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<CreditError | null>(null);

  const product = request ? catalog?.products.find(item => item.key === request.product) : null;

  // Fresh balance for the confirmation (the provider remounts the sheet per request).
  useEffect(() => {
    if (request) void useCreditsStore.getState().refreshWallet();
  }, [request]);

  const balance = wallet?.balance ?? 0;
  const price = product?.price ?? 0;
  const after = balance - price;
  const enough = !!product && after >= 0;
  const label = product ? t(product.label) : t('purchase.title');

  const buy = async () => {
    if (!request || !product || busy) return;
    setBusy(true);
    setError(null);
    const result = await useCreditsStore.getState().purchase(request.product, request.args);
    setBusy(false);
    if (!result.purchase) {
      setError(result.error ?? 'unknown');
      return;
    }
    toast.success(t('purchase.success', { label }));
    request.onSuccess?.(result.purchase);
    closeSheets();
  };

  return (
    <CreditsSheet
      open={!!request}
      onOpenChange={open => {
        if (!open && !busy) closeSheets();
      }}
      title={label}
      description={product?.description ? t(product.description) : undefined}
      footer={
        <>
          <button
            type="button"
            className={creditsPrimaryButton}
            disabled={!enough || busy || !!wallet?.frozen}
            onClick={() => void buy()}
          >
            {busy && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
            {t('purchase.confirm', { count: price })}
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
      {request?.subject && (
        <p className="mb-2 line-clamp-2 rounded-2xl bg-foreground/[0.04] px-4 py-3 text-body font-semibold break-words">
          {request.subject}
        </p>
      )}
      {!product ? (
        <p className="py-6 text-center text-body text-muted-foreground">
          {catalog ? t('errors.disabled') : t('loading')}
        </p>
      ) : (
        <div className="divide-y divide-border/50">
          <CreditsSheetRow label={t('purchase.price')} value={<CreditsAmount value={price} />} />
          <CreditsSheetRow
            label={t('purchase.duration')}
            value={durationText(t, product.durationHours)}
          />
          <CreditsSheetRow
            label={t('purchase.balance')}
            value={<CreditsAmount value={balance} />}
          />
          <CreditsSheetRow
            label={t('purchase.after')}
            value={<CreditsAmount value={Math.max(0, after)} />}
            strong
          />
        </div>
      )}
      {product && !enough && (
        <p className="mt-3 rounded-2xl border border-border px-4 py-3 text-body">
          {t('purchase.notEnough', { count: price - balance })}{' '}
          <Link
            to={CREDITS_ROUTE}
            search={{ tab: 'earn' } as never}
            onClick={closeSheets}
            className="font-bold underline underline-offset-2"
          >
            {t('purchase.howToEarn')}
          </Link>
        </p>
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
