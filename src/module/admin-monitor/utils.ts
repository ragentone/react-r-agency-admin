import type { IMonitorMetricInfo } from './types.alert';
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

/** Bytes per second → `1.2 MB/s`. */
export const formatRate = (bytesPerSecond: number): string => `${formatBytes(bytesPerSecond)}/s`;

/** Unix ms or ISO string → `14:05`. */
export const clockShort = (value: number | string): string =>
  new Date(value).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

/** History hour `2026-11-13T09` → `13.11. 09:00` in local time. */
export const hourLabel = (hour: string): string => {
  const date = new Date(`${hour}:00:00Z`);
  return `${date.toLocaleDateString([], { day: '2-digit', month: '2-digit' })} ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
};

/** Number with thousands separator. */
export const formatCount = (value: number): string => value.toLocaleString();

/** Name of a metric in the UI language (`de-DE` → `de`); fallback English, then the id. */
export const metricName = (
  metrics: readonly IMonitorMetricInfo[],
  id: string,
  language: string
): string => {
  const labels = metrics.find(info => info.id === id)?.labels;
  return labels?.[language.slice(0, 2)] ?? labels?.en ?? id;
};

/** Unit of a metric (`%` when unknown). */
export const metricUnit = (metrics: readonly IMonitorMetricInfo[], id: string): string =>
  metrics.find(info => info.id === id)?.unit ?? '%';
