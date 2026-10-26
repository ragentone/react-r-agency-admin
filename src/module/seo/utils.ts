const UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
  ['day', 86400],
  ['hour', 3600],
  ['minute', 60],
];

/** "vor 5 Minuten" / "gerade eben" (`justNow`). */
export const formatAgo = (iso: string | null, locale: string, justNow: string) => {
  if (!iso) return '–';
  const seconds = Math.round((Date.now() - new Date(iso).getTime()) / 1000);
  if (!Number.isFinite(seconds)) return '–';
  if (seconds < 45) return justNow;
  const format = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
  for (const [unit, size] of UNITS) {
    if (seconds >= size) return format.format(-Math.round(seconds / size), unit);
  }
  return format.format(-Math.max(1, Math.round(seconds / 60)), 'minute');
};
