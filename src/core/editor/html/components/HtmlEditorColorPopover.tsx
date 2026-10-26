import type { Editor } from '@tiptap/react';
import { cn } from '@ui/lib/utils';
import { BanIcon } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { ColorPicker, type ColorPickSource } from '../../color';
import { ResponsivePopover } from '../../shared';
import type { HtmlEditorColorOptions } from '../types';
import { HtmlEditorToolbarButton } from './HtmlEditorToolbarButton';

type ColorTarget = 'text' | 'background';

interface HtmlEditorColorPopoverProps {
  editor: Editor;
  textColor: boolean;
  backgroundColor: boolean;
  currentText: string | null;
  currentBackground: string | null;
  disabled?: boolean;
  options?: HtmlEditorColorOptions;
}

export function HtmlEditorColorPopover({
  editor,
  textColor,
  backgroundColor,
  currentText,
  currentBackground,
  disabled,
  options,
}: HtmlEditorColorPopoverProps) {
  const { t } = useTranslation('editor');
  const [open, setOpen] = useState(false);
  const [target, setTarget] = useState<ColorTarget>(textColor ? 'text' : 'background');
  const current = target === 'text' ? currentText : currentBackground;
  const showTabs = textColor && backgroundColor;

  const apply = (color: string, source: ColorPickSource) => {
    // Custom colors (dragging, hex) keep the picker open and focused.
    const chain = source === 'swatch' ? editor.chain().focus() : editor.chain();
    if (target === 'text') chain.setColor(color).run();
    else chain.setBackgroundColor(color).run();
    if (source === 'swatch') setOpen(false);
  };

  const reset = () => {
    const chain = editor.chain().focus();
    if (target === 'text') chain.unsetColor().run();
    else chain.unsetBackgroundColor().run();
    setOpen(false);
  };

  const label = t(
    showTabs
      ? 'html.toolbar.color'
      : textColor
        ? 'html.toolbar.textColor'
        : 'html.toolbar.backgroundColor'
  );

  return (
    <ResponsivePopover
      open={open}
      onOpenChange={setOpen}
      title={label}
      popoverClassName="w-auto p-0"
      keepOpenOnFocusOutside
      trigger={
        <HtmlEditorToolbarButton label={label} active={open} disabled={disabled}>
          {/* "A" with a bar in the current color */}
          <span className="relative flex flex-col items-center leading-none">
            <span
              className="rounded-[2px] px-0.5 text-[0.95rem] font-semibold"
              style={
                backgroundColor ? { backgroundColor: currentBackground ?? undefined } : undefined
              }
            >
              A
            </span>
            <span
              className="mt-0.5 h-[3px] w-4 rounded-full"
              style={{
                backgroundColor: (textColor ? currentText : currentBackground) ?? 'currentColor',
              }}
            />
          </span>
        </HtmlEditorToolbarButton>
      }
    >
      {({ sheet }) => (
        <>
          <div
            className={cn(
              'flex items-center gap-2 border-b border-border/50',
              sheet ? 'pb-2' : 'p-2'
            )}
          >
            {showTabs ? (
              <div role="tablist" className="flex flex-1 rounded-md bg-muted p-0.5">
                {(['text', 'background'] as const).map(value => (
                  <button
                    key={value}
                    type="button"
                    role="tab"
                    aria-selected={target === value}
                    onClick={() => setTarget(value)}
                    className={cn(
                      'flex-1 rounded-[calc(var(--radius)-4px)] px-2 py-1 text-xs font-medium text-muted-foreground transition-colors pointer-coarse:py-2',
                      'focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none',
                      target === value && 'bg-background text-foreground shadow-xs'
                    )}
                  >
                    {t(value === 'text' ? 'html.color.text' : 'html.color.background')}
                  </button>
                ))}
              </div>
            ) : (
              <span className="flex-1 px-1 text-xs font-medium text-muted-foreground">{label}</span>
            )}
            <button
              type="button"
              onClick={reset}
              disabled={!current}
              className="flex shrink-0 items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none disabled:pointer-events-none disabled:opacity-40 pointer-coarse:py-2"
            >
              <BanIcon className="size-3.5" />
              {t('html.color.reset')}
            </button>
          </div>
          <ColorPicker
            key={target}
            {...options}
            fluid={sheet}
            className={sheet ? 'px-0' : undefined}
            value={current}
            onChangeComplete={apply}
          />
        </>
      )}
    </ResponsivePopover>
  );
}
