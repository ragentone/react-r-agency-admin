import type { TFunction } from 'i18next';

import { MESSENGER_GROUP_GAP_MS, MESSENGER_TIME_GAP_MS } from './const.ts';
import type { IMessengerLocalMessage } from './types.ts';

const DAY = 86_400_000;

const startOfDay = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());

/** Inbox time (like Messenger): "Jetzt", "5 Min.", "3 Std.", weekday, date. */
export const formatInboxTime = (iso: string, t: TFunction, locale: string) => {
  const date = new Date(iso);
  const diff = Date.now() - date.getTime();
  if (diff < 60_000) return t('time.now');
  if (diff < 3_600_000) return t('time.minutes', { count: Math.floor(diff / 60_000) });
  if (diff < DAY) return t('time.hours', { count: Math.floor(diff / 3_600_000) });
  if (diff < 7 * DAY) return date.toLocaleDateString(locale, { weekday: 'short' });
  return date.toLocaleDateString(locale, { day: 'numeric', month: 'short' });
};

/** Separator between bubble groups: "Heute 12:30", "Gestern 09:12", "Mo 18:00", "3. Okt., 10:00". */
export const formatSeparator = (iso: string, t: TFunction, locale: string) => {
  const date = new Date(iso);
  const time = date.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' });
  const days = Math.round((startOfDay(new Date()).getTime() - startOfDay(date).getTime()) / DAY);
  if (days === 0) return `${t('time.today')} ${time}`;
  if (days === 1) return `${t('time.yesterday')} ${time}`;
  if (days < 7) return `${date.toLocaleDateString(locale, { weekday: 'short' })} ${time}`;
  return date.toLocaleString(locale, {
    day: 'numeric',
    month: 'short',
    year: date.getFullYear() === new Date().getFullYear() ? undefined : 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const formatFullTime = (iso: string, locale: string) =>
  new Date(iso).toLocaleString(locale, { dateStyle: 'medium', timeStyle: 'short' });

const EMOJI_ONLY =
  /^(?:\p{Extended_Pictographic}(?:️|\p{Emoji_Modifier})?(?:‍\p{Extended_Pictographic}(?:️|\p{Emoji_Modifier})?)*|\s)+$/u;

/** 1–3 emojis without text → shown large without a bubble (like Messenger). */
export const isBigEmoji = (body: string) => {
  const text = body.trim();
  if (!text || !EMOJI_ONLY.test(text)) return false;
  const count = [
    ...new Intl.Segmenter(undefined, { granularity: 'grapheme' }).segment(text),
  ].filter(part => part.segment.trim()).length;
  return count <= 3;
};

export interface IMessengerRow {
  message: IMessengerLocalMessage;
  mine: boolean;
  /** Time separator above this message. */
  separator: string | null;
  /** Position in a bubble group (rounded corners, avatar on the last one). */
  first: boolean;
  last: boolean;
}

/** Groups consecutive messages of the same sender (gap < 1 min) and adds time separators. */
export const buildRows = (
  messages: IMessengerLocalMessage[],
  me: string | null,
  separator: (iso: string) => string
): IMessengerRow[] =>
  messages.map((message, i) => {
    const prev = messages[i - 1];
    const next = messages[i + 1];
    const time = new Date(message.createdAt).getTime();
    const gapPrev = prev ? time - new Date(prev.createdAt).getTime() : Infinity;
    const gapNext = next ? new Date(next.createdAt).getTime() - time : Infinity;
    const newSection = gapPrev > MESSENGER_TIME_GAP_MS;
    const nextSection = gapNext > MESSENGER_TIME_GAP_MS;
    const sameAsPrev =
      !!prev &&
      !newSection &&
      prev.senderId === message.senderId &&
      gapPrev < MESSENGER_GROUP_GAP_MS;
    const sameAsNext =
      !!next &&
      !nextSection &&
      next.senderId === message.senderId &&
      gapNext < MESSENGER_GROUP_GAP_MS;
    return {
      message,
      mine: message.senderId === me,
      separator: newSection ? separator(message.createdAt) : null,
      first: !sameAsPrev,
      last: !sameAsNext,
    };
  });

export const initialsOf = (name: string) =>
  (name || '?').replace(/^@/, '').slice(0, 2).toUpperCase();
