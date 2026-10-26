import { lazyComponent } from '@core/utils/lazy.component.ts';
import { createElement } from 'react';

import type { HtmlEditorProps } from './types.ts';
import { Spinner } from '@ui/shad-cn/components/spinner.tsx';

/**
 * `HtmlEditor` loaded on demand: tiptap/ProseMirror (~400 KB) stay out of the start bundle.
 * Same props as `HtmlEditor` (incl. `ref` → `HtmlEditorHandle`). Import this one in forms,
 * not the `@core/editor/html` barrel (that one pulls the editor in statically).
 */
export const LazyHtmlEditor = lazyComponent<HtmlEditorProps>(
  () => import('./components/HtmlEditor.tsx').then(m => m.HtmlEditor),
  {
    name: 'LazyHtmlEditor',
    fallback: createElement('div', {
      'aria-busy': true,
      className: 'h-32 w-full animate-pulse rounded-md border border-border/50 bg-muted/30',
      children: (
        <div className={'w-full h-full flex justify-center items-center gap-2'}>
          <Spinner className={'size-4'} /> <label>loading...</label>
        </div>
      ),
    }),
    delay: 500,
  }
);
