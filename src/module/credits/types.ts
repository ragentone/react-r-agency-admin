/** Same shapes as the runtime (src/shared/credits/types). */

export type CreditKind =
  | 'earn'
  | 'revoke'
  | 'purchase'
  | 'refund'
  | 'transfer_in'
  | 'transfer_out'
  | 'admin'
  | 'voucher'
  | 'bank'
  /** Credits put into a game (poker buy-in). */
  | 'stake'
  /** Credits back from a game (poker cash-out). */
  | 'payout';

/** Where credits come from: the application bank or created from nothing. */
export type CreditFunding = 'bank' | 'mint';

export type CreditError =
  | 'not_authorized'
  | 'invalid'
  | 'not_found'
  | 'disabled'
  | 'insufficient_funds'
  | 'held_funds'
  | 'frozen'
  | 'rate_limited'
  | 'forbidden'
  | 'blocked'
  | 'self_transfer'
  | 'friends_only'
  | 'account_too_new'
  | 'not_confirmed'
  | 'limit_send'
  | 'limit_receive'
  | 'limit_recipient'
  | 'already_active'
  | 'duplicate'
  | 'capped'
  | 'bank_empty'
  | 'code_invalid'
  | 'code_expired'
  | 'code_used'
  | 'code_exhausted'
  | 'code_taken'
  | 'too_many_attempts'
  | 'failed'
  | 'timeout'
  | 'unknown';

export interface ICreditResult {
  success: boolean;
  error?: CreditError;
}

export interface ICreditWallet {
  balance: number;
  transferable: number;
  earned: number;
  spent: number;
  sent: number;
  received: number;
  frozen: boolean;
  streak: number;
  dailyClaimed: boolean;
  earnedToday: number;
  dailyCap: number;
}

export interface ICreditUser {
  id: string;
  alias: string;
  avatarUrl: string | null;
}

export interface ICreditTransaction {
  id: string;
  amount: number;
  balanceAfter: number;
  kind: CreditKind;
  reason: string;
  app: string;
  refId: string | null;
  counterparty: ICreditUser | null;
  note: string | null;
  createdAt: string;
}

export type CreditHistoryFilter = 'all' | 'in' | 'out';

export interface ICreditDailyBonus {
  amount: number;
  streak: number;
}

export type CreditPurchaseStatus = 'active' | 'expired' | 'refunded';

export interface ICreditPurchase {
  id: string;
  product: string;
  app: string;
  refId: string;
  price: number;
  status: CreditPurchaseStatus;
  expiresAt: string | null;
  createdAt: string;
}

export interface ICreditRuleView {
  key: string;
  app: string;
  amount: number;
  dailyCap: number | null;
  once: boolean;
  label: string;
  description: string | null;
}

export interface ICreditProductView {
  key: string;
  app: string;
  price: number;
  durationHours: number | null;
  label: string;
  description: string | null;
}

export interface ICreditTipView {
  key: string;
  app: string;
  min: number;
  max: number;
  label: string;
}

export interface ICreditAppView {
  app: string;
  label: string | null;
  dailyCap: number | null;
}

export interface ICreditTransferSettings {
  enabled: boolean;
  minAccountAgeDays: number;
  requireConfirmed: boolean;
  friendsOnly: boolean;
  maxPerTransfer: number;
  dailySend: number;
  dailyReceive: number;
  dailyPerRecipient: number;
  holdHours: number;
  feePercent: number;
}

export interface ICreditDailySettings {
  enabled: boolean;
  base: number;
  maxStreak: number;
}

export interface ICreditBankSettings {
  defaultFunding: CreditFunding;
  maxVoucherAmount: number;
}

export interface ICreditGlobalSettings {
  dailyCap: number;
  earnRequiresConfirmed: boolean;
  transfer: ICreditTransferSettings;
  daily: ICreditDailySettings;
  bank: ICreditBankSettings;
}

export interface ICreditCatalog {
  rules: ICreditRuleView[];
  products: ICreditProductView[];
  tips: ICreditTipView[];
  apps: ICreditAppView[];
  dailyCap: number;
  transfer: ICreditTransferSettings;
  daily: ICreditDailySettings;
}

export interface ICreditOverride {
  enabled?: boolean;
  amount?: number;
  dailyCap?: number | null;
  price?: number;
  min?: number;
  max?: number;
  funding?: CreditFunding | null;
}

