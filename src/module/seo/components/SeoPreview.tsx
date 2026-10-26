import { absoluteUrl } from '@core/seo/resolve';
import { cn } from '@ui/lib/utils';
import { Globe, ImageOff } from 'lucide-react';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

export interface ISeoPreviewProps {
  /** Title with template (search result). */
  documentTitle: string;
  /** Title without template (X card). */
  title: string;
  description: string;
  /** Absolute page url. */
  url: string;
  image: string;
  siteName: string;
  origin: string;
  noindex?: boolean;
}

const host = (url: string) => {
  try {
    return new URL(url).host;
  } catch {
    return url;
  }
};

const crumbs = (url: string) => {
  try {
    const parsed = new URL(url);
    const parts = parsed.pathname.split('/').filter(Boolean);
    return [parsed.host, ...parts].join(' › ');
  } catch {
    return url;
  }
};

/** How the page shows up on Google and as a card on X – updates while typing. */
export const SeoPreview: React.FC<ISeoPreviewProps> = ({
  documentTitle,
  title,
  description,
  url,
  image,
  siteName,
  origin,
  noindex,
}) => {
  const { t } = useTranslation('seo');
  const [broken, setBroken] = useState<string | null>(null);
  const src = absoluteUrl(image, origin);
  const showImage = Boolean(src) && broken !== src;

  return (
    <section aria-label={t('preview.label')} className="space-y-4">
      <div>
        <p className="mb-2 text-caption font-semibold text-muted-foreground">
          {t('preview.google')}
        </p>
        <div
          className={cn(
            'rounded-2xl border border-border/60 p-4',
            noindex && 'opacity-50 [&_*]:line-through'
          )}
        >
          <div className="flex items-center gap-2.5">
            <span className="grid size-7 shrink-0 place-items-center rounded-full bg-foreground/[0.07]">
              <Globe className="size-3.5" aria-hidden="true" />
            </span>
            <span className="min-w-0">
              <span className="block truncate text-caption font-medium text-foreground">
                {siteName || host(url)}
              </span>
              <span className="block truncate text-xs text-muted-foreground">{crumbs(url)}</span>
            </span>
          </div>
          <p className="mt-2 line-clamp-2 text-title leading-snug font-semibold text-foreground">
            {documentTitle || t('preview.noTitle')}
          </p>
          <p className="mt-1 line-clamp-2 text-caption text-muted-foreground">
            {description || t('preview.noDescription')}
          </p>
        </div>
        {noindex && (
          <p className="mt-1.5 text-caption text-muted-foreground">{t('preview.noindex')}</p>
        )}
      </div>

      <div>
        <p className="mb-2 text-caption font-semibold text-muted-foreground">{t('preview.x')}</p>
        <div className="overflow-hidden rounded-2xl border border-border/60">
          <div className="relative aspect-[1.91/1] bg-foreground/[0.06]">
            {showImage ? (
              <img
                src={src}
                alt=""
                loading="lazy"
                onError={() => setBroken(src)}
                className="size-full object-cover"
              />
            ) : (
              <div className="grid size-full place-items-center text-muted-foreground">
                <span className="flex flex-col items-center gap-1.5 text-caption">
                  <ImageOff className="size-5" aria-hidden="true" />
                  {src ? t('preview.imageBroken') : t('preview.noImage')}
                </span>
              </div>
            )}
            <span className="absolute bottom-2 left-2 max-w-[85%] truncate rounded-md bg-black/70 px-1.5 py-0.5 text-xs text-white">
              {title || siteName || host(url)}
            </span>
          </div>
        </div>
        <p className="mt-1.5 text-caption text-muted-foreground">
          {t('preview.from', { host: host(url) })}
        </p>
      </div>
    </section>
  );
};
