import { cn } from '@ui/lib/utils';
import { Play } from 'lucide-react';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { pageImageSrcSet, VIDEO_RATIO_CLASS } from './image.utils';
import { type IVideoBlockData, videoEmbed } from './types';

const SIZES = '(min-width: 768px) 720px, 100vw';

/**
 * Two-click embed: nothing is loaded from YouTube / Vimeo before the visitor taps play.
 * The optional poster is an own upload, so the preview doesn't ask the provider either.
 */
export const VideoBlock: React.FC<{ data: IVideoBlockData }> = ({ data }) => {
  const { t } = useTranslation('admin');
  const [active, setActive] = useState(false);
  const embed = videoEmbed(data.url);
  if (!embed) return null;
  const provider = embed.provider === 'youtube' ? 'YouTube' : 'Vimeo';
  const srcSet = data.posterUrl ? pageImageSrcSet(data.posterUrl) : undefined;
  return (
    <figure className="m-0">
      <div
        className={cn(
          'relative overflow-hidden rounded-2xl bg-neutral-900',
          VIDEO_RATIO_CLASS[data.ratio] ?? VIDEO_RATIO_CLASS['16/9']
        )}
      >
        {active ? (
          <iframe
            src={embed.src}
            title={data.caption || provider}
            allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
            className="absolute inset-0 size-full"
          />
        ) : (
          <>
            {data.posterUrl && (
              <img
                src={data.posterUrl}
                srcSet={srcSet}
                sizes={srcSet ? SIZES : undefined}
                alt=""
                loading="lazy"
                decoding="async"
                className="absolute inset-0 size-full object-cover"
              />
            )}
            <button
              type="button"
              onClick={() => setActive(true)}
              aria-label={t('blocks.video.play', { provider })}
              className={cn(
                'absolute inset-0 flex flex-col items-center justify-center gap-3 p-6 text-center text-white',
                data.posterUrl && 'bg-black/30'
              )}
            >
              <span className="grid size-16 place-items-center rounded-full bg-white/15 backdrop-blur transition-transform hover:scale-105">
                <Play className="size-7 translate-x-0.5 fill-current" aria-hidden="true" />
              </span>
              <span className="max-w-xs text-caption text-white/80">
                {t('blocks.video.consent', { provider })}
              </span>
            </button>
          </>
        )}
      </div>
      {data.caption && (
        <figcaption className="mt-2 text-caption text-muted-foreground">{data.caption}</figcaption>
      )}
    </figure>
  );
};
