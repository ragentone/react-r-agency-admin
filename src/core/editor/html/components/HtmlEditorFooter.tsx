import { type Editor, useEditorState } from '@tiptap/react';
import { cn } from '@ui/lib/utils';
import { useTranslation } from 'react-i18next';

import { countCharacters } from '../character-limit';

interface HtmlEditorFooterProps {
  editor: Editor;
  maxLength?: number;
}

export function HtmlEditorFooter({ editor, maxLength }: HtmlEditorFooterProps) {
  const { t } = useTranslation('editor');
  const count = useEditorState({
    editor,
    selector: ({ editor: e }) => (e.isDestroyed ? 0 : countCharacters(e.state.doc)),
  });

  return (
    <div
      className={cn(
        'flex justify-end border-t border-input px-3 py-1.5 text-xs text-muted-foreground tabular-nums',
        maxLength && count >= maxLength && 'text-destructive',
        maxLength && count > maxLength && 'font-medium'
      )}
    >
      {maxLength
        ? t('html.characters.limit', { count, max: maxLength })
        : t('html.characters.count', { count })}
    </div>
  );
}
