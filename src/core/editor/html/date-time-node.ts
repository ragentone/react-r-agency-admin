import { mergeAttributes, Node } from '@tiptap/react';

export interface DateTimeNodeAttributes {
  /** Machine-readable value: `YYYY-MM-DD`, `HH:mm` or `YYYY-MM-DDTHH:mm`. */
  datetime: string | null;
  /** Human-readable text, formatted when inserted. */
  text: string;
}

/**
 * Inline, non-editable `<time datetime="…">…</time>`. Selected as a whole,
 * can be edited again via the date/time picker.
 */
export const DateTimeNode = Node.create({
  name: 'dateTime',
  group: 'inline',
  inline: true,
  atom: true,
  selectable: true,
  draggable: false,

  addAttributes() {
    return {
      datetime: {
        default: null,
        parseHTML: element => element.getAttribute('datetime'),
        renderHTML: attributes => (attributes.datetime ? { datetime: attributes.datetime } : {}),
      },
      text: {
        default: '',
        parseHTML: element => element.textContent ?? '',
        renderHTML: () => ({}),
      },
    };
  },

  parseHTML() {
    return [{ tag: 'time' }];
  },

  renderHTML({ node, HTMLAttributes }) {
    return ['time', mergeAttributes(HTMLAttributes), node.attrs.text];
  },

  renderText({ node }) {
    return node.attrs.text;
  },
});
