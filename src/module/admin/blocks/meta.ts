import { PageBlockManager } from '@core/blocks/manager.ts';
import {
  CalendarClock,
  Columns2,
  Footprints,
  Gauge,
  Image as ImageIcon,
  Info,
  LayoutGrid,
  LayoutTemplate,
  ListCollapse,
  Megaphone,
  PanelsTopLeft,
  Quote,
  SeparatorHorizontal,
  Table2,
  Type,
  Youtube,
} from 'lucide-react';
import { Puzzle } from 'lucide-react';

import { htmlToText } from '../utils';
import { isAppBlock, type PageBlock, type SitePageBlockType } from './types';

export const BLOCK_ICONS: Record<SitePageBlockType, typeof Type> = {
  hero: LayoutTemplate,
  text: Type,
  image: ImageIcon,
  split: Columns2,
  cards: LayoutGrid,
  cta: Megaphone,
  notice: Info,
  faq: ListCollapse,
  quote: Quote,
  video: Youtube,
  divider: SeparatorHorizontal,
  stats: Gauge,
  steps: Footprints,
  tabs: PanelsTopLeft,
  countdown: CalendarClock,
  table: Table2,
};

/** Icon of a block – app blocks from their registration (puzzle = app not loaded). */
export const blockIcon = (block: PageBlock) =>
  isAppBlock(block) ? (PageBlockManager.get(block.type)?.icon ?? Puzzle) : BLOCK_ICONS[block.type];

/** Label (translation key) of a block. */
export const blockLabel = (block: PageBlock) =>
  isAppBlock(block)
    ? (PageBlockManager.get(block.type)?.label ?? block.type)
    : `admin:blocks.type.${block.type}.label`;

/** Short preview line of a block in the editor list ('' = nothing filled in yet). */
export const blockSummary = (block: PageBlock): string => {
  if (isAppBlock(block)) {
    const definition = PageBlockManager.get(block.type);
    return definition?.summary?.(block.data) ?? '';
  }
  switch (block.type) {
    case 'hero':
      return block.data.title || block.data.text || (block.data.imageUrl ? '🖼' : '');
    case 'image':
      return block.data.caption || block.data.alt || (block.data.imageUrl ? '🖼' : '');
    case 'split':
      return block.data.title || block.data.text || (block.data.imageUrl ? '🖼' : '');
    case 'cards':
      return (
        block.data.title ||
        block.data.items
          .map(item => item.title)
          .filter(Boolean)
          .join(' · ')
      );
    case 'cta':
    case 'notice':
      return block.data.title || block.data.text;
    case 'text':
      return htmlToText(block.data.html).slice(0, 120);
    case 'faq':
      return (
        block.data.title ||
        block.data.items
          .map(item => item.question)
          .filter(Boolean)
          .join(' · ')
      );
    case 'quote':
      return block.data.author || block.data.text;
    case 'video':
      return block.data.caption || block.data.url;
    case 'divider':
      return '';
    case 'stats':
      return (
        block.data.title ||
        block.data.items
          .map(item => [item.value, item.label].filter(Boolean).join(' '))
          .filter(Boolean)
          .join(' · ')
      );
    case 'steps':
      return (
        block.data.title ||
        block.data.items
          .map(item => item.title)
          .filter(Boolean)
          .join(' → ')
      );
    case 'tabs':
      return (
        block.data.title ||
        block.data.items
          .map(item => item.label)
          .filter(Boolean)
          .join(' · ')
      );
    case 'countdown':
      return block.data.title;
    case 'table': {
      const columns = block.data.columns.length;
      const rows = block.data.rows.length;
      return (
        block.data.title ||
        block.data.columns
          .map(column => column.label)
          .filter(Boolean)
          .join(' · ') ||
        (rows ? `${columns} × ${rows}` : '')
      );
    }
    default:
      return '';
  }
};