export interface ICreditLiveEvents {
  'credits:update': {
    wallet: ICreditWallet;
    transaction: ICreditTransaction | null;
  };
}

// ---- results of the websocket actions --------------------------------------------------

export interface ICreditWalletResult extends ICreditResult {
  wallet?: ICreditWallet;
  daily?: ICreditDailyBonus | null;
}

export interface ICreditHistoryResult extends ICreditResult {
  transactions?: ICreditTransaction[];
  hasMore?: boolean;
}

export interface ICreditCatalogResult extends ICreditResult {
  catalog?: ICreditCatalog;
}

export interface ICreditPurchaseResult extends ICreditResult {
  wallet?: ICreditWallet;
  purchase?: ICreditPurchase;
}

export interface ICreditPurchasesResult extends ICreditResult {
  purchases?: ICreditPurchase[];
}

export interface ICreditTransferResult extends ICreditResult {
  wallet?: ICreditWallet;
  transaction?: ICreditTransaction;
  received?: number;
}

export type CreditsAction =
  | 'wallet'
  | 'history'
  | 'catalog'
  | 'purchase'
  | 'purchases'
  | 'tip'
  | 'transfer'
  | 'redeem'
  | 'top';

export type CreditsAdminAction =
  | 'overview'
  | 'settings'
  | 'update'
  | 'bank'
  | 'chart'
  | 'bankHistory'
  | 'bankTopUp'
  | 'voucherCreate'
  | 'vouchers'
  | 'voucher'
  | 'voucherUpdate'
  | 'voucherDeactivate';

// ---- admin ---------------------------------------------------------------------------

export interface ICreditAdminOverview {
  wallets: number;
  circulation: number;
  frozen: number;
  totals: { kind: CreditKind; amount: number; count: number }[];
  apps: { app: string; earned: number; spent: number }[];
  today: { earned: number; spent: number; transferred: number };
  bank: ICreditBankStatus;
}

/** One day of the admin chart (sums over all users). */
export interface ICreditChartDay {
  day: string;
  earned: number;
  spent: number;
  transferred: number;
  bank: number;
}

/** Movement of the bank / voucher reserve (no users). */
export interface ICreditBankRow {
  id: string;
  wallet: 'bank' | 'reserve' | 'escrow';
  amount: number;
  balanceAfter: number;
  reason: string;
  app: string;
  note: string | null;
  byAdmin: boolean;
  createdAt: string;
}

/** Public leaderboard. */
export interface ICreditTopUser extends ICreditUser {
  rank: number;
  balance: number;
}

export interface ICreditTopResult extends ICreditResult {
  users?: ICreditTopUser[];
  updatedAt?: string;
}

export interface ICreditBankStatus {
  balance: number;
  reserved: number;
  /** Credits on game tables (escrow). */
  escrow?: number;
  supply: number;
  users: number;
  consistent: boolean;
}

export interface ICreditRedeemResult extends ICreditResult {
  wallet?: ICreditWallet;
  amount?: number;
}

export type CreditVoucherState = 'active' | 'scheduled' | 'expired' | 'exhausted' | 'closed';

export interface ICreditVoucher {
  id: string;
  code: string;
  amount: number;
  maxRedemptions: number;
  redeemed: number;
  reserved: number;
  validFrom: string | null;
  validUntil: string | null;
  user: ICreditUser | null;
  note: string | null;
  funding: CreditFunding;
  batchId: string | null;
  state: CreditVoucherState;
  createdBy: ICreditUser | null;
  createdAt: string;
}

export interface ICreditVoucherCreateValues {
  code?: string | null;
  amount: number;
  maxRedemptions?: number;
  count?: number;
  validFrom?: string | null;
  validUntil?: string | null;
  userId?: string | null;
  note?: string | null;
  funding?: CreditFunding | null;
}

export interface ICreditAdminSettings {
  settings: ICreditGlobalSettings;
  catalog: ICreditCatalog;
  overrides: Record<string, ICreditOverride>;
  defaults: {
    rules: { key: string; amount: number; dailyCap: number | null; enabled: boolean }[];
    products: { key: string; price: number; enabled: boolean }[];
    tips: { key: string; min: number; max: number; enabled: boolean }[];
    apps: { app: string; dailyCap: number | null }[];
  };
}
