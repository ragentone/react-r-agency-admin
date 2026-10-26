import type { Editor } from '@tiptap/react';

import { CHARACTER_LIMIT_BYPASS } from './character-limit';

/**
 * Returns the editor HTML, or `''` when the document is empty.
 * Also `''` for a destroyed editor: Tiptap re-creates the editor on config changes (and once
 * in StrictMode) – `useEditorState` selectors can still run on the old instance, whose schema
 * is gone (`getHTML()` would throw "Cannot read properties of null (reading 'cached')").
 */
export function getEditorHtml(editor: Editor | null | undefined): string {
  if (!editor || editor.isDestroyed) return '';
  try {
    return editor.isEmpty ? '' : editor.getHTML();
  } catch {
    return '';
  }
}

/** Sets content from outside (value, source view, ref) – never blocked by `maxLength`. */
export function setEditorHtml(editor: Editor, html: string, emitUpdate: boolean) {
  editor
    .chain()
    .setMeta(CHARACTER_LIMIT_BYPASS, true)
    .setContent(html || '', { emitUpdate })
    .run();
}

const BLOCK_END = /(<\/(?:p|h[1-6]|ul|ol|li|blockquote|pre)>|<hr\s*\/?>|<img[^>]*>)(?!\n)/g;

/** Light formatting for the source view: one block per line. */
export function formatHtml(html: string): string {
  return html.replace(BLOCK_END, '$1\n').trim();
}

const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform);

/** Turns `Mod-Shift-B` into `⌘⇧B` (macOS) or `Ctrl+Shift+B`. */
export function formatShortcut(shortcut: string): string {
  const parts = shortcut.split('-');
  if (isMac) {
    const map: Record<string, string> = { Mod: '⌘', Shift: '⇧', Alt: '⌥' };
    return parts.map(p => map[p] ?? p.toUpperCase()).join('');
  }
  const map: Record<string, string> = { Mod: 'Ctrl' };
  return parts.map(p => map[p] ?? p.toUpperCase()).join('+');
}
