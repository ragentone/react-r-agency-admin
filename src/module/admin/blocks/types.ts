import { PageBlockManager } from '@core/blocks/manager.ts';
import type { IPageBlockDefinition, PageBlockData } from '@core/blocks/types.ts';
import { nanoid } from 'nanoid';

/**
 * Building blocks of a dynamic page – same schema as the backend
 * (runtime apps/site-page/types/blocks.ts), which validates + cleans every field.
 * Text fields are plain text (rendered as text), only `text.html` is editor HTML.
 */
/** Banner – background image (or plain dark / light area), heading, text, button. */
export interface IHeroBlockData {
  title: string;
  text: string;
  /** Shown image (`upload/site-page/…` or external url) – the edited result if edited. */
  imageUrl: string;
  /** Non-destructive editing: the untouched upload ('' = not edited). */
  imageOriginal: string;
  /** Image editor state (`ImageEditorState`) to edit the original again – null = not edited. */
  imageEdit: Record<string, unknown> | null;
  buttonLabel: string;
  buttonUrl: string;
  /** Colours without image (with image the text is always light). */
  tone: 'dark' | 'light';
  align: 'left' | 'center';
  valign: 'bottom' | 'center' | 'top';
  size: 'md' | 'sm' | 'lg';
  /** Rounded card with spacing to the page edges instead of edge to edge. */
  rounded: boolean;
  /** Darkening over the image in percent (0–80) – readable text on bright photos. */
  overlay: number;
  /** Focus point of the image in percent (0–100). */
  focusX: number;
  focusY: number;
}

export interface ITextBlockData {
  html: string;
}

/** Shared by the blocks with an editable, croppable image (image, split). */
export interface IEditableImageData {
  /** Shown image – the edited result if edited. */
  imageUrl: string;
  /** Non-destructive editing: the untouched upload ('' = not edited). */
  imageOriginal: string;
  /** Image editor state to edit the original again – null = not edited. */
  imageEdit: Record<string, unknown> | null;
  /** Focus point of the image in percent (0–100) – centre of every crop. */
  focusX: number;
  focusY: number;
}

/** `auto` = whole image, otherwise cropped around the focus point. */
export type ImageRatio = 'auto' | '16/9' | '4/3' | '1/1' | '3/4';
export const IMAGE_RATIOS: ImageRatio[] = ['auto', '16/9', '4/3', '1/1', '3/4'];

export interface IImageBlockData extends IEditableImageData {
  /** Describes the image for screen readers ('' = decorative). */
  alt: string;
  caption: string;
  ratio: ImageRatio;
  /** Edge to edge on phones. */
  wide: boolean;
}

export type SplitRatio = Exclude<ImageRatio, 'auto'>;
export const SPLIT_RATIOS: SplitRatio[] = ['4/3', '1/1', '3/4', '16/9'];

export interface ISplitBlockData extends IEditableImageData {
  alt: string;
  /** From tablet width – phones always show the image first. */
  imageSide: 'left' | 'right';
  ratio: SplitRatio;
  title: string;
  text: string;
  buttonLabel: string;
  buttonUrl: string;
}

export interface ICardItem {
  imageUrl: string;
  alt: string;
  title: string;
  text: string;
  /** Text of the link line – the whole card is the link when `linkUrl` is set. */
  linkLabel: string;
  linkUrl: string;
}

export interface ICardsBlockData {
  title: string;
  /** From tablet width – phones always show one card per row. */
  columns: '2' | '3' | '1';
  items: ICardItem[];
}

export interface INoticeBlockData {
  tone: 'info' | 'success' | 'warning' | 'danger';
  title: string;
  text: string;
}

export interface ICtaBlockData {
  title: string;
  text: string;
  primaryLabel: string;
  primaryUrl: string;
  secondaryLabel: string;
  secondaryUrl: string;
  variant: 'brand' | 'muted';
}

export interface IFaqItem {
  question: string;
  answer: string;
}

export interface IFaqBlockData {
  title: string;
  items: IFaqItem[];
}

export interface IQuoteBlockData {
  text: string;
  author: string;
  role: string;
}

export interface IVideoBlockData {
  url: string;
  caption: string;
}

export interface IStatItem {
  value: string;
  label: string;
}

export interface IStatsBlockData {
  title: string;
  items: IStatItem[];
}

export interface IStepItem {
  title: string;
  text: string;
}

export interface IStepsBlockData {
  title: string;
  items: IStepItem[];
}

export interface ITabItem {
  label: string;
  html: string;
}

export interface ITabsBlockData {
  title: string;
  items: ITabItem[];
}

export interface ICountdownBlockData {
  title: string;
  /** ISO date with time zone (`toISOString()`). */
  target: string;
  /** Shown once the date has passed. */
  doneText: string;
  buttonLabel: string;
  buttonUrl: string;
}

