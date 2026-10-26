import { pageImageUuid } from '../hooks/use.admin.page.image';
import type { ImageRatio } from './types';

/** Widths the static server renders for `srcset` (fixed list → few cache variants). */
const SRCSET_WIDTHS = [640, 960, 1280, 1920, 2400];

/**
 * Own uploads (`/static/upload/site-page/…`): the static server resizes on request
 * (`?w=` + `f=inside` keeps the aspect ratio, `q` = WebP quality). GIFs stay as they are
 * (the resize would drop the animation); external urls are used unchanged.
 */
export const pageImageSrcSet = (url: string): string | undefined => {
  if (!pageImageUuid(url) || /\.gif(\?|$)/i.test(url) || url.includes('?')) return undefined;
  return SRCSET_WIDTHS.map(width => `${url}?w=${width}&f=inside&q=80 ${width}w`).join(', ');
};

/** Fixed image formats (Tailwind needs the literal classes). */
export const RATIO_CLASS: Record<Exclude<ImageRatio, 'auto'>, string> = {
  '16/9': 'aspect-video',
  '4/3': 'aspect-[4/3]',
  '1/1': 'aspect-square',
  '3/4': 'aspect-[3/4]',
};
