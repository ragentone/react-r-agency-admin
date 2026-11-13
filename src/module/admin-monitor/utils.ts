const UNITS = ['B', 'KB', 'MB', 'GB', 'TB'] as const;

/** `1536` → `1.5 KB`. */
export const formatBytes = (bytes: number): string => {
  let value = Math.max(0, bytes);
  let unit = 0;
  while (value >= 1024 && unit < UNITS.length - 1) {
    value /= 1024;
    unit += 1;
  }
  return `${value >= 100 || unit === 0 ? Math.round(value) : value.toFixed(1)} ${UNITS[unit]}`;
};

/** Seconds → `3d 4h`, `2h 5m` or `45s`. */
export const formatDuration = (seconds: number): string => {
  const d = Math.floor(seconds / 86_400);
  const h = Math.floor((seconds % 86_400) / 3_600);
  const m = Math.floor((seconds % 3_600) / 60);
  if (d) return `${d}d ${h}h`;
  if (h) return `${h}h ${m}m`;
  return m ? `${m}m` : `${Math.floor(seconds)}s`;
};

export const percent = (part: number, total: number): number =>
  total > 0 ? Math.min(100, Math.round((part / total) * 100)) : 0;

/** Unix ms → `14:05:30`. */
export const clock = (t: number): string =>
  new Date(t).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
