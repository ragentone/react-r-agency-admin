import type { Editor } from '@tiptap/react';
import { Button } from '@ui/shad-cn/components/button';
import { Input } from '@ui/shad-cn/components/input';
import { LinkIcon } from 'lucide-react';
import { type FormEvent, useId, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { ResponsivePopover } from '../../shared';
import { HtmlEditorToolbarButton } from './HtmlEditorToolbarButton';

interface HtmlEditorLinkPopoverProps {
  editor: Editor;
  active: boolean;
  disabled?: boolean;
}

export function HtmlEditorLinkPopover({ editor, active, disabled }: HtmlEditorLinkPopoverProps) {
  const { t } = useTranslation('editor');
  const id = useId();
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState('');

  const onOpenChange = (next: boolean) => {
    if (next) setUrl((editor.getAttributes('link').href as string | undefined) ?? '');
    setOpen(next);
  };

  const apply = (event: FormEvent) => {
    event.preventDefault();
    const href = url.trim();
    const chain = editor.chain().focus().extendMarkRange('link');

    if (!href) {
      chain.unsetLink().run();
    } else if (editor.state.selection.empty && !editor.isActive('link')) {
      chain
        .insertContent({ type: 'text', text: href, marks: [{ type: 'link', attrs: { href } }] })
        .run();
    } else {
      chain.setLink({ href }).run();
    }
    setOpen(false);
  };

  const remove = () => {
    editor.chain().focus().extendMarkRange('link').unsetLink().run();
    setOpen(false);
  };

  return (
    <ResponsivePopover
      open={open}
      onOpenChange={onOpenChange}
      title={t('html.toolbar.link')}
      popoverClassName="w-80 p-3"
      sheetAutoFocus
      trigger={
        <HtmlEditorToolbarButton label={t('html.toolbar.link')} active={active} disabled={disabled}>
          <LinkIcon />
        </HtmlEditorToolbarButton>
      }
    >
      <form onSubmit={apply} className="flex flex-col gap-2">
        <label className="text-xs font-medium text-muted-foreground" htmlFor={id}>
          {t('html.link.url')}
        </label>
        <Input
          id={id}
          autoFocus
          type="url"
          inputMode="url"
          enterKeyHint="done"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          value={url}
          onChange={e => setUrl(e.target.value)}
          placeholder={t('html.link.urlPlaceholder')}
          className="pointer-coarse:h-11"
        />
        <div className="flex justify-end gap-2 pt-1 max-sm:flex-col-reverse max-sm:pt-2">
          {active && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={remove}
              className="pointer-coarse:h-11"
            >
              {t('html.link.remove')}
            </Button>
          )}
          <Button type="submit" size="sm" className="pointer-coarse:h-11">
            {t('html.link.apply')}
          </Button>
        </div>
      </form>
    </ResponsivePopover>
  );
}
