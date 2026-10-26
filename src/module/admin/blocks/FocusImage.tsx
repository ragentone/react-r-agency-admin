import { cn } from '@ui/lib/utils';
import React, { useCallback, useEffect, useRef, useState } from 'react';

import { pageImageSrcSet } from './image.utils';

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

export interface IFocusImageProps {
  src: string;
  /** Focus point in percent of the image (0–100). */
  focusX: number;
  focusY: number;
  className?: string;
  loading?: 'eager' | 'lazy';
  /** `sizes` of the srcset (default: full viewport width). */
  sizes?: string;
  /** Describes the image ('' = decorative). */
  alt?: string;
}

/**
 * Cover image that keeps its focus point in the **centre of the box** (as far as the image
 * reaches) – for every width and height. A plain `object-position: x% y%` lets the point drift
 * across the box when the width changes; here the offset is calculated from the real image and
 * box size (ResizeObserver), so resizing only scales around the point.
 */
export const FocusImage: React.FC<IFocusImageProps> = ({
  src,
  focusX,
  focusY,
  className,
  loading = 'lazy',
  sizes = '100vw',
  alt = '',
}) => {
  const image = useRef<HTMLImageElement>(null);
  // Fallback until the size is known.
  const [position, setPosition] = useState(`${focusX}% ${focusY}%`);

  const update = useCallback(() => {
    const element = image.current;
    if (!element?.naturalWidth || !element.clientWidth || !element.clientHeight) return;
    const boxW = element.clientWidth;
    const boxH = element.clientHeight;
    const scale = Math.max(boxW / element.naturalWidth, boxH / element.naturalHeight);
    const width = element.naturalWidth * scale;
    const height = element.naturalHeight * scale;
    // Point in the centre, but never show an edge of the box without image.
    const x = clamp(boxW / 2 - (focusX / 100) * width, boxW - width, 0);
    const y = clamp(boxH / 2 - (focusY / 100) * height, boxH - height, 0);
    setPosition(`${Math.round(x)}px ${Math.round(y)}px`);
  }, [focusX, focusY]);

  useEffect(() => {
    const element = image.current;
    if (!element) return;
    update();
    const observer = new ResizeObserver(update);
    observer.observe(element);
    return () => observer.disconnect();
  }, [update, src]);

  const srcSet = pageImageSrcSet(src);

  return (
    <img
      ref={image}
      src={src}
      srcSet={srcSet}
      sizes={srcSet ? sizes : undefined}
      alt={alt}
      loading={loading}
      decoding="async"
      fetchPriority={loading === 'eager' ? 'high' : undefined}
      onLoad={update}
      style={{ objectPosition: position }}
      className={cn('object-cover', className)}
    />
  );
};