export interface ITableColumn {
  label: string;
  align: 'left' | 'center' | 'right';
}

/** Cells of a row: `c1` … `c6` (only the first `columns.length` are shown). */
export type ITableRow = Record<`c${1 | 2 | 3 | 4 | 5 | 6}`, string>;

export interface ITableBlockData {
  title: string;
  caption: string;
  variant: 'striped' | 'lines' | 'grid';
  /** Phones: swipe sideways or one card per row. */
  mobile: 'scroll' | 'stack';
  /** First column as row heading. */
  firstColumn: boolean;
  columns: ITableColumn[];
  rows: ITableRow[];
}

export interface IDividerBlockData {
  variant: 'line' | 'space';
  size: 'md' | 'sm' | 'lg';
}

export interface ISitePageBlockDataMap {
  hero: IHeroBlockData;
  text: ITextBlockData;
  image: IImageBlockData;
  split: ISplitBlockData;
  cards: ICardsBlockData;
  notice: INoticeBlockData;
  cta: ICtaBlockData;
  faq: IFaqBlockData;
  quote: IQuoteBlockData;
  video: IVideoBlockData;
  divider: IDividerBlockData;
  stats: IStatsBlockData;
  steps: IStepsBlockData;
  tabs: ITabsBlockData;
  countdown: ICountdownBlockData;
  table: ITableBlockData;
}

export type SitePageBlockType = keyof ISitePageBlockDataMap;

export type SitePageBlockOf<T extends SitePageBlockType> = {
  id: string;
  type: T;
  data: ISitePageBlockDataMap[T];
};

export type SitePageBlock = { [T in SitePageBlockType]: SitePageBlockOf<T> }[SitePageBlockType];

/** Block registered by an app (`Core.blocks`), type `<app>:<name>`. */
export interface IAppBlock {
  id: string;
  type: `${string}:${string}`;
  data: PageBlockData;
}

/** Any block of a page: built-in or from an app. */
export type PageBlock = SitePageBlock | IAppBlock;

export const isAppBlock = (block: PageBlock): block is IAppBlock => block.type.includes(':');

/** Order of the block picker. */
export const SITE_PAGE_BLOCK_TYPES: SitePageBlockType[] = [
  'hero',
  'text',
  'image',
  'split',
  'cards',
  'stats',
  'steps',
  'cta',
  'notice',
  'faq',
  'tabs',
  'table',
  'quote',
  'video',
  'countdown',
  'divider',
];

/** Same limits as the backend. */
export const SITE_PAGE_BLOCKS_MAX = 60;
export const SITE_PAGE_FAQ_MAX = 40;
export const SITE_PAGE_CARDS_MAX = 12;
export const SITE_PAGE_STATS_MAX = 6;
export const SITE_PAGE_STEPS_MAX = 10;
export const SITE_PAGE_TABS_MAX = 8;
export const SITE_PAGE_TABLE_COLUMNS_MAX = 6;
export const SITE_PAGE_TABLE_ROWS_MAX = 50;

export const TABLE_CELL_KEYS = ['c1', 'c2', 'c3', 'c4', 'c5', 'c6'] as const;
export type TableCellKey = (typeof TABLE_CELL_KEYS)[number];

export const emptyStat = (): IStatItem => ({ value: '', label: '' });
export const emptyStep = (): IStepItem => ({ title: '', text: '' });
export const emptyTab = (): ITabItem => ({ label: '', html: '' });
export const emptyTableRow = (): ITableRow => ({ c1: '', c2: '', c3: '', c4: '', c5: '', c6: '' });
export const emptyTableColumn = (): ITableColumn => ({ label: '', align: 'left' });

/** Countdown default: in 7 days, 18:00 local time. */
const inOneWeek = () => {
  const date = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  date.setHours(18, 0, 0, 0);
  return date.toISOString();
};

export const emptyFaqItem = (): IFaqItem => ({ question: '', answer: '' });
export const emptyCard = (): ICardItem => ({
  imageUrl: '',
  alt: '',
  title: '',
  text: '',
  linkLabel: '',
  linkUrl: '',
});

const emptyImage = (): IEditableImageData => ({
  imageUrl: '',
  imageOriginal: '',
  imageEdit: null,
  focusX: 50,
  focusY: 50,
});

