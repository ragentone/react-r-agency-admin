const UNITS = ['B', 'KB', 'MB', 'GB', 'TB'];

/** 1_610_612_736 → "1,5 GB" (binary steps, one decimal from GB on). */
export const formatBytes = (bytes: number, locale: string) => {
  let value = Math.max(0, bytes);
  let unit = 0;
  while (value >= 1024 && unit < UNITS.length - 1) {
    value /= 1024;
    unit += 1;
  }
  const digits = unit >= 3 && value < 100 ? 1 : 0;
  return `${new Intl.NumberFormat(locale, { maximumFractionDigits: digits }).format(value)} ${UNITS[unit]}`;
};

export const GB = 1024 * 1024 * 1024;
export const MB = 1024 * 1024;
