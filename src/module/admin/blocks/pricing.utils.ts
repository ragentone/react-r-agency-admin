import type { IPlanItem } from './types';

/** "9,90 €" in the visitor's language; whole amounts without decimals. `0` → `free`. */
export const formatPlanPrice = (
  plan: Pick<IPlanItem, 'price' | 'currency' | 'from'>,
  language: string,
  text: { free: string; from: string }
): string => {
  // Older data may still hold the price as text.
  const amount = Number(plan.price) || 0;
  if (amount === 0) return text.free;
  const money = new Intl.NumberFormat(language, {
    style: 'currency',
    currency: plan.currency,
    minimumFractionDigits: Number.isInteger(amount) ? 0 : 2,
  }).format(amount);
  return plan.from ? `${text.from} ${money}` : money;
};
