import type { Node as PmNode } from '@tiptap/pm/model';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { Decoration, DecorationSet } from '@tiptap/pm/view';
import { Extension } from '@tiptap/react';

export type HtmlEditorMaxLengthMode = 'block' | 'highlight';

export interface CharacterLimitOptions {
  /** Max characters; `null` = only count. */
  limit: number | null;
  /**
   * - `block`: input beyond the limit is prevented (pastes are trimmed to fit)
   * - `highlight`: input is allowed, the overflowing characters are marked red
   */
  mode: HtmlEditorMaxLengthMode;
  /** CSS class for overflowing text. */
  overflowClass: string;
}

export interface CharacterLimitStorage {
  characters: () => number;
}

/** Transactions with this meta bypass the block mode (external content, source view). */
export const CHARACTER_LIMIT_BYPASS = 'characterLimitBypass';

const pluginKey = new PluginKey<DecorationSet>('characterLimit');

/**
 * Length a leaf node counts as: its visible text for inline atoms that carry one
 * (e.g. `<time>`), otherwise 1 (image, line break, divider).
 */
export function leafLength(node: PmNode): number {
  const text = node.attrs?.text;
  return typeof text === 'string' && text.length > 0 ? text.length : 1;
}

const leafText = (node: PmNode) => {
  const text = node.attrs?.text;
  return typeof text === 'string' && text.length > 0 ? text : ' ';
};

/** Counts text characters; leaf nodes count via `leafLength`. */
export function countCharacters(doc: PmNode): number {
  return doc.textBetween(0, doc.content.size, undefined, leafText).length;
}

function overflowDecorations(doc: PmNode, limit: number, className: string): DecorationSet {
  const decorations: Decoration[] = [];
  let count = 0;

  doc.descendants((node, pos) => {
    if (node.isText) {
      const length = node.text?.length ?? 0;
      if (count + length > limit) {
        const from = pos + Math.max(0, limit - count);
        decorations.push(Decoration.inline(from, pos + length, { class: className }));
      }
      count += length;
      return false;
    }
    if (node.isLeaf) {
      count += leafLength(node);
      if (count > limit && node.type.name !== 'hardBreak') {
        decorations.push(Decoration.node(pos, pos + node.nodeSize, { class: className }));
      }
      return false;
    }
    return true;
  });

  return DecorationSet.create(doc, decorations);
}

export const CharacterLimit = Extension.create<CharacterLimitOptions, CharacterLimitStorage>({
  name: 'characterLimit',

  addOptions() {
    return { limit: null, mode: 'block', overflowClass: 'html-editor-overflow' };
  },

  addStorage() {
    return { characters: () => 0 };
  },

  onBeforeCreate() {
    this.storage.characters = () => countCharacters(this.editor.state.doc);
  },

  addProseMirrorPlugins() {
    const { limit, mode, overflowClass } = this.options;
    if (!limit || limit <= 0) return [];

    return [
      new Plugin<DecorationSet>({
        key: pluginKey,

        // Overflow is marked in both modes: in `block` mode it only happens when
        // content longer than the limit is set from outside.
        state: {
          init: (_, state) => overflowDecorations(state.doc, limit, overflowClass),
          apply: (tr, old) =>
            tr.docChanged ? overflowDecorations(tr.doc, limit, overflowClass) : old,
        },
        props: {
          decorations: state => pluginKey.getState(state),
        },

        filterTransaction: (tr, state) => {
          if (mode !== 'block' || !tr.docChanged || tr.getMeta(CHARACTER_LIMIT_BYPASS)) {
            return true;
          }
          const oldSize = countCharacters(state.doc);
          const newSize = countCharacters(tr.doc);
          // Within the limit, or shrinking (deleting while over the limit).
          if (newSize <= limit || newSize <= oldSize) return true;
          if (!tr.getMeta('paste')) return false;

          // Paste: keep as much as fits, drop the rest right before the cursor.
          const overflow = newSize - Math.max(limit, oldSize);
          const to = tr.selection.$head.pos;
          tr.deleteRange(Math.max(0, to - overflow), to);
          return countCharacters(tr.doc) <= Math.max(limit, oldSize);
        },
      }),
    ];
  },
});
