import type { IEventBlockData } from './types';

const pad = (value: number) => String(value).padStart(2, '0');
const utc = (date: Date) =>
  `${date.getUTCFullYear()}${pad(date.getUTCMonth() + 1)}${pad(date.getUTCDate())}T${pad(date.getUTCHours())}${pad(date.getUTCMinutes())}${pad(date.getUTCSeconds())}Z`;
/** Local calendar day (all-day events have no time zone). */
const day = (date: Date) =>
  `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}`;
const escape = (text: string) =>
  text.replace(/\\/g, '\\\\').replace(/\r?\n/g, '\\n').replace(/;/g, '\\;').replace(/,/g, '\\,');

/** Lines longer than 75 characters continue on the next line with a leading space (RFC 5545). */
const fold = (line: string) => {
  const parts: string[] = [];
  for (let at = 0; at < line.length; at += 74) parts.push(line.slice(at, at + 74));
  return parts.join('\r\n ');
};

/** Valid start date of an event block, else null. */
export const eventStart = (data: IEventBlockData): Date | null => {
  const date = new Date(data.start);
  return Number.isNaN(date.getTime()) ? null : date;
};

/** End date – only when set, valid and after the start. */
export const eventEnd = (data: IEventBlockData): Date | null => {
  const start = eventStart(data);
  const end = new Date(data.end);
  return start && data.end && !Number.isNaN(end.getTime()) && end > start ? end : null;
};

/** iCalendar text of the event (opens in every calendar app). */
export const eventIcs = (data: IEventBlockData, uid: string): string | null => {
  const start = eventStart(data);
  if (!start) return null;
  const end = eventEnd(data);
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//r-agency//site-page//EN',
    'BEGIN:VEVENT',
  ];
  lines.push(`UID:${uid}@r-agency`, `DTSTAMP:${utc(new Date())}`);
  if (data.allDay) {
    // DTEND of a whole-day event is exclusive: the day after the last day.
    const last = new Date(end ?? start);
    last.setDate(last.getDate() + 1);
    lines.push(`DTSTART;VALUE=DATE:${day(start)}`, `DTEND;VALUE=DATE:${day(last)}`);
  } else {
    lines.push(`DTSTART:${utc(start)}`, `DTEND:${utc(end ?? new Date(start.getTime() + 3600000))}`);
  }
  lines.push(`SUMMARY:${escape(data.title || 'Event')}`);
  if (data.location) lines.push(`LOCATION:${escape(data.location)}`);
  if (data.text) lines.push(`DESCRIPTION:${escape(data.text)}`);
  lines.push('END:VEVENT', 'END:VCALENDAR');
  return lines.map(fold).join('\r\n') + '\r\n';
};

/** Starts the download of the .ics file (object url is released right after). */
export const downloadIcs = (content: string, name: string) => {
  const url = URL.createObjectURL(new Blob([content], { type: 'text/calendar;charset=utf-8' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = `${
    name
      .replace(/[^a-z0-9]+/gi, '-')
      .replace(/^-|-$/g, '')
      .toLowerCase() || 'event'
  }.ics`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
};
