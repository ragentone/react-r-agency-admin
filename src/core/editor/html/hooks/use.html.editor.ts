import { useEditor } from '@tiptap/react';
import { useEffect, useRef } from 'react';

import { createHtmlEditorExtensions } from '../extensions';
import { resolveHtmlEditorFeatures } from '../features';
import type { UseHtmlEditorOptions } from '../types';
import { getEditorHtml, setEditorHtml } from '../utils';

export function useHtmlEditor({
  value,
  defaultValue,
  onChange,
  onBlur,
  editable = true,
  autoFocus = false,
  placeholder,
  maxLength,
  maxLengthMode,
  headingLevels,
  features,
  extensions = [],
}: UseHtmlEditorOptions = {}) {
  const onChangeRef = useRef(onChange);
  const onBlurRef = useRef(onBlur);
  const placeholderRef = useRef(placeholder);
  // Latest content – survives a re-creation of the editor (config change).
  const contentRef = useRef<string | null>(null);

  useEffect(() => {
    onChangeRef.current = onChange;
    onBlurRef.current = onBlur;
    placeholderRef.current = placeholder;
  });

  const headingKey = headingLevels?.join(',');
  const featureKey = JSON.stringify(resolveHtmlEditorFeatures(features));

  // Tiptap reads these options only when it (re)creates the editor. The refs carry the latest
  // content and placeholder into that moment without becoming dependencies (= rebuild).
  /* eslint-disable react-hooks/refs -- options are consumed at editor creation, not for rendering */
  const editor = useEditor(
    {
      extensions: [
        ...createHtmlEditorExtensions({
          // Read lazily: a new placeholder (e.g. language switch) must not rebuild the editor.
          placeholder: () => {
            const current = placeholderRef.current;
            return typeof current === 'function' ? current() : (current ?? '');
          },
          maxLength,
          maxLengthMode,
          headingLevels,
          features,
        }),
        ...extensions,
      ],
      content: contentRef.current ?? value ?? defaultValue ?? '',
      editable,
      autofocus: autoFocus ? 'end' : false,
      shouldRerenderOnTransaction: false,
      editorProps: {
        attributes: { class: 'html-editor-content', spellcheck: 'true' },
      },
      onCreate: ({ editor }) => {
        contentRef.current = getEditorHtml(editor);
      },
      // Content set without an update event (controlled value, setHTML) is tracked here.
      onTransaction: ({ editor, transaction }) => {
        if (transaction.docChanged && transaction.getMeta('preventUpdate')) {
          contentRef.current = getEditorHtml(editor);
        }
      },
      onUpdate: ({ editor }) => {
        const html = getEditorHtml(editor);
        contentRef.current = html;
        onChangeRef.current?.(html);
      },
      onBlur: ({ editor }) => onBlurRef.current?.(getEditorHtml(editor)),
    },
    // Recreated only when the schema/extensions change – never for text (placeholder, i18n).
    [maxLength, maxLengthMode, headingKey, featureKey]
  );
  /* eslint-enable react-hooks/refs */

  // Keep a controlled value in sync without resetting the cursor on own updates.
  useEffect(() => {
    if (!editor || editor.isDestroyed || value === undefined) return;
    if (value === getEditorHtml(editor)) return;
    setEditorHtml(editor, value, false);
  }, [editor, value]);

  useEffect(() => {
    if (!editor || editor.isDestroyed) return;
    if (editor.isEditable !== editable) editor.setEditable(editable, false);
  }, [editor, editable]);

  return editor;
}
