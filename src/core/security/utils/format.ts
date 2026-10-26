import type { AuthPlatform } from '../types';

export const PLATFORM_LABEL: Record<AuthPlatform, string> = {
  iphone: 'iPhone',
  ipad: 'iPad',
  android: 'Android',
  android_tablet: 'Android Tablet',
  mac: 'Mac',
  windows: 'Windows',
  linux: 'Linux',
  chromeos: 'ChromeOS',
  unknown: '',
};

/** "vor 5 Min." / "gestern" … via Intl. */
export const relativeTime = (iso: string, locale: string): string => {
  const date = new Date(iso);
  const seconds = Math.round((date.getTime() - Date.now()) / 1000);
  const format = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
  const abs = Math.abs(seconds);
  if (abs < 60) return format.format(0, 'second');
  if (abs < 3600) return format.format(Math.round(seconds / 60), 'minute');
  if (abs < 86_400) return format.format(Math.round(seconds / 3600), 'hour');
  if (abs < 30 * 86_400) return format.format(Math.round(seconds / 86_400), 'day');
  return date.toLocaleDateString(locale, { day: 'numeric', month: 'short', year: 'numeric' });
};

export const formatDate = (iso: string, locale: string): string =>
  new Date(iso).toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric' });

/** Downloads JSON as a file (data export). */
export const downloadJson = (data: unknown, name: string) => {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = name;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};

/** Personal invite link (sign-up page with `?invite=`). */
export const inviteUrl = (token: string) =>
  `${window.location.origin}/auth?invite=${encodeURIComponent(token)}`;
