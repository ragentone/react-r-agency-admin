import type { TFunction } from 'i18next';

import type { INotifyItem, INotifyRaw, INotifyState, NotifyType } from './types';

const TYPES: NotifyType[] = ['info', 'success', 'warning', 'error'];

const asObject = (value: unknown): Record<string, unknown> => {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      return parsed && typeof parsed === 'object' ? parsed : {};
    } catch {
      return {};
    }
  }
  return {};
};

/** Record of the listing / live websocket notify → one shape for the UI. */
export const normalizeNotify = (raw: INotifyRaw): INotifyItem | null => {
  const id = raw.notifyId;
  if (!id || !raw.message) return null;
  const type = TYPES.includes(raw.type as NotifyType) ? (raw.type as NotifyType) : 'info';
  const date = raw.date && !Number.isNaN(new Date(raw.date).getTime()) ? raw.date : null;
  return {
    id,
    title: raw.title ?? null,
    message: raw.message,
    type,
    date: date ?? new Date().toISOString(),
    from: raw.from?.id ? raw.from : null,
    actions: (raw.actions ?? []).filter(action => Boolean(action?.emit && action.label)),
    seen: Boolean(raw.seen),
    removable: raw.removable !== false,
    translate: Boolean(raw.translate),
    args: { ...asObject(raw.args), ...asObject(raw.payload) },
    component: raw.component ?? null,
    identifier: raw.identifier ?? null,
    flash: Boolean(raw.flash),
  };
};

export const normalizeState = (raw: Partial<INotifyState> | null | undefined): INotifyState => {
  const total = Math.max(0, Number(raw?.total) || 0);
  const unread = Math.max(0, Number(raw?.unread) || 0);
  return { total, unread, hasNew: unread > 0 || Boolean(raw?.hasNew) };
};

/** Looks like a translation key (`user_relation_request_notify_title`, `default.button.accept`). */
const isKey = (text: string) => /^[a-z0-9]+([._][a-z0-9]+)+$/i.test(text);

/**
 * Text of a notification. The runtime sends either translation keys (backend namespace –
 * see `locales/*.json`, keys with `_` land in `backend`) or plain text. The sender's alias is
 * available as `{{name}}`, the notify args as their own keys.
 */
export const notifyText = (
  t: TFunction,
  text: string | null | undefined,
  item: Pick<INotifyItem, 'args' | 'from'>
): string => {
  if (!text) return '';
  if (!isKey(text)) return text;
  const values = { ...item.args, name: item.from?.alias ?? '' };
  // `default.button.accept` → own namespace (dots = nesting), `user_…` → backend.
  return t(text.includes('.') ? `notify:${text}` : `backend:${text}`, {
    ...values,
    defaultValue: text.includes('.') ? (text.split('.').pop() ?? text) : text,
  });
};

/** "now", "3m", "5h", "2d" (like X) – a short date after a week. */
export const formatNotifyTime = (iso: string, locale?: string, nowLabel = 'now'): string => {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  const seconds = Math.max(0, (Date.now() - date.getTime()) / 1000);
  const unit = (value: number, kind: 'minute' | 'hour' | 'day') =>
    new Intl.NumberFormat(locale, { style: 'unit', unit: kind, unitDisplay: 'narrow' }).format(
      value
    );
  if (seconds < 60) return nowLabel;
  if (seconds < 3_600) return unit(Math.floor(seconds / 60), 'minute');
  if (seconds < 86_400) return unit(Math.floor(seconds / 3_600), 'hour');
  if (seconds < 7 * 86_400) return unit(Math.floor(seconds / 86_400), 'day');
  return new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'short',
    year: date.getFullYear() === new Date().getFullYear() ? undefined : 'numeric',
  }).format(date);
};

/** Full date for the `title` / `dateTime` attribute. */
export const formatNotifyDateTime = (iso: string, locale?: string): string => {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeStyle: 'short' }).format(date);
};

/** Badge text: 1 … 99, then "99+". */
export const badgeText = (count: number) => (count > 99 ? '99+' : String(count));
