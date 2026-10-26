import { cn } from '@ui/lib';
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from '@ui/shad-cn/components/item.tsx';
import { Spinner } from '@ui/shad-cn/components/spinner.tsx';
import { Tooltip, TooltipContent, TooltipTrigger } from '@ui/shad-cn/components/tooltip.tsx';
import { ChevronRight } from 'lucide-react';
import type { ReactNode } from 'react';

import type { MenuComponentVariant, MenuIcon } from '../../types.ts';

interface IProps {
  variant: MenuComponentVariant;
  icon: MenuIcon;
  label: string;
  /** Second line (drawer / sidebar). Falls back to `valueLabel`. */
  description?: ReactNode;
  /** Current value – rail tooltip and fallback for `description`. */
  valueLabel?: string;
  /** Control on the right (Switch, segmented …). */
  control?: ReactNode;
  /**
   * Id of the control (e.g. a `Switch`) – the whole row becomes its `<label>`, so tapping
   * anywhere on the row toggles it.
   */
  controlId?: string;
  /** Whole row is a button (no `control`): navigation / action. */
  onSelect?: () => void;
  /** Rail (icon only): click action. Falls back to `onSelect`. */
  onCycle?: () => void;
  /** Row opens something (drawer / dialog) → chevron on the right. */
  navigates?: boolean;
  /** Loading state: spinner in place of the icon, row disabled. */
  busy?: boolean;
  disabled?: boolean;
  /** Blinking red dot on the icon (e.g. new version). */
  attention?: boolean;
  /** Highlighted background (e.g. pending update). */
  highlight?: boolean;
}

/** Blinking red dot (static with reduced motion). */
const AttentionDot = ({ className }: { className?: string }) => (
  <span aria-hidden className={cn('pointer-events-none absolute flex size-2.5', className)}>
    <span
      className={
        'absolute inline-flex size-full animate-ping rounded-full bg-[#f4212e] opacity-75 motion-reduce:animate-none'
      }
    />
    <span
      className={'relative inline-flex size-2.5 rounded-full bg-[#f4212e] ring-2 ring-background'}
    />
  </span>
);

const interactive =
  'cursor-pointer hover:bg-foreground/[0.04] active:bg-foreground/[0.08] [-webkit-tap-highlight-color:transparent] disabled:pointer-events-none disabled:opacity-60';

/**
 * The one row of the settings drawer: icon · title + description · control / chevron.
 * In the icon rail it collapses to a single icon button with a tooltip.
 */
const MenuSettingRow = ({
  variant,
  icon: Icon,
  label,
  description,
  valueLabel,
  control,
  controlId,
  onSelect,
  onCycle,
  navigates,
  busy,
  disabled,
  attention,
  highlight,
}: IProps) => {
  const icon = busy ? (
    <Spinner className={variant === 'rail' ? 'size-6' : 'size-5'} />
  ) : (
    <Icon className={variant === 'rail' ? 'size-6' : 'size-5'} strokeWidth={1.75} />
  );

  if (variant === 'rail') {
    const action = onCycle ?? onSelect;
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type={'button'}
            onClick={action}
            disabled={disabled || busy || !action}
            aria-busy={busy || undefined}
            aria-label={valueLabel ? `${label}: ${valueLabel}` : label}
            className={
              'relative flex w-full items-center justify-center rounded-full p-3 text-muted-foreground outline-none transition-colors hover:bg-foreground/[0.06] hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50 disabled:opacity-60'
            }
          >
            {icon}
            {attention && !busy && <AttentionDot className={'top-2 right-2'} />}
          </button>
        </TooltipTrigger>
        <TooltipContent side={'right'} sideOffset={6}>
          {label}
          {valueLabel && <span className={'opacity-70'}> · {valueLabel}</span>}
        </TooltipContent>
      </Tooltip>
    );
  }

  const secondLine = description ?? valueLabel;

  const content = (
    <>
      <ItemMedia
        className={cn(
          'relative size-10 rounded-full bg-foreground/[0.06] text-foreground',
          // Keep the icon centered even with a description (Item shifts it to the top).
          'group-has-[[data-slot=item-description]]/item:translate-y-0 group-has-[[data-slot=item-description]]/item:self-center'
        )}
      >
        {icon}
        {attention && !busy && <AttentionDot className={'-top-0.5 -right-0.5'} />}
      </ItemMedia>
      <ItemContent className={'min-w-0 gap-0'}>
        <ItemTitle className={'w-full truncate text-body font-medium'}>{label}</ItemTitle>
        {secondLine && (
          <ItemDescription className={'line-clamp-1 text-caption text-muted-foreground'}>
            {secondLine}
          </ItemDescription>
        )}
      </ItemContent>
      {(control || navigates) && (
        <ItemActions className={'shrink-0'}>
          {control}
          {navigates && !control && (
            <ChevronRight aria-hidden className={'size-5 text-muted-foreground'} />
          )}
        </ItemActions>
      )}
    </>
  );

  const rowClass = cn(
    'w-full flex-nowrap gap-3 rounded-2xl py-2.5 text-left',
    variant === 'drawer' ? 'px-3' : 'px-4',
    highlight && 'bg-foreground/[0.04] ring-1 ring-border/50'
  );

  // Row toggles its control (Switch): the whole row is the label.
  if (control && controlId) {
    return (
      <Item asChild size={'sm'} className={cn(rowClass, interactive)}>
        <label htmlFor={controlId}>{content}</label>
      </Item>
    );
  }

  // Action / navigation row.
  if (!control && onSelect) {
    return (
      <Item asChild size={'sm'} className={cn(rowClass, interactive)}>
        <button
          type={'button'}
          onClick={onSelect}
          disabled={disabled || busy}
          aria-busy={busy || undefined}
        >
          {content}
        </button>
      </Item>
    );
  }

  return (
    <Item size={'sm'} className={rowClass}>
      {content}
    </Item>
  );
};

export { MenuSettingRow };
