import '../html-editor.css';

import { EditorContent, useEditorState } from '@tiptap/react';
import { cn } from '@ui/lib/utils';
import { type CSSProperties, type MouseEvent, useImperativeHandle, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { countCharacters } from '../character-limit';
import { DEFAULT_HEADING_LEVELS } from '../extensions';
import { resolveHtmlEditorFeatures } from '../features';
import { useHtmlEditor } from '../hooks';
import type { HtmlEditorMode, HtmlEditorProps } from '../types';
import { formatHtml, getEditorHtml, setEditorHtml } from '../utils';
import { HtmlEditorFooter } from './HtmlEditorFooter';
import { HtmlEditorToolbar } from './HtmlEditorToolbar';

const toCss = (size?: number | string) => (typeof size === 'number' ? `${size}px` : size);

export function HtmlEditor({
  ref,
  className,
  contentClassName,
  minHeight = 160,
  maxHeight,
  showToolbar = true,
  stickyToolbar = false,
  stickyOffset = 0,
  invalid = false,
  id,
  name,
  placeholder,
  headingLevels = [...DEFAULT_HEADING_LEVELS],
  editable = true,
  features,
  emojiPicker,
  colorPicker,
  dateTimePicker,
  ...options
}: HtmlEditorProps) {
  const { t } = useTranslation('editor');
  const [mode, setMode] = useState<HtmlEditorMode>('visual');
  const [source, setSource] = useState('');

  // Shown via CSS variable: switching the language updates it without touching the editor.
  const placeholderText = placeholder ?? t('html.placeholder');

  const flags = useMemo(() => resolveHtmlEditorFeatures(features), [features]);

  const editor = useHtmlEditor({
    ...options,
    features: flags,
    editable,
    headingLevels,
    placeholder: placeholderText,
  });

  const formValue = useEditorState({
    editor,
    selector: ({ editor: e }) => (name && e ? getEditorHtml(e) : ''),
  });

  // Over the limit (highlight mode, or external content) marks the editor invalid.
  const overLimit = useEditorState({
    editor,
    selector: ({ editor: e }) =>
      !!e &&
      !e.isDestroyed &&
      !!options.maxLength &&
      countCharacters(e.state.doc) > options.maxLength,
  });

  useImperativeHandle(
    ref,
    () => ({
      editor,
      getHTML: () => (editor ? getEditorHtml(editor) : ''),
      setHTML: (html, emitUpdate = false) => {
        if (editor) setEditorHtml(editor, html, emitUpdate);
      },
      focus: () => editor?.commands.focus('end'),
      clear: () => editor?.commands.clearContent(true),
      isEmpty: () => editor?.isEmpty ?? true,
    }),
    [editor]
  );

  const changeMode = (next: HtmlEditorMode) => {
    if (!editor) return;
    if (next === 'source') setSource(formatHtml(getEditorHtml(editor)));
    setMode(next);
    if (next === 'visual') requestAnimationFrame(() => editor.commands.focus());
  };

  const changeSource = (html: string) => {
    setSource(html);
    if (editor) setEditorHtml(editor, html, true);
  };

  const focusOnBlankArea = (event: MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget && mode === 'visual') editor?.commands.focus('end');
  };

  const showChrome = editable && editor;

  return (
    <div
      id={id}
      data-html-editor-ui=""
      data-invalid={invalid || overLimit || undefined}
      data-disabled={!editable || undefined}
      style={
        {
          '--html-editor-sticky-top': toCss(stickyOffset),
          '--html-editor-placeholder': JSON.stringify(placeholderText),
        } as CSSProperties
      }
      className={cn(
        // @container: layout adapts to the editor's own width (drawer, sidebar, mobile).
        // overflow-clip (not hidden) keeps the sticky toolbar working.
        'html-editor @container/html-editor flex w-full min-w-0 flex-col overflow-clip rounded-md border border-input bg-background shadow-xs transition-[color,box-shadow]',
        'focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/50',
        'data-[invalid=true]:border-destructive data-[invalid=true]:ring-destructive/20',
        'data-[disabled=true]:bg-muted/40',
        className
      )}
    >
      {showChrome && showToolbar && (
        <HtmlEditorToolbar
          editor={editor}
          features={flags}
          headingLevels={headingLevels}
          mode={mode}
          onModeChange={changeMode}
          emojiPicker={emojiPicker}
          colorPicker={colorPicker}
          dateTimePicker={dateTimePicker}
          className={cn(stickyToolbar && 'sticky top-(--html-editor-sticky-top) z-20')}
        />
      )}
      <div
        className={cn(
          'flex flex-1 cursor-text flex-col',
          // Own scroll box only with a max height. An `overflow: auto` box that can't scroll
          // swallows the swipe on iOS (esp. inside fixed dialogs) – the page wouldn't scroll
          // while the editor is focused.
          maxHeight !== undefined && maxHeight !== null
            ? 'overflow-y-auto overscroll-y-auto'
            : 'overflow-visible'
        )}
        style={{ minHeight: toCss(minHeight), maxHeight: toCss(maxHeight) }}
        onClick={focusOnBlankArea}
      >
        {mode === 'visual' ? (
          <EditorContent
            editor={editor}
            className={cn('flex min-w-0 flex-1 flex-col', contentClassName)}
          />
        ) : (
          <textarea
            value={source}
            onChange={e => changeSource(e.target.value)}
            spellCheck={false}
            aria-label={t('html.toolbar.source')}
            className="flex-1 resize-none bg-muted/30 px-3 py-2.5 font-mono text-xs leading-relaxed outline-none pointer-coarse:text-base @md/html-editor:px-4 @md/html-editor:py-3"
          />
        )}
      </div>

      {showChrome && flags.characterCount && (
        <HtmlEditorFooter editor={editor} maxLength={options.maxLength} />
      )}

      {name && <input type="hidden" name={name} value={formValue ?? ''} readOnly />}
    </div>
  );
}
