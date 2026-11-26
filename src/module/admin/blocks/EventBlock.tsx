import { cn } from '@ui/lib/utils';
import { CalendarPlus, MapPin } from 'lucide-react';
import React, { useId, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { BlockLink } from './BlockLink';
import { downloadIcs, eventEnd, eventIcs, eventStart } from './event.ics';
import type { IEventBlockData } from './types';

const BUTTON =
  'inline-flex h-11 items-center justify-center gap-2 rounded-full px-5 text-body font-bold transition-opacity hover:opacity-85';

/** Date with place: day badge, readable date / time, map link and "add to calendar" (.ics). */
export const EventBlock: React.FC<{ data: IEventBlockData }> = ({ data }) => {
  const { t, i18n } = useTranslation('admin');
  const uid = useId().replace(/:/g, '');
  /** Fixed at mount: "past" must not flip while the page is open. */
  const [now] = useState(() => Date.now());
  const start = eventStart(data);
  if (!start) return null;
  const end = eventEnd(data);
  const lang = i18n.language;
  const date = (value: Date, options: Intl.DateTimeFormatOptions) =>
    new Intl.DateTimeFormat(lang, options).format(value);
  const sameDay = end && start.toDateString() === end.toDateString();
  const dayFormat: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  };
  const timeFormat: Intl.DateTimeFormatOptions = { hour: '2-digit', minute: '2-digit' };
  let when = date(start, dayFormat);
  if (data.allDay) {
    if (end && !sameDay) when += ` – ${date(end, dayFormat)}`;
  } else if (sameDay) {
    when += `, ${date(start, timeFormat)} – ${date(end, timeFormat)}`;
  } else if (end) {
    when = `${date(start, { ...dayFormat, ...timeFormat })} – ${date(end, { ...dayFormat, ...timeFormat })}`;
  } else {
    when += `, ${date(start, timeFormat)}`;
  }
  const over = (end ?? start).getTime() < now;
  const location = data.location.trim();
  const mapUrl = `https://www.openstreetmap.org/search?query=${encodeURIComponent(location)}`;
  const add = () => {
    const ics = eventIcs(data, uid);
    if (ics) downloadIcs(ics, data.title);
  };
  return (
    <section className="flex gap-4 rounded-2xl border border-border/50 p-4">
      <div
        aria-hidden="true"
        className={cn(
          'flex size-16 shrink-0 flex-col items-center justify-center rounded-xl bg-foreground text-background',
          over && 'opacity-40'
        )}
      >
        <span className="text-caption font-bold uppercase">
          {date(start, { month: 'short' }).replace('.', '')}
        </span>
        <span className="text-2xl leading-none font-bold tabular-nums">{start.getDate()}</span>
      </div>
      <div className="min-w-0 flex-1">
        {over && (
          <span className="mb-1 inline-block rounded-full border border-border/50 px-2 py-0.5 text-caption font-semibold text-muted-foreground">
            {t('blocks.event.over')}
          </span>
        )}
        {data.title && <h2 className="text-xl font-bold tracking-tight">{data.title}</h2>}
        <p className="mt-0.5 text-body font-semibold">
          <time dateTime={start.toISOString()}>{when}</time>
        </p>
        {location && (
          <a
            href={mapUrl}
            target="_blank"
            rel="noopener noreferrer nofollow"
            className="mt-1 inline-flex items-start gap-1.5 text-body text-muted-foreground hover:text-foreground"
          >
            <MapPin className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            <span className="whitespace-pre-line">{location}</span>
          </a>
        )}
        {data.text && (
          <p className="mt-2 text-body whitespace-pre-line text-muted-foreground">{data.text}</p>
        )}
        <div className="mt-4 flex flex-wrap gap-2">
          {!over && (
            <button
              type="button"
              onClick={add}
              className={cn(BUTTON, 'border border-border/50 hover:bg-foreground/[0.04]')}
            >
              <CalendarPlus className="size-4" aria-hidden="true" />
              {t('blocks.event.addToCalendar')}
            </button>
          )}
          {data.buttonLabel && data.buttonUrl && (
            <BlockLink
              href={data.buttonUrl}
              className={cn(BUTTON, 'bg-foreground text-background')}
            >
              {data.buttonLabel}
            </BlockLink>
          )}
        </div>
      </div>
    </section>
  );
};
