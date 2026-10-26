import type { Editor } from '@tiptap/react';
import { Button } from '@ui/shad-cn/components/button';
import { Input } from '@ui/shad-cn/components/input';
import { ImagePlusIcon } from 'lucide-react';
import { type FormEvent, useId, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { ResponsivePopover } from '../../shared';
import { HtmlEditorToolbarButton } from './HtmlEditorToolbarButton';

interface HtmlEditorImagePopoverProps {
  editor: Editor;
  disabled?: boolean;
}

export function HtmlEditorImagePopover({ editor, disabled }: HtmlEditorImagePopoverProps) {
  const { t } = useTranslation('editor');
  const id = useId();
  const [open, setOpen] = useState(false);
  const [src, setSrc] = useState('');
  const [alt, setAlt] = useState('');

  const onOpenChange = (next: boolean) => {
    if (next) {
      setSrc('');
      setAlt('');
    }
    setOpen(next);
  };

  const insert = (event: FormEvent) => {
    event.preventDefault();
    const url = src.trim();
    if (!url) return;
    editor
      .chain()
      .focus()
      .setImage({ src: url, alt: alt.trim() || undefined })
      .run();
    setOpen(false);
  };

  return (
    <ResponsivePopover
      open={open}
      onOpenChange={onOpenChange}
      title={t('html.toolbar.image')}
      popoverClassName="w-80 p-3"
      sheetAutoFocus
      trigger={
        <HtmlEditorToolbarButton label={t('html.toolbar.image')} disabled={disabled}>
          <ImagePlusIcon />
        </HtmlEditorToolbarButton>
      }
    >
      <form onSubmit={insert} className="flex flex-col gap-2">
        <label className="text-xs font-medium text-muted-foreground" htmlFor={`${id}-src`}>
          {t('html.image.url')}
        </label>
        <Input
          id={`${id}-src`}
          autoFocus
          type="url"
          inputMode="url"
          enterKeyHint="next"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          value={src}
          onChange={e => setSrc(e.target.value)}
          placeholder={t('html.image.urlPlaceholder')}
          className="pointer-coarse:h-11"
        />
        <label className="text-xs font-medium text-muted-foreground" htmlFor={`${id}-alt`}>
          {t('html.image.alt')}
        </label>
        <Input
          id={`${id}-alt`}
          enterKeyHint="done"
          value={alt}
          onChange={e => setAlt(e.target.value)}
          placeholder={t('html.image.altPlaceholder')}
          className="pointer-coarse:h-11"
        />
        <div className="flex justify-end pt-1 max-sm:flex-col max-sm:pt-2">
          <Button type="submit" size="sm" disabled={!src.trim()} className="pointer-coarse:h-11">
            {t('html.image.insert')}
          </Button>
        </div>
      </form>
    </ResponsivePopover>
  );
}
