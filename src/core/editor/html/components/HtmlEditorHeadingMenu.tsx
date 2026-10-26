import type { Editor } from '@tiptap/react';
import { cn } from '@ui/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@ui/shad-cn/components/dropdown-menu';
import { toggleVariants } from '@ui/shad-cn/components/toggle';
import {
  CheckIcon,
  ChevronDownIcon,
  Heading1Icon,
  Heading2Icon,
  Heading3Icon,
  Heading4Icon,
  Heading5Icon,
  Heading6Icon,
  PilcrowIcon,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

import type { HtmlEditorHeadingLevel } from '../types';

interface HtmlEditorHeadingMenuProps {
  editor: Editor;
  levels: HtmlEditorHeadingLevel[];
  current: number;
  disabled?: boolean;
}

const HEADING_ICONS = [
  PilcrowIcon,
  Heading1Icon,
  Heading2Icon,
  Heading3Icon,
  Heading4Icon,
  Heading5Icon,
  Heading6Icon,
];

const headingClass: Record<HtmlEditorHeadingLevel, string> = {
  1: 'text-xl font-semibold',
  2: 'text-lg font-semibold',
  3: 'text-base font-semibold',
  4: 'text-sm font-semibold',
  5: 'text-sm font-medium',
  6: 'text-xs font-medium',
};

export function HtmlEditorHeadingMenu({
  editor,
  levels,
  current,
  disabled,
}: HtmlEditorHeadingMenuProps) {
  const { t } = useTranslation('editor');
  const label = (level: number) =>
    level === 0 ? t('html.toolbar.paragraph') : t('html.toolbar.heading', { level });

  const CurrentIcon = HEADING_ICONS[current] ?? PilcrowIcon;

  const select = (level: number) => {
    const chain = editor.chain().focus();
    if (level === 0) chain.setParagraph().run();
    else chain.setHeading({ level: level as HtmlEditorHeadingLevel }).run();
  };

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild disabled={disabled}>
        <button
          type="button"
          aria-label={t('html.toolbar.textStyle')}
          className={cn(
            toggleVariants({ size: 'sm' }),
            'justify-between gap-0.5 px-1.5 font-normal pointer-coarse:h-10',
            '@md/html-editor:w-32 @md/html-editor:px-2'
          )}
        >
          {/* Narrow: icon only. Wider: full label. */}
          <CurrentIcon className="@md/html-editor:hidden" />
          <span className="hidden truncate @md/html-editor:inline">{label(current)}</span>
          <ChevronDownIcon className="size-3! opacity-60 @md/html-editor:size-4!" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        data-html-editor-ui=""
        align="start"
        collisionPadding={8}
        className="min-w-44"
      >
        {[0, ...levels].map(level => (
          <DropdownMenuItem key={level} onSelect={() => select(level)} className="justify-between">
            <span
              className={level === 0 ? undefined : headingClass[level as HtmlEditorHeadingLevel]}
            >
              {label(level)}
            </span>
            {current === level && <CheckIcon className="size-4" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
