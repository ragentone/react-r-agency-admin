import type { Editor } from '@tiptap/react';
import { cn } from '@ui/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@ui/shad-cn/components/dropdown-menu';
import { toggleVariants } from '@ui/shad-cn/components/toggle';
import { ChevronDownIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { formatShortcut } from '../utils';
import {
  alignLabelKey,
  HTML_EDITOR_ALIGN_ICONS,
  HTML_EDITOR_ALIGN_SHORTCUTS,
  HTML_EDITOR_ALIGNMENTS,
  type HtmlEditorAlignment,
} from './html-editor-align.const.ts';

interface HtmlEditorAlignMenuProps {
  editor: Editor;
  current: HtmlEditorAlignment;
  disabled?: boolean;
  className?: string;
}

/** Compact alignment picker used when the editor is narrow. */
export function HtmlEditorAlignMenu({
  editor,
  current,
  disabled,
  className,
}: HtmlEditorAlignMenuProps) {
  const { t } = useTranslation('editor');
  const Icon = HTML_EDITOR_ALIGN_ICONS[current];

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild disabled={disabled}>
        <button
          type="button"
          aria-label={t(alignLabelKey(current))}
          className={cn(
            toggleVariants({ size: 'sm' }),
            'gap-0.5 px-1.5 pointer-coarse:h-10',
            className
          )}
        >
          <Icon />
          <ChevronDownIcon className="size-3! opacity-60" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent data-html-editor-ui="" align="start" collisionPadding={8}>
        {HTML_EDITOR_ALIGNMENTS.map(align => {
          const ItemIcon = HTML_EDITOR_ALIGN_ICONS[align];
          return (
            <DropdownMenuItem
              key={align}
              onSelect={() => editor.chain().focus().setTextAlign(align).run()}
              className={cn(current === align && 'bg-accent/60')}
            >
              <ItemIcon />
              {t(alignLabelKey(align))}
              <DropdownMenuShortcut>
                {formatShortcut(HTML_EDITOR_ALIGN_SHORTCUTS[align])}
              </DropdownMenuShortcut>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
