import { createContext, useContext } from 'react';

import type { PageBlock } from './types';

export interface IPageBlocksContext {
  /** All blocks of the rendered page – for blocks that point at others (table of contents). */
  blocks: PageBlock[];
  /** Slug of the page ('' = preview, e.g. in the admin editor: forms can't be sent). */
  slug: string;
}

export const PageBlocksContext = createContext<IPageBlocksContext>({ blocks: [], slug: '' });

export const usePageBlocks = () => useContext(PageBlocksContext);
