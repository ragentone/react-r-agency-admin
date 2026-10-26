import { useAuth } from '@core/auth/components/use.auth.ts';
import { useMeshState } from '@core/mesh';
import { type ReactNode, useEffect } from 'react';
import { toast } from 'sonner';

import { creditsChannel } from '../api.ts';
import { i18nT } from '../i18n.ts';
import { useCreditsStore } from '../store.ts';
import { CreditPurchaseSheet } from './CreditPurchaseSheet.tsx';
import { CreditTipSheet } from './CreditTipSheet.tsx';

/**
 * Wallet + live updates while signed in (daily bonus on the first load of the day, toast for
 * received credits) and the purchase / tip sheets the apps open.
 */
export const CreditsProvider = ({ children }: { children: ReactNode }) => {
  const { authorized, userMeta } = useAuth();
  const signedIn = Boolean(authorized && userMeta?.id);
  const { connected } = useMeshState();
  const sheetSeq = useCreditsStore(state => state.sheetSeq);

  useEffect(() => {
    if (!signedIn) {
      useCreditsStore.getState().clear();
      return;
    }
    if (!connected) return;
    const store = useCreditsStore.getState();
    void store.loadCatalog();
    // `claim`: books the daily bonus / onboarding rewards (once per day, runtime decides).
    void store.refreshWallet(true).then(daily => {
      if (daily?.amount) {
        toast.success(i18nT('daily.toast', { count: daily.amount }), {
          description: i18nT('daily.streak', { count: daily.streak }),
        });
      }
    });
    if (store.historyLoaded) void store.loadHistory();
    const onVisible = () => {
      if (document.visibilityState === 'visible')
        void useCreditsStore.getState().refreshWallet(true);
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, [signedIn, connected]);

  useEffect(() => {
    if (!signedIn) return;
    const off = creditsChannel().on('credits:update', ({ payload }) => {
      if (!payload?.wallet) return;
      useCreditsStore.getState().applyLive(payload);
      const row = payload.transaction;
      if (row?.kind === 'transfer_in' && row.amount > 0) {
        toast.success(i18nT('live.received', { count: row.amount }), {
          description: [row.counterparty?.alias ? `@${row.counterparty.alias}` : '', row.note ?? '']
            .filter(Boolean)
            .join(' · '),
        });
      }
    });
    return () => {
      if (typeof off === 'function') off();
    };
  }, [signedIn]);

  return (
    <>
      {children}
      {signedIn && (
        <>
          <CreditPurchaseSheet key={`purchase-${sheetSeq}`} />
          <CreditTipSheet key={`tip-${sheetSeq}`} />
        </>
      )}
    </>
  );
};
