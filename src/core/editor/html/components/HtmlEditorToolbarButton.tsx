import { cn } from '@ui/lib/utils';
import { Button } from '@ui/shad-cn/components/button.tsx';
import { Popover, PopoverContent, PopoverTrigger } from '@ui/shad-cn/components/popover.tsx';
import { toggleVariants } from '@ui/shad-cn/components/toggle';
import { Tooltip, TooltipContent, TooltipTrigger } from '@ui/shad-cn/components/tooltip';
import { Check, X } from 'lucide-react';
import { type ComponentProps, type PointerEvent, useState } from 'react';

import { useIsTouch } from '../../shared';
import { formatShortcut } from '../utils';

export interface HtmlEditorToolbarButtonProps extends ComponentProps<'button'> {
  label: string;
  shortcut?: string;
  active?: boolean;
  /**
   * Don't take focus from the editor when pressed. Keeps the selection and – on
   * phones – the on-screen keyboard open. For direct actions (bold, lists …),
   * not for buttons that open a popover or sheet.
   */
  preserveFocus?: boolean;
  confirm?: boolean;
}

export function HtmlEditorToolbarButton({
  label,
  shortcut,
  active = false,
  preserveFocus = false,
  className,
  children,
  ref,
  onPointerDown,
  confirm = false,
  ...props
}: HtmlEditorToolbarButtonProps) {
  const isTouch = useIsTouch();
  const [isOpen, setIsOpen] = useState(false);

  const handlePointerDown = (event: PointerEvent<HTMLButtonElement>) => {
    if (preserveFocus) event.preventDefault();
    onPointerDown?.(event);
  };

  const onClick = props.onClick;
  delete props.onClick;

  const button = (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild={true}>
        <button
          ref={ref}
          type="button"
          aria-label={label}
          aria-pressed={active}
          data-active={active || undefined}
          onPointerDown={handlePointerDown}
          onClick={confirm ? undefined : onClick}
          onMouseDown={preserveFocus ? event => event.preventDefault() : undefined}
          className={cn(
            toggleVariants({ size: 'sm' }),
            'data-[active=true]:bg-accent data-[active=true]:text-accent-foreground',
            'pointer-coarse:h-10 pointer-coarse:min-w-10 pointer-coarse:active:bg-accent',
            'cursor-pointer',
            className
          )}
          {...props}
        >
          {children}
        </button>
      </PopoverTrigger>
      {confirm && (
        <PopoverContent className={'grid grid-cols-2 w-auto gap-1 p-2 mx-2 rounded-4xl'}>
          <Button variant="outline" size="icon-md" onClick={() => setIsOpen(false)}>
            <X />
          </Button>
          <Button
            variant="destructive"
            size="icon-md"
            onClick={event => {
              setIsOpen(false);
              onClick?.(event);
            }}
          >
            <Check />
          </Button>
        </PopoverContent>
      )}
    </Popover>
  );

  // Tooltips need hover; on touch they only get in the way.
  if (isTouch) return button;

  return (
    <Tooltip>
      <TooltipTrigger asChild>{button}</TooltipTrigger>
      <TooltipContent side="bottom" className="flex items-center gap-2">
        <span>{label}</span>
        {shortcut && (
          <kbd className="font-sans text-[0.7rem] opacity-60">{formatShortcut(shortcut)}</kbd>
        )}
      </TooltipContent>
    </Tooltip>
  );
}
