import { css } from '@codemirror/lang-css';
import { javascript } from '@codemirror/lang-javascript';
import { json } from '@codemirror/lang-json';
import { markdown } from '@codemirror/lang-markdown';
import type { Extension } from '@codemirror/state';

/** Highlighting for a language name, as used by `field.code({ language })`. */
export const languageByName = (name: string | undefined): Extension[] => {
  switch (name) {
    case 'javascript':
      return [javascript({ jsx: true, typescript: true })];
    case 'json':
      return [json()];
    case 'css':
      return [css()];
    case 'markdown':
      return [markdown()];
    default:
      return [];
  }
};

/** Highlighting by file extension (plugin file editor). Other text files are shown without highlighting. */
export const languageOfPath = (path: string): Extension[] => {
  const ext = path.slice(path.lastIndexOf('.'));
  if (ext === '.ts' || ext === '.tsx')
    return [javascript({ jsx: ext === '.tsx', typescript: true })];
  if (['.js', '.jsx', '.mjs', '.cjs'].includes(ext)) return [javascript({ jsx: ext === '.jsx' })];
  if (ext === '.json') return [json()];
  if (ext === '.css') return [css()];
  if (ext === '.md') return [markdown()];
  return [];
};
