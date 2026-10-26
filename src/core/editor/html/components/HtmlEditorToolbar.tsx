import { type Editor, useEditorState } from '@tiptap/react';
import { cn } from '@ui/lib/utils';
import { Separator } from '@ui/shad-cn/components/separator';
import {
  BoldIcon,
  CodeIcon,
  CodeXmlIcon,
  HighlighterIcon,
  ItalicIcon,
  ListIcon,
  ListOrderedIcon,
  type LucideIcon,
  MinusIcon,
  QuoteIcon,
  Redo2Icon,
  RemoveFormattingIcon,
  SquareCodeIcon,
  StrikethroughIcon,
  Trash,
  UnderlineIcon,
  Undo2Icon,
} from 'lucide-react';
import { Fragment, type ReactNode, useRef } from 'react';
import { useTranslation } from 'react-i18next';

import { normalizeColor } from '../../color';
import { scrollFadeMask, useScrollFade } from '../hooks/use.scroll.fade';
import type {
  HtmlEditorColorOptions,
  HtmlEditorDateTimeOptions,
  HtmlEditorEmojiOptions,
  HtmlEditorFeatureFlags,
  HtmlEditorHeadingLevel,
  HtmlEditorMode,
} from '../types';
import {
  alignLabelKey,
  HTML_EDITOR_ALIGN_ICONS,
  HTML_EDITOR_ALIGN_SHORTCUTS,
  HTML_EDITOR_ALIGNMENTS,
} from './html-editor-align.const.ts';
import { HtmlEditorAlignMenu } from './HtmlEditorAlignMenu';
import { HtmlEditorColorPopover } from './HtmlEditorColorPopover';
import { HtmlEditorDateTimePopover } from './HtmlEditorDateTimePopover';
import { HtmlEditorEmojiPopover } from './HtmlEditorEmojiPopover';
import { HtmlEditorHeadingMenu } from './HtmlEditorHeadingMenu';
import { HtmlEditorImagePopover } from './HtmlEditorImagePopover';
import { HtmlEditorLinkPopover } from './HtmlEditorLinkPopover';
import { HtmlEditorToolbarButton } from './HtmlEditorToolbarButton';

interface ToolbarAction {
  key: string;
  icon: LucideIcon;
  enabled: boolean;
  shortcut?: string;
  active?: boolean;
  disabled?: boolean;
  run: () => void;
  confirm?: boolean;
}

export interface HtmlEditorToolbarProps {
  editor: Editor;
  features: HtmlEditorFeatureFlags;
  headingLevels: HtmlEditorHeadingLevel[];
  mode?: HtmlEditorMode;
  onModeChange?: (mode: HtmlEditorMode) => void;
  emojiPicker?: HtmlEditorEmojiOptions;
  colorPicker?: HtmlEditorColorOptions;
  dateTimePicker?: HtmlEditorDateTimeOptions;
  className?: string;
  inert?: boolean;
}

/** Toolbar state while the editor is being replaced (nothing active, nothing to undo). */
const INACTIVE_TOOLBAR_STATE = {
  bold: false,
  italic: false,
  underline: false,
  strike: false,
  code: false,
  highlight: false,
  link: false,
  dateTime: false,
  textColor: null,
  backgroundColor: null,
  bulletList: false,
  orderedList: false,
  blockquote: false,
  codeBlock: false,
  heading: 0,
  align: 'left',
  canUndo: false,
  canRedo: false,
} as const;

