import type { Editor } from '@tiptap/react';
import { SmileIcon } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { EmojiPicker, type EmojiSelection } from '../../emoji';
import { ResponsivePopover } from '../../shared';
import type { HtmlEditorEmojiOptions } from '../types';
import { HtmlEditorToolbarButton } from './HtmlEditorToolbarButton';

interface HtmlEditorEmojiPopoverProps {
  editor: Editor;
  disabled?: boolean;
  options?: HtmlEditorEmojiOptions;
}

export function HtmlEditorEmojiPopover({ editor, disabled, options }: HtmlEditorEmojiPopoverProps) {
  const { t } = useTranslation('editor');
  const [open, setOpen] = useState(false);
  const { keepOpen = false, autoFocus = true, height, ...pickerProps } = options ?? {};

  const insert = ({ native }: EmojiSelection) => {
    if (keepOpen) {
      // Stay in the picker, insert at the editor selection.
      editor.chain().insertContent(native).run();
    } else {
      editor.chain().focus().insertContent(native).run();
      setOpen(false);
    }
  };

  return (
    <ResponsivePopover
      open={open}
      onOpenChange={setOpen}
      title={t('html.toolbar.emoji')}
      popoverClassName="w-auto overflow-hidden p-0"
      sheetClassName="px-2"
      keepOpenOnFocusOutside={keepOpen}
      trigger={
        <HtmlEditorToolbarButton label={t('html.toolbar.emoji')} active={open} disabled={disabled}>
          <SmileIcon />
        </HtmlEditorToolbarButton>
      }
    >
      {({ sheet }) => (
        <EmojiPicker
          {...pickerProps}
          fluid={sheet}
          // On phones the search would pop up the keyboard over the emojis.
          autoFocus={!sheet && autoFocus}
          height={height ?? (sheet ? 360 : undefined)}
          onSelect={insert}
        />
      )}
    </ResponsivePopover>
  );
}
