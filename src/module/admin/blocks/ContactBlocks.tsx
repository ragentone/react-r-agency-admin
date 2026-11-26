import { cn } from '@ui/lib/utils';
import { Clock, Download, FileText, Mail, MapPin, Phone } from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { BlockLink } from './BlockLink';
import { type IContactBlockData, type IDownloadsBlockData, isSafeUrl } from './types';

const ROW =
  'flex min-h-13 items-center gap-3 px-4 py-3 text-body transition-colors hover:bg-foreground/[0.03]';

const Icon: React.FC<{ icon: typeof Phone }> = ({ icon: Glyph }) => (
  <span className="grid size-9 shrink-0 place-items-center rounded-full bg-foreground/[0.05]">
    <Glyph className="size-4" aria-hidden="true" />
  </span>
);

/* ---------------------------------------------------------------- contact */

/** Phone and mail tap to call / write, the address opens OpenStreetMap (no tracking). */
export const ContactBlock: React.FC<{ data: IContactBlockData }> = ({ data }) => {
  const { t } = useTranslation('admin');
  const phone = data.phone.trim();
  const email = data.email.trim();
  const address = data.address.trim();
  const hours = data.hours.trim();
  if (!phone && !email && !address && !hours) return null;
  const mapUrl = `https://www.openstreetmap.org/search?query=${encodeURIComponent(address)}`;
  return (
    <section>
      {data.title && <h2 className="mb-3 text-title font-bold">{data.title}</h2>}
      <div className="divide-y divide-border/50 overflow-hidden rounded-2xl border border-border/50">
        {phone && (
          <a href={`tel:${phone.replace(/[^\d+]/g, '')}`} className={ROW}>
            <Icon icon={Phone} />
            <span className="min-w-0">
              <span className="block text-caption text-muted-foreground">
                {t('blocks.contact.phone')}
              </span>
              <span className="font-semibold tabular-nums">{phone}</span>
            </span>
          </a>
        )}
        {email && (
          <a href={`mailto:${email}`} className={ROW}>
            <Icon icon={Mail} />
            <span className="min-w-0">
              <span className="block text-caption text-muted-foreground">
                {t('blocks.contact.email')}
              </span>
              <span className="block truncate font-semibold">{email}</span>
            </span>
          </a>
        )}
        {address && (
          <a href={mapUrl} target="_blank" rel="noopener noreferrer nofollow" className={ROW}>
            <Icon icon={MapPin} />
            <span className="min-w-0">
              <span className="block text-caption text-muted-foreground">
                {t('blocks.contact.address')}
              </span>
              <span className="block font-semibold whitespace-pre-line">{address}</span>
            </span>
          </a>
        )}
        {hours && (
          <div className={cn(ROW, 'items-start hover:bg-transparent')}>
            <Icon icon={Clock} />
            <span className="min-w-0">
              <span className="block text-caption text-muted-foreground">
                {t('blocks.contact.hours')}
              </span>
              <span className="block whitespace-pre-line">{hours}</span>
            </span>
          </div>
        )}
      </div>
    </section>
  );
};

/* ---------------------------------------------------------------- downloads */

/** File type from the url (`.pdf` → `PDF`), '' if unknown. */
const fileTypeOf = (url: string) =>
  /\.([a-z0-9]{2,5})(?:[?#]|$)/i.exec(url)?.[1]?.toUpperCase() ?? '';

export const DownloadsBlock: React.FC<{ data: IDownloadsBlockData }> = ({ data }) => {
  const { t } = useTranslation('admin');
  const items = data.items.filter(item => item.label && item.url && isSafeUrl(item.url));
  if (!items.length) return null;
  return (
    <section>
      {data.title && <h2 className="mb-3 text-title font-bold">{data.title}</h2>}
      <ul className="divide-y divide-border/50 overflow-hidden rounded-2xl border border-border/50">
        {items.map((item, index) => {
          const meta = [fileTypeOf(item.url), item.size.trim()].filter(Boolean).join(' · ');
          return (
            <li key={index}>
              <BlockLink href={item.url} className={ROW}>
                <Icon icon={FileText} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-semibold">{item.label}</span>
                  {(meta || item.note) && (
                    <span className="block truncate text-caption text-muted-foreground">
                      {[meta, item.note.trim()].filter(Boolean).join(' – ')}
                    </span>
                  )}
                </span>
                <Download
                  className="size-5 shrink-0 text-muted-foreground"
                  aria-label={t('blocks.downloads.open')}
                />
              </BlockLink>
            </li>
          );
        })}
      </ul>
    </section>
  );
};