export function HtmlEditorToolbar({
  editor,
  features: f,
  headingLevels,
  mode = 'visual',
  onModeChange,
  emojiPicker,
  colorPicker,
  dateTimePicker,
  className,
  inert,
}: HtmlEditorToolbarProps) {
  const { t } = useTranslation('editor');
  const source = mode === 'source';
  const scrollRef = useRef<HTMLDivElement>(null);
  const fade = useScrollFade(scrollRef);
  const mask = scrollFadeMask(fade);

  const s = useEditorState({
    editor,
    // A replaced (destroyed) editor has no view / schema anymore – see getEditorHtml().
    selector: ({ editor: e }) =>
      e.isDestroyed
        ? INACTIVE_TOOLBAR_STATE
        : {
            bold: e.isActive('bold'),
            italic: e.isActive('italic'),
            underline: e.isActive('underline'),
            strike: e.isActive('strike'),
            code: e.isActive('code'),
            highlight: e.isActive('highlight'),
            link: e.isActive('link'),
            dateTime: e.isActive('dateTime'),
            textColor: f.textColor ? normalizeColor(e.getAttributes('textStyle').color) : null,
            backgroundColor: f.backgroundColor
              ? normalizeColor(e.getAttributes('textStyle').backgroundColor)
              : null,
            bulletList: e.isActive('bulletList'),
            orderedList: e.isActive('orderedList'),
            blockquote: e.isActive('blockquote'),
            codeBlock: e.isActive('codeBlock'),
            heading: headingLevels.find(level => e.isActive('heading', { level })) ?? 0,
            align: HTML_EDITOR_ALIGNMENTS.find(align => e.isActive({ textAlign: align })) ?? 'left',
            // Commands only exist when their extension is loaded.
            canUndo: f.history && e.can().undo(),
            canRedo: f.history && e.can().redo(),
          },
  });

  const chain = () => editor.chain().focus();
  // Marks can't be applied inside code blocks.
  const markDisabled = source || s.codeBlock;

  const actionGroups: ToolbarAction[][] = [
    [
      {
        key: 'undo',
        icon: Undo2Icon,
        enabled: f.history,
        shortcut: 'Mod-Z',
        disabled: source || !s.canUndo,
        run: () => chain().undo().run(),
      },
      {
        key: 'redo',
        icon: Redo2Icon,
        enabled: f.history,
        shortcut: 'Mod-Shift-Z',
        disabled: source || !s.canRedo,
        run: () => chain().redo().run(),
      },
    ],
    [
      {
        key: 'bold',
        icon: BoldIcon,
        enabled: f.bold,
        shortcut: 'Mod-B',
        active: s.bold,
        disabled: markDisabled,
        run: () => chain().toggleBold().run(),
      },
      {
        key: 'italic',
        icon: ItalicIcon,
        enabled: f.italic,
        shortcut: 'Mod-I',
        active: s.italic,
        disabled: markDisabled,
        run: () => chain().toggleItalic().run(),
      },
      {
        key: 'underline',
        icon: UnderlineIcon,
        enabled: f.underline,
        shortcut: 'Mod-U',
        active: s.underline,
        disabled: markDisabled,
        run: () => chain().toggleUnderline().run(),
      },
      {
        key: 'strike',
        icon: StrikethroughIcon,
        enabled: f.strike,
        shortcut: 'Mod-Shift-S',
        active: s.strike,
        disabled: markDisabled,
        run: () => chain().toggleStrike().run(),
      },
      {
        key: 'code',
        icon: CodeIcon,
        enabled: f.code,
        shortcut: 'Mod-E',
        active: s.code,
        disabled: markDisabled,
        run: () => chain().toggleCode().run(),
      },
      {
        key: 'highlight',
        icon: HighlighterIcon,
        enabled: f.highlight,
        shortcut: 'Mod-Shift-H',
        active: s.highlight,
        disabled: markDisabled,
        run: () => chain().toggleHighlight().run(),
      },
    ],
    [
      {
        key: 'bulletList',
        icon: ListIcon,
        enabled: f.bulletList,
        shortcut: 'Mod-Shift-8',
        active: s.bulletList,
        disabled: source,
        run: () => chain().toggleBulletList().run(),
      },
      {
        key: 'orderedList',
        icon: ListOrderedIcon,
        enabled: f.orderedList,
        shortcut: 'Mod-Shift-7',
        active: s.orderedList,
        disabled: source,
        run: () => chain().toggleOrderedList().run(),
      },
      {
        key: 'blockquote',
        icon: QuoteIcon,
        enabled: f.blockquote,
        shortcut: 'Mod-Shift-B',
        active: s.blockquote,
        disabled: source,
        run: () => chain().toggleBlockquote().run(),
      },
      {
        key: 'codeBlock',
        icon: SquareCodeIcon,
        enabled: f.codeBlock,
        shortcut: 'Mod-Alt-C',
        active: s.codeBlock,
        disabled: source,
        run: () => chain().toggleCodeBlock().run(),
      },
      {
        key: 'clear',
        icon: Trash,
        enabled: f.clear,
        run: () => editor.commands.clearContent(true),
        confirm: true,
        shortcut: 'Mod-C',
      },
    ],
  ];

  const alignActions: ToolbarAction[] = HTML_EDITOR_ALIGNMENTS.map(align => ({
    key: align,
    icon: HTML_EDITOR_ALIGN_ICONS[align],
    enabled: f.textAlign,
    shortcut: HTML_EDITOR_ALIGN_SHORTCUTS[align],
    active: s.align === align,
    disabled: source,
    run: () => chain().setTextAlign(align).run(),
  }));

  const renderAction = ({ key, confirm = false, icon: Icon, ...action }: ToolbarAction) => {
    return (
      <HtmlEditorToolbarButton
        key={key}
        label={t(
          HTML_EDITOR_ALIGNMENTS.includes(key as never)
            ? alignLabelKey(key as (typeof HTML_EDITOR_ALIGNMENTS)[number])
            : `html.toolbar.${key}`
        )}
        shortcut={action.shortcut}
        active={action.active}
        disabled={action.disabled}
        onClick={action.run}
        confirm={confirm}
        preserveFocus
      >
        <Icon />
      </HtmlEditorToolbarButton>
    );
  };

  const renderGroup = (actions: ToolbarAction[]) =>
    actions.filter(action => action.enabled).map(renderAction);

  const insertGroup: ReactNode[] = [
    f.link && (
      <HtmlEditorLinkPopover key="link" editor={editor} active={s.link} disabled={source} />
    ),
    f.image && <HtmlEditorImagePopover key="image" editor={editor} disabled={source} />,
    f.dateTime && (
      <HtmlEditorDateTimePopover
        key="dateTime"
        editor={editor}
        active={s.dateTime}
        disabled={source}
        options={dateTimePicker}
      />
    ),
    f.emoji && (
      <HtmlEditorEmojiPopover key="emoji" editor={editor} disabled={source} options={emojiPicker} />
    ),
    ...renderGroup([
      {
        key: 'horizontalRule',
        icon: MinusIcon,
        enabled: f.horizontalRule,
        disabled: source,
        run: () => chain().setHorizontalRule().run(),
      },
      {
        key: 'clearFormatting',
        icon: RemoveFormattingIcon,
        enabled: f.clearFormatting,
        disabled: source,
        run: () => chain().unsetAllMarks().clearNodes().run(),
      },
    ]),
  ].filter(Boolean);

  const groups: ReactNode[][] = [
    renderGroup(actionGroups[0]),
    f.heading && headingLevels.length > 0
      ? [
          <HtmlEditorHeadingMenu
            key="heading"
            editor={editor}
            levels={headingLevels}
            current={s.heading}
            disabled={source}
          />,
        ]
      : [],
    renderGroup(actionGroups[1]),
    f.textColor || f.backgroundColor
      ? [
          <HtmlEditorColorPopover
            key="color"
            editor={editor}
            textColor={f.textColor}
            backgroundColor={f.backgroundColor}
            currentText={s.textColor}
            currentBackground={s.backgroundColor}
            disabled={markDisabled}
            options={colorPicker}
          />,
        ]
      : [],
    ...actionGroups.slice(2).map(renderGroup),
    f.textAlign
      ? [
          // Wide: four buttons. Narrow: one dropdown.
          <div key="align" className="hidden items-center gap-0.5 @xl/html-editor:flex">
            {alignActions.map(renderAction)}
          </div>,
          <HtmlEditorAlignMenu
            key="align-menu"
            editor={editor}
            current={s.align}
            disabled={source}
            className="@xl/html-editor:hidden"
          />,
        ]
      : [],
    insertGroup,
  ].filter(group => group.length > 0);

  const showSource = f.source && !!onModeChange;
  if (groups.length === 0 && !showSource) return null;

  return (
    <div
      role="toolbar"
      aria-label={t('html.toolbar.label')}
      inert={inert}
      aria-hidden={inert || undefined}
      className={cn('flex items-start gap-0.5 border-b border-input bg-background p-1', className)}
    >
      <div
        ref={scrollRef}
        className={cn(
          // Narrow: one swipeable row. Wide: wrap onto multiple rows.
          'flex min-w-0 flex-1 items-center gap-0.5 overflow-x-auto overscroll-x-contain *:shrink-0',
          '[scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
          '@2xl/html-editor:flex-wrap @2xl/html-editor:overflow-visible'
        )}
        style={{ maskImage: mask, WebkitMaskImage: mask }}
      >
        {groups.map((group, index) => (
          <Fragment key={index}>
            {index > 0 && (
              <Separator orientation="vertical" className="mx-0.5 h-5 w-px bg-border sm:mx-1" />
            )}
            {group}
          </Fragment>
        ))}
      </div>
      {showSource && (
        <>
          {groups.length > 0 && (
            <Separator orientation="vertical" className="mx-0.5 h-5 w-px self-center bg-border" />
          )}
          <HtmlEditorToolbarButton
            label={t('html.toolbar.source')}
            active={source}
            onClick={() => onModeChange(source ? 'visual' : 'source')}
            className="shrink-0"
          >
            <CodeXmlIcon />
          </HtmlEditorToolbarButton>
        </>
      )}
    </div>
  );
}
