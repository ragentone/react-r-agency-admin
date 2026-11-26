import { cn } from '@ui/lib/utils';
import { ExternalLink, MapPin } from 'lucide-react';
import React, { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { hasMapPosition, type IMapBlockData } from './types';

const MapLeaflet = lazy(() => import('./MapLeaflet'));

const RATIO: Record<IMapBlockData['ratio'], string> = {
  '16/9': 'aspect-[4/3] sm:aspect-video',
  '4/3': 'aspect-[4/3]',
  '1/1': 'aspect-square',
};

/** Loads the map only when it comes into view (no tile requests for a page that is not read). */
const useInView = () => {
  const ref = useRef<HTMLDivElement>(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const node = ref.current;
    if (!node || seen) return;
    const observer = new IntersectionObserver(
      entries => entries.some(entry => entry.isIntersecting) && setSeen(true),
      { rootMargin: '200px' }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [seen]);
  return [ref, seen] as const;
};

/** One place: title, map (OpenStreetMap), address and a link to open it in OpenStreetMap. */
export const MapBlock: React.FC<{ data: IMapBlockData }> = ({ data }) => {
  const { t } = useTranslation('admin');
  const [ref, seen] = useInView();
  if (!hasMapPosition(data) && !data.address && !data.title) return null;
  const link = `https://www.openstreetmap.org/?mlat=${data.lat}&mlon=${data.lon}#map=${data.zoom}/${data.lat}/${data.lon}`;
  return (
    <figure>
      {data.title && <h2 className="mb-4 text-xl font-bold tracking-tight">{data.title}</h2>}
      {hasMapPosition(data) && (
        <div
          ref={ref}
          className={cn(
            'relative isolate overflow-hidden rounded-xl border border-border/50 bg-muted',
            RATIO[data.ratio]
          )}
        >
          {seen && (
            <Suspense fallback={null}>
              <MapLeaflet
                lat={data.lat}
                lon={data.lon}
                zoom={data.zoom}
                label={data.address || data.title}
              />
            </Suspense>
          )}
        </div>
      )}
      {(data.address || hasMapPosition(data)) && (
        <p className="mt-3 flex items-start gap-2 text-body">
          <MapPin className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
          <span className="min-w-0 flex-1">
            {data.address}
            {hasMapPosition(data) && (
              <a
                href={link}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-2 inline-flex items-center gap-1 font-medium underline underline-offset-2"
              >
                {t('blocks.map.open')}
                <ExternalLink className="size-3.5" aria-hidden="true" />
              </a>
            )}
          </span>
        </p>
      )}
      {data.caption && (
        <figcaption className="mt-2 text-caption text-muted-foreground">{data.caption}</figcaption>
      )}
    </figure>
  );
};
