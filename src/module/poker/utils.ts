export const formatNumber = (value: number, locale?: string) =>
  new Intl.NumberFormat(locale, { maximumFractionDigits: 0 }).format(value);

export const signed = (value: number, locale?: string) =>
  `${value > 0 ? '+' : value < 0 ? '−' : '±'}${formatNumber(Math.abs(value), locale)}`;

export const formatTime = (epoch: number | string, locale?: string) =>
  new Intl.DateTimeFormat(locale, {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(epoch));

const SUITS: Record<string, string> = { s: '♠', c: '♣', h: '♡', d: '♢' };

/** `Td` → `10♢` (black / white: hearts and diamonds outlined). */
export const cardLabel = (card: string) =>
  `${card[0] === 'T' ? '10' : (card[0] ?? '')}${SUITS[card[1] ?? ''] ?? ''}`;
