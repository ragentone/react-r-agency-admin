import { useAuthStore } from '@core/auth/auth.store.tsx';
import { create } from 'zustand';

import { creditsAction } from './api.ts';
import { CREDITS_PAGE_SIZE } from './const.ts';
import type {
  CreditError,
  CreditHistoryFilter,
  ICreditCatalog,
  ICreditCatalogResult,
  ICreditDailyBonus,
  ICreditHistoryResult,
  ICreditLiveEvents,
  ICreditPurchase,
  ICreditPurchaseResult,
  ICreditPurchasesResult,
  ICreditRedeemResult,
  ICreditTransaction,
  ICreditTransferResult,
  ICreditUser,
  ICreditWallet,
  ICreditWalletResult,
} from './types.ts';

export const myCreditsId = () => useAuthStore.getState().userMeta?.id ?? null;

/** Purchase sheet (product bought with credits). */
export interface ICreditPurchaseRequest {
  product: string;
  args: Record<string, unknown>;
  /** What is bought, e.g. the post title (shown in the sheet). */
  subject?: string | null;
  onSuccess?: (purchase: ICreditPurchase) => void;
}

/** Tip / transfer sheet. */
export interface ICreditTipRequest {
  /** Tip context (`forum.tip`, `timeline.tip`, `core.transfer` …). */
  context: string;
  refId: string;
  recipient: ICreditUser;
  /** What the tip is for (post title …). */
  subject?: string | null;
  onSuccess?: (received: number) => void;
}

interface ICreditsStore {
  wallet: ICreditWallet | null;
  walletLoading: boolean;
  /** Daily bonus booked by the last `refreshWallet(true)` (toast). */
  lastDaily: ICreditDailyBonus | null;
  refreshWallet: (claim?: boolean) => Promise<ICreditDailyBonus | null>;

  catalog: ICreditCatalog | null;
  loadCatalog: (force?: boolean) => Promise<ICreditCatalog | null>;

  history: ICreditTransaction[];
  historyFilter: CreditHistoryFilter;
  historyLoaded: boolean;
  historyLoading: boolean;
  historyHasMore: boolean;
  historyError: CreditError | null;
  loadHistory: (more?: boolean, filter?: CreditHistoryFilter) => Promise<void>;

  purchase: (
    product: string,
    args: Record<string, unknown>
  ) => Promise<{ purchase?: ICreditPurchase; error?: CreditError }>;
  purchasesOf: (product: string, refIds: string[]) => Promise<ICreditPurchase[]>;
  tip: (
    context: string,
    refId: string,
    amount: number,
    note?: string
  ) => Promise<{ received?: number; error?: CreditError }>;

  /** Voucher code (created by admins). */
  redeem: (code: string) => Promise<{ amount?: number; error?: CreditError }>;

  purchaseRequest: ICreditPurchaseRequest | null;
  tipRequest: ICreditTipRequest | null;
  /** Bumped on every open → the sheets start with fresh state (`key`). */
  sheetSeq: number;
  openPurchase: (request: ICreditPurchaseRequest) => void;
  openTip: (request: ICreditTipRequest) => void;
  closeSheets: () => void;

  applyLive: (payload: ICreditLiveEvents['credits:update']) => void;
  clear: () => void;
}

const initial = {
  wallet: null,
  walletLoading: false,
  lastDaily: null,
  catalog: null,
  history: [] as ICreditTransaction[],
  historyFilter: 'all' as CreditHistoryFilter,
  historyLoaded: false,
  historyLoading: false,
  historyHasMore: false,
  historyError: null,
  purchaseRequest: null,
  tipRequest: null,
  sheetSeq: 0,
};

let catalogPromise: Promise<ICreditCatalog | null> | null = null;

const matchesFilter = (row: ICreditTransaction, filter: CreditHistoryFilter) =>
  filter === 'all' || (filter === 'in' ? row.amount > 0 : row.amount < 0);