const DEFAULTS: { [T in SitePageBlockType]: () => ISitePageBlockDataMap[T] } = {
  hero: () => ({
    title: '',
    text: '',
    imageUrl: '',
    imageOriginal: '',
    imageEdit: null,
    buttonLabel: '',
    buttonUrl: '',
    tone: 'dark',
    align: 'left',
    valign: 'bottom',
    size: 'md',
    rounded: true,
    overlay: 35,
    focusX: 50,
    focusY: 50,
  }),
  text: () => ({ html: '' }),
  image: () => ({ ...emptyImage(), alt: '', caption: '', ratio: 'auto', wide: false }),
  split: () => ({
    ...emptyImage(),
    alt: '',
    imageSide: 'left',
    ratio: '4/3',
    title: '',
    text: '',
    buttonLabel: '',
    buttonUrl: '',
  }),
  cards: () => ({ title: '', columns: '2', items: [emptyCard(), emptyCard()] }),
  notice: () => ({ tone: 'info', title: '', text: '' }),
  cta: () => ({
    title: '',
    text: '',
    primaryLabel: '',
    primaryUrl: '',
    secondaryLabel: '',
    secondaryUrl: '',
    variant: 'brand',
  }),
  faq: () => ({ title: '', items: [emptyFaqItem()] }),
  quote: () => ({ text: '', author: '', role: '' }),
  video: () => ({ url: '', caption: '' }),
  divider: () => ({ variant: 'line', size: 'md' }),
  stats: () => ({ title: '', items: [emptyStat(), emptyStat(), emptyStat()] }),
  steps: () => ({ title: '', items: [emptyStep(), emptyStep(), emptyStep()] }),
  tabs: () => ({ title: '', items: [emptyTab(), emptyTab()] }),
  countdown: () => ({
    title: '',
    target: inOneWeek(),
    doneText: '',
    buttonLabel: '',
    buttonUrl: '',
  }),
  table: () => ({
    title: '',
    caption: '',
    variant: 'striped',
    mobile: 'scroll',
    firstColumn: false,
    columns: [emptyTableColumn(), emptyTableColumn(), emptyTableColumn()],
    rows: [emptyTableRow(), emptyTableRow(), emptyTableRow()],
  }),
};

export const newBlockId = () => nanoid(12);

export const createBlock = <T extends SitePageBlockType>(type: T): SitePageBlockOf<T> => ({
  id: newBlockId(),
  type,
  data: DEFAULTS[type](),
});

export const createAppBlock = (definition: IPageBlockDefinition): IAppBlock => ({
  id: newBlockId(),
  type: definition.type as IAppBlock['type'],
  data: definition.defaults(),
});

/** Fills missing fields (older / partial data) with the defaults of the type. */
export const normalizeBlock = (block: PageBlock): PageBlock => {
  if (isAppBlock(block)) {
    const defaults = PageBlockManager.get(block.type)?.defaults() ?? {};
    return { ...block, data: { ...defaults, ...block.data } };
  }
  if (!(block.type in DEFAULTS)) return block;
  const data = { ...DEFAULTS[block.type](), ...(block.data as object) } as SitePageBlock['data'];
  // Cards: older items may lack newer fields (e.g. `alt`).
  if (block.type === 'cards') {
    const cards = data as ICardsBlockData;
    cards.items = (Array.isArray(cards.items) ? cards.items : []).map(item => ({
      ...emptyCard(),
      ...item,
    }));
  }
  return { ...block, data } as SitePageBlock;
};

/** Deep copy with a new id. */
export const duplicateBlock = (block: PageBlock): PageBlock => ({
  ...structuredClone(block),
  id: newBlockId(),
});

/** Pages from before the blocks: the HTML content becomes one text block. */
export const blocksFromPage = (page: { blocks?: PageBlock[]; content?: string }): PageBlock[] => {
  if (page.blocks?.length) return page.blocks.map(normalizeBlock);
  if (page.content) return [{ ...createBlock('text'), data: { html: page.content } }];
  return [];
};

/** Internal path, external link, mailto / tel, anchor. */
export const isSafeUrl = (url: string) => /^(https?:\/\/|mailto:|tel:|\/(?!\/)|#)/i.test(url);
export const isInternalUrl = (url: string) => /^\/(?!\/)/.test(url) || url.startsWith('#');

/** YouTube / Vimeo link → privacy friendly embed url (or null). */
export const videoEmbed = (url: string): { src: string; provider: 'youtube' | 'vimeo' } | null => {
  const value = url.trim();
  const youtube =
    /(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/i.exec(
      value
    );
  if (youtube) {
    return {
      src: `https://www.youtube-nocookie.com/embed/${youtube[1]}?autoplay=1&rel=0`,
      provider: 'youtube',
    };
  }
  const vimeo = /vimeo\.com\/(?:video\/)?(\d{6,12})/i.exec(value);
  if (vimeo) {
    return {
      src: `https://player.vimeo.com/video/${vimeo[1]}?autoplay=1&dnt=1`,
      provider: 'vimeo',
    };
  }
  return null;
};
