export type EmojiCategoryId =
  'people' | 'nature' | 'foods' | 'activity' | 'places' | 'objects' | 'symbols' | 'flags';

/** 0 = default (yellow), 1–5 = light to dark. */
export type EmojiSkinTone = 0 | 1 | 2 | 3 | 4 | 5;

export interface EmojiItem {
  id: string;
  name: string;
  /** Native characters per skin tone; index 0 is the default. */
  skins: string[];
  version: number;
  /** Lower-case haystack: id, name, keywords, emoticons. */
  search: string;
}

export interface EmojiCategory {
  id: EmojiCategoryId;
  emojis: EmojiItem[];
}

export interface EmojiDataset {
  categories: EmojiCategory[];
  byId: Map<string, EmojiItem>;
  all: EmojiItem[];
}

export interface EmojiSelection {
  id: string;
  native: string;
  name: string;
  skin: EmojiSkinTone;
}

export interface EmojiPickerProps {
  onSelect: (emoji: EmojiSelection) => void;
  /** Emoji glyph size in px. Default: 24 */
  emojiSize?: number;
  /** Emojis per row. Default: 8 */
  columns?: number;
  /** Height of the scrollable emoji area in px. Default: 300 */
  height?: number;
  /** Visible categories and their order. Default: all */
  categories?: EmojiCategoryId[];
  /** Hide emojis newer than this Unicode emoji version (e.g. 13 for older systems). */
  maxVersion?: number;
  showSearch?: boolean;
  showCategories?: boolean;
  showSkinTones?: boolean;
  showRecent?: boolean;
  showPreview?: boolean;
  /** Number of recently used emojis shown. Default: 2 rows */
  maxRecent?: number;
  /** Remember skin tone and recent emojis in localStorage. Default: true */
  persist?: boolean;
  autoFocus?: boolean;
  /** Fill the available width (more columns), e.g. in a bottom sheet. */
  fluid?: boolean;
  className?: string;
}