export const useCreditsStore = create<ICreditsStore>((set, get) => ({
  ...initial,

  refreshWallet: async (claim = false) => {
    if (!myCreditsId()) return null;
    set({ walletLoading: true });
    const result = await creditsAction<ICreditWalletResult>('wallet', { claim });
    set(state => ({
      walletLoading: false,
      wallet: result.success && result.wallet ? result.wallet : state.wallet,
      lastDaily: result.daily ?? state.lastDaily,
    }));
    return result.daily ?? null;
  },

  loadCatalog: async (force = false) => {
    if (get().catalog && !force) return get().catalog;
    catalogPromise ??= creditsAction<ICreditCatalogResult>('catalog').then(result => {
      catalogPromise = null;
      if (result.success && result.catalog) {
        set({ catalog: result.catalog });
        return result.catalog;
      }
      return null;
    });
    return catalogPromise;
  },

  loadHistory: async (more = false, filter) => {
    const state = get();
    const nextFilter = filter ?? state.historyFilter;
    if (state.historyLoading && nextFilter === state.historyFilter) return;
    const offset = more && nextFilter === state.historyFilter ? state.history.length : 0;
    set({
      historyLoading: true,
      historyError: null,
      historyFilter: nextFilter,
      ...(offset ? {} : { history: nextFilter === state.historyFilter ? state.history : [] }),
    });
    const result = await creditsAction<ICreditHistoryResult>('history', {
      offset,
      limit: CREDITS_PAGE_SIZE,
      filter: nextFilter,
    });
    if (get().historyFilter !== nextFilter) return;
    if (!result.success) {
      set({ historyLoading: false, historyError: result.error ?? 'unknown' });
      return;
    }
    const rows = result.transactions ?? [];
    set(current => ({
      historyLoading: false,
      historyLoaded: true,
      historyHasMore: Boolean(result.hasMore),
      history: offset
        ? [
            ...current.history,
            ...rows.filter(row => !current.history.some(item => item.id === row.id)),
          ]
        : rows,
    }));
  },

  purchase: async (product, args) => {
    const result = await creditsAction<ICreditPurchaseResult>('purchase', { product, args });
    if (!result.success || !result.purchase) return { error: result.error ?? 'unknown' };
    if (result.wallet) set({ wallet: result.wallet });
    return { purchase: result.purchase };
  },

  purchasesOf: async (product, refIds) => {
    if (!refIds.length || !myCreditsId()) return [];
    const result = await creditsAction<ICreditPurchasesResult>('purchases', { product, refIds });
    return result.success ? (result.purchases ?? []) : [];
  },

  tip: async (context, refId, amount, note) => {
    const result =
      context === 'core.transfer'
        ? await creditsAction<ICreditTransferResult>('transfer', { userId: refId, amount, note })
        : await creditsAction<ICreditTransferResult>('tip', { context, refId, amount, note });
    if (!result.success) return { error: result.error ?? 'unknown' };
    if (result.wallet) set({ wallet: result.wallet });
    return { received: result.received ?? amount };
  },

  redeem: async code => {
    const result = await creditsAction<ICreditRedeemResult>('redeem', { code });
    if (!result.success || !result.amount) return { error: result.error ?? 'unknown' };
    if (result.wallet) set({ wallet: result.wallet });
    return { amount: result.amount };
  },

  openPurchase: request =>
    set(state => ({ purchaseRequest: request, tipRequest: null, sheetSeq: state.sheetSeq + 1 })),
  openTip: request =>
    set(state => ({ tipRequest: request, purchaseRequest: null, sheetSeq: state.sheetSeq + 1 })),
  closeSheets: () => set({ purchaseRequest: null, tipRequest: null }),

  applyLive: ({ wallet, transaction }) =>
    set(state => {
      const known = transaction && state.history.some(row => row.id === transaction.id);
      const add =
        transaction &&
        !known &&
        state.historyLoaded &&
        matchesFilter(transaction, state.historyFilter);
      return {
        wallet,
        history: add ? [transaction, ...state.history] : state.history,
      };
    }),

  clear: () => {
    catalogPromise = null;
    set({ ...initial });
  },
}));

/** Opens the purchase sheet (usable outside React, e.g. from a menu). */
export const openCreditPurchase = (request: ICreditPurchaseRequest) =>
  useCreditsStore.getState().openPurchase(request);

/** Opens the tip / transfer sheet. */
export const openCreditTip = (request: ICreditTipRequest) =>
  useCreditsStore.getState().openTip(request);
