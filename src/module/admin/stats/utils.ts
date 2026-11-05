export const formatNumber = (value: number, locale: string) =>
  new Intl.NumberFormat(locale, { maximumFractionDigits: 0 }).format(value);

/** 0.42 → "42 %" */
export const formatPercent = (value: number | null | undefined, locale: string) =>
  value === null || value === undefined
    ? '–'
    : new Intl.NumberFormat(locale, { style: 'percent', maximumFractionDigits: 0 }).format(value);

/** 135 → "2:15 min", 4000 → "1 h 7 min" */
export const formatDuration = (seconds: number) => {
  const total = Math.max(0, Math.round(seconds));
  if (total < 60) return `${total} s`;
  const minutes = Math.floor(total / 60);
  if (minutes < 60) return `${minutes}:${String(total % 60).padStart(2, '0')} min`;
  const hours = Math.floor(minutes / 60);
  return `${hours} h ${minutes % 60} min`;
};

/** "vor 3 Min." – relative to now. */
export const formatAgo = (iso: string | null | undefined, locale: string) => {
  if (!iso) return '–';
  const diff = (Date.parse(iso) - Date.now()) / 1000;
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto', style: 'short' });
  const abs = Math.abs(diff);
  if (abs < 45) return rtf.format(Math.round(diff), 'second');
  if (abs < 3600) return rtf.format(Math.round(diff / 60), 'minute');
  if (abs < 86_400) return rtf.format(Math.round(diff / 3600), 'hour');
  if (abs < 86_400 * 30) return rtf.format(Math.round(diff / 86_400), 'day');
  return new Date(iso).toLocaleDateString(locale, { day: 'numeric', month: 'short' });
};
