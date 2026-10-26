/**
 * Credits – core feature (frontend of runtime src/shared/credits). Apps use:
 * - `CreditsRegistry.registerApp(...)` – icon + name of their bookings
 * - `<CreditTipButton context="forum.tip" refId=… recipient=… />` – tips
 * - `openCreditPurchase({ product, args, subject, onSuccess })` – products (pin, highlight …)
 * - `useCreditProduct(key)` – price / duration for menu labels
 * Everything is hidden while the module is not active (`isCreditsActive()`).
 */
export * from './api.ts';
export * from './components';
export * from './const.ts';
export { isCreditsActive } from './feature.ts';
export * from './hooks.ts';
export * from './registry.ts';
export type { ICreditPurchaseRequest, ICreditTipRequest } from './store.ts';
export { openCreditPurchase, openCreditTip, useCreditsStore } from './store.ts';
export * from './types.ts';
export * from './utils.ts';
