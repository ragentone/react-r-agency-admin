import type { ShopItemPriceType } from '../types';

/** "12,50 €" – `null` when the price is on request. */
export const formatShopAmount = (cents: number | null, locale: string): string | null => {
  if (cents === null || cents === undefined) return null;
  return new Intl.NumberFormat(locale, { style: 'currency', currency: 'EUR' }).format(cents / 100);
};

export const needsAmount = (type: ShopItemPriceType): boolean => type !== 'onRequest';
