import type { Editor, Extensions } from '@tiptap/react';
import type { Ref } from 'react';

import type { ColorPickerProps } from '../color';
import type { DateTimeHourCycle, DateTimeMode, WeekDay } from '../datetime';
import type { EmojiPickerProps } from '../emoji';
import type { HtmlEditorMaxLengthMode } from './character-limit';
import type { HTML_EDITOR_FEATURE_KEYS } from './features';

export type HtmlEditorHeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

export type HtmlEditorMode = 'visual' | 'source';

export type HtmlEditorFeature = (typeof HTML_EDITOR_FEATURE_KEYS)[number];

export type HtmlEditorFeatureFlags = Record<HtmlEditorFeature, boolean>;

export type HtmlEditorPreset = 'none' | 'minimal' | 'basic' | 'full';

/** Single feature toggles, applied on top of `preset` (default: `'none'` = everything off). */
export type HtmlEditorFeatures = Partial<HtmlEditorFeatureFlags> & { preset?: HtmlEditorPreset };

/** Options for the emoji picker in the toolbar (`features.emoji`). */
export type HtmlEditorEmojiOptions = Omit<EmojiPickerProps, 'onSelect' | 'className'> & {
  /** Keep the picker open after selecting an emoji. Default: false */
  keepOpen?: boolean;
};

/** Options for the color picker (`features.textColor` / `features.backgroundColor`). */
export type HtmlEditorColorOptions = Omit<
  ColorPickerProps,
  'value' | 'onChange' | 'onChangeComplete' | 'className'
>;

/** Options for the date/time picker (`features.dateTime`). */
export interface HtmlEditorDateTimeOptions {
  /** Selectable kinds. Default: all three */
  modes?: DateTimeMode[];
  /** Initially selected kind. Default: 'datetime' (or the first of `modes`) */
  defaultMode?: DateTimeMode;
  /** Text format of the inserted date. Default: 'long' (7. Oktober 2026) */
  dateStyle?: 'full' | 'long' | 'medium' | 'short';
  /** Text format of the inserted time. Default: 'short' (14:30) */
  timeStyle?: 'medium' | 'short';
  minuteStep?: number;
  min?: Date;
  max?: Date;
  weekStartsOn?: WeekDay;
  hourCycle?: DateTimeHourCycle;
}

export interface HtmlEditorExtensionOptions {
  placeholder?: string | (() => string);
  maxLength?: number;
  /**
   * What happens at `maxLength`:
   * - `'block'` (default): further input is prevented, pastes are trimmed
   * - `'highlight'`: input is allowed, characters beyond the limit are outlined in red
   */
  maxLengthMode?: HtmlEditorMaxLengthMode;
  headingLevels?: HtmlEditorHeadingLevel[];
  features?: HtmlEditorFeatures | HtmlEditorPreset;
}

export interface UseHtmlEditorOptions extends HtmlEditorExtensionOptions {
  /** Controlled HTML value. An empty editor is reported as `''`. */
  value?: string;
  /** Initial HTML for uncontrolled usage. */
  defaultValue?: string;
  onChange?: (html: string) => void;
  onBlur?: (html: string) => void;
  editable?: boolean;
  autoFocus?: boolean;
  /** Additional Tiptap extensions appended to the defaults. */
  extensions?: Extensions;
}

export interface HtmlEditorHandle {
  editor: Editor | null;
  getHTML: () => string;
  setHTML: (html: string, emitUpdate?: boolean) => void;
  focus: () => void;
  clear: () => void;
  isEmpty: () => boolean;
}

export interface HtmlEditorProps extends UseHtmlEditorOptions {
  ref?: Ref<HtmlEditorHandle>;
  className?: string;
  contentClassName?: string;
  minHeight?: number | string;
  maxHeight?: number | string;
  showToolbar?: boolean;
  /** Keep the toolbar visible while the page scrolls past a long editor. */
  stickyToolbar?: boolean;
  /** Top offset for the sticky toolbar, e.g. the height of a fixed app header. */
  stickyOffset?: number | string;
  emojiPicker?: HtmlEditorEmojiOptions;
  colorPicker?: HtmlEditorColorOptions;
  dateTimePicker?: HtmlEditorDateTimeOptions;
  /** Marks the editor as invalid (e.g. for form validation). */
  invalid?: boolean;
  id?: string;
  name?: string;
}
