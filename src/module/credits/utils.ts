import type { TFunction } from 'i18next';

import type { CreditError, ICreditCatalog, ICreditTransaction } from './types.ts';

export const formatCredits = (value: number, locale?: string) =>
  new Intl.NumberFormat(locale, { maximumFractionDigits: 0 }).format(value);

export const signedCredits = (value: number, locale?: string) =>
  `${value > 0 ? '+' : value < 0 ? '−' : ''}${formatCredits(Math.abs(value), locale)}`;

export const initialsOf = (name: string) =>
  name
    .replace(/^@/, '')
    .split(/[\s._-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0]?.toUpperCase() ?? '')
    .join('') || '?';

/** Translated error of a credits action. */
export const creditErrorText = (t: TFunction, error: CreditError | null | undefined) =>
  t(`credits:errors.${error ?? 'unknown'}`, { defaultValue: t('credits:errors.unknown') });

/**
 * Name of a booking: the label of the rule / product / tip context from the runtime catalog
 * (i18n key of the app), special core reasons, otherwise the kind.
 */
export const reasonLabel = (
  t: TFunction,
  row: Pick<ICreditTransaction, 'reason' | 'kind'>,
  catalog: ICreditCatalog | null
) => {
  if (row.reason === 'core.admin.grant') return t('credits:reasons.admin');
  if (row.reason === 'core.admin.reversal') return t('credits:reasons.reversal');
  if (row.reason === 'core.voucher') return t('credits:reasons.voucher');
  if (row.reason === 'core.account.deleted') return t('credits:reasons.deleted');
  if (row.reason === 'core.bank.genesis') return t('credits:reasons.genesis');
  if (row.reason === 'core.bank.topup') return t('credits:reasons.topup');
  const label =
    catalog?.rules.find(rule => rule.key === row.reason)?.label ??
    catalog?.products.find(product => product.key === row.reason)?.label ??
    catalog?.tips.find(tip => tip.key === row.reason)?.label;
  if (label) return t(label, { defaultValue: t(`credits:kinds.${row.kind}`) });
  return t(`credits:kinds.${row.kind}`);
};

/** "24 h" / "3 days". */
export const durationText = (t: TFunction, hours: number | null | undefined) => {
  if (!hours) return t('credits:duration.permanent');
  if (hours % 24 === 0 && hours >= 48) return t('credits:duration.days', { count: hours / 24 });
  return t('credits:duration.hours', { count: hours });
};

/** Relative time ("2 min", "3 h", "12. Okt."). */
export const relativeTime = (iso: string, locale?: string) => {
  const date = new Date(iso);
  const diff = Date.now() - date.getTime();
  const minutes = Math.round(diff / 60_000);
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto', style: 'short' });
  if (minutes < 1) return rtf.format(0, 'minute');
  if (minutes < 60) return rtf.format(-minutes, 'minute');
  const hours = Math.round(minutes / 60);
  if (hours < 24) return rtf.format(-hours, 'hour');
  const days = Math.round(hours / 24);
  if (days < 7) return rtf.format(-days, 'day');
  return new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'short',
    ...(date.getFullYear() !== new Date().getFullYear() ? { year: 'numeric' } : {}),
  }).format(date);
};

/** Codes are stored without separators – shown in groups of four (`ABCD-EFGH-JKLM`). */
export const formatVoucherCode = (code: string) => code.match(/.{1,4}/g)?.join('-') ?? code;
