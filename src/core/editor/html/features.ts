import type { HtmlEditorFeatureFlags, HtmlEditorFeatures, HtmlEditorPreset } from './types';

export const HTML_EDITOR_FEATURE_KEYS = [
  'history',
  'heading',
  'bold',
  'italic',
  'underline',
  'strike',
  'code',
  'highlight',
  'textColor',
  'backgroundColor',
  'bulletList',
  'orderedList',
  'blockquote',
  'codeBlock',
  'textAlign',
  'link',
  'image',
  'horizontalRule',
  'emoji',
  'dateTime',
  'clearFormatting',
  'source',
  'characterCount',
  'clear',
] as const;

const all = (value: boolean) =>
  Object.fromEntries(HTML_EDITOR_FEATURE_KEYS.map(key => [key, value])) as HtmlEditorFeatureFlags;

export const HTML_EDITOR_PRESETS: Record<HtmlEditorPreset, HtmlEditorFeatureFlags> = {
  none: all(false),
  full: { ...all(true), characterCount: false },
  basic: {
    ...all(false),
    history: true,
    heading: true,
    bold: true,
    italic: true,
    underline: true,
    strike: true,
    bulletList: true,
    orderedList: true,
    blockquote: true,
    link: true,
    emoji: true,
    clearFormatting: true,
  },
  minimal: {
    ...all(false),
    history: true,
    bold: true,
    italic: true,
    underline: true,
    link: true,
  },
};

/**
 * Resolves the `features` prop into a complete set of flags.
 * Everything is disabled unless switched on:
 * - a preset name (`'none' | 'minimal' | 'basic' | 'full'`) uses that preset
 * - an object enables/disables single flags on top of `preset` (default `'none'`)
 */
export function resolveHtmlEditorFeatures(
  features?: HtmlEditorFeatures | HtmlEditorPreset
): HtmlEditorFeatureFlags {
  if (!features) return HTML_EDITOR_PRESETS.none;
  if (typeof features === 'string') return HTML_EDITOR_PRESETS[features];
  const { preset = 'none', ...flags } = features;
  const base = HTML_EDITOR_PRESETS[preset];
  const overrides = Object.fromEntries(
    Object.entries(flags).filter(([, value]) => value !== undefined)
  ) as Partial<HtmlEditorFeatureFlags>;
  return { ...base, ...overrides };
}
