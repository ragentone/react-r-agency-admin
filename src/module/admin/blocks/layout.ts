import { PageBlockManager } from '@core/blocks/manager.ts';

import { isAppBlock, type PageBlock } from './types';

/** Reading column of a page (everything except full width blocks). */
export const SITE_PAGE_COLUMN = 'mx-auto w-full max-w-[720px] px-4 sm:px-6';

/** Rounded banner: spacing to the page edges (wrapper padding). */
export const SITE_PAGE_INSET = 'px-3 sm:px-6';

/** Rounded banner → inset from the edges instead of edge to edge. */
export const isInsetBlock = (block: PageBlock) =>
  !isAppBlock(block) && block.type === 'hero' && Boolean(block.data.rounded);

/** Spans the page width: the banner and app blocks with `fullWidth`. */
export const isFullWidthBlock = (block: PageBlock) =>
  isAppBlock(block) ? Boolean(PageBlockManager.get(block.type)?.fullWidth) : block.type === 'hero';
