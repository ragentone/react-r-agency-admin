import { cn } from '@ui/lib';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@ui/shad-cn/components/tooltip.tsx';
import { useTranslation } from 'react-i18next';

import type { IDockButtonEntry } from '../types.ts';

/** Icon button of the dock – used for registered button entries and by own dock components. */
const DockButton = ({ entry }: { entry: IDockButtonEntry }) => {
  const { t } = useTranslation();
  const Icon = entry.icon;
  const primary = entry.variant === 'primary';
  const badge =
    typeof entry.badge === 'number' && entry.badge > 0
      ? entry.badge > 99
        ? '99+'
        : String(entry.badge)
      : entry.badge === true
        ? ''
        : null;

  const renderButton = () => {
    return (
      <button
        type={'button'}
        onClick={entry.onClick}
        disabled={entry.disabled}
        aria-label={t(entry.label)}
        aria-current={entry.active ? 'page' : undefined}
        className={cn(
          'relative flex size-11 shrink-0 items-center justify-center rounded-full outline-none transition-[background-color,transform,opacity] active:scale-95 focus-visible:ring-2 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-40 [-webkit-tap-highlight-color:transparent]',
          primary
            ? 'bg-foreground text-background hover:opacity-90'
            : 'text-foreground hover:bg-foreground/6',
          entry.active && !primary && 'bg-foreground/8'
        )}
      >
        <Icon className={'size-5.5'} />
        {badge !== null && (
          <span
            aria-hidden
            className={cn(
              'absolute top-0.5 right-0.5 grid place-items-center rounded-full bg-[#f4212e] font-bold text-white ring-2 ring-background',
              badge ? 'h-4 min-w-4 px-1 text-[10px] leading-none tabular-nums' : 'size-2.5'
            )}
          >
            {badge}
          </span>
        )}
      </button>
    );
  };

  return (
    <>
      {entry.tooltip ? (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>{renderButton()}</TooltipTrigger>
            {entry.tooltip && <TooltipContent>{entry.tooltip}</TooltipContent>}
          </Tooltip>
        </TooltipProvider>
      ) : (
        renderButton()
      )}
    </>
  );
};

export { DockButton };
