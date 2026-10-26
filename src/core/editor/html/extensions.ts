import { Highlight } from '@tiptap/extension-highlight';
import { Image } from '@tiptap/extension-image';
import { TextAlign } from '@tiptap/extension-text-align';
import { BackgroundColor, Color, TextStyle } from '@tiptap/extension-text-style';
import { Placeholder } from '@tiptap/extensions';
import type { Extensions } from '@tiptap/react';
import { StarterKit } from '@tiptap/starter-kit';

import { CharacterLimit } from './character-limit';
import { DateTimeNode } from './date-time-node';
import { resolveHtmlEditorFeatures } from './features';
import type { HtmlEditorExtensionOptions } from './types';

export const DEFAULT_HEADING_LEVELS = [1, 2, 3] as const;

/**
 * Builds the Tiptap extensions. Disabled features are removed from the schema,
 * so they are unavailable via shortcuts and are stripped from pasted HTML.
 */
export function createHtmlEditorExtensions({
  placeholder,
  maxLength,
  maxLengthMode = 'block',
  headingLevels = [...DEFAULT_HEADING_LEVELS],
  features,
}: HtmlEditorExtensionOptions = {}): Extensions {
  const f = resolveHtmlEditorFeatures(features);
  const lists = f.bulletList || f.orderedList;

  const extensions: Extensions = [
    StarterKit.configure({
      undoRedo: f.history ? {} : false,
      heading: f.heading ? { levels: headingLevels } : false,
      bold: f.bold ? {} : false,
      italic: f.italic ? {} : false,
      underline: f.underline ? {} : false,
      strike: f.strike ? {} : false,
      code: f.code ? {} : false,
      bulletList: f.bulletList ? {} : false,
      orderedList: f.orderedList ? {} : false,
      listItem: lists ? {} : false,
      listKeymap: lists ? {} : false,
      blockquote: f.blockquote ? {} : false,
      codeBlock: f.codeBlock ? {} : false,
      horizontalRule: f.horizontalRule ? {} : false,
      link: f.link
        ? {
            openOnClick: false,
            autolink: true,
            linkOnPaste: true,
            defaultProtocol: 'https',
            HTMLAttributes: { rel: 'noopener noreferrer nofollow', target: '_blank' },
          }
        : false,
    }),
    Placeholder.configure({ placeholder: placeholder ?? '' }),
  ];

  if (f.highlight) extensions.push(Highlight.configure({ multicolor: false }));
  if (f.textAlign) {
    const types = f.heading ? ['heading', 'paragraph'] : ['paragraph'];
    extensions.push(TextAlign.configure({ types }));
  }
  if (f.textColor || f.backgroundColor) extensions.push(TextStyle);
  if (f.textColor) extensions.push(Color);
  if (f.backgroundColor) extensions.push(BackgroundColor);
  if (f.dateTime) extensions.push(DateTimeNode);
  if (f.image) extensions.push(Image.configure({ inline: false, allowBase64: false }));
  if (f.characterCount || maxLength) {
    extensions.push(CharacterLimit.configure({ limit: maxLength ?? null, mode: maxLengthMode }));
  }

  return extensions;
}
