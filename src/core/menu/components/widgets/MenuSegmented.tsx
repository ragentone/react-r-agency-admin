import { cn } from '@ui/lib';
import { ToggleGroup, ToggleGroupItem } from '@ui/shad-cn/components/toggle-group.tsx';
import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

export interface IMenuSegmentedOption<T extends string> {
  value: T;
  /** Accessible label (also the tooltip). */
  label: string;
  /** Visible content (short text or icon). */
  content: ReactNode;
}

interface IProps<T extends string> {
  value: T;
  options: IMenuSegmentedOption<T>[];
  onChange: (value: T) => void;
  /** Unique per control – the active pill glides between the options. */
  layoutId: string;
  disabled?: boolean;
  className?: string;
  label?: string;
}

/** Segmented control (shadcn ToggleGroup) used by menu widgets (language, theme …). */
const MenuSegmented = <T extends string>({
  value,
  options,
  onChange,
  layoutId,
  disabled,
  className,
  label,
}: IProps<T>) => (
  <ToggleGroup
    type={'single'}
    value={value}
    // Single mode allows deselecting – a segmented control always keeps one value.
    onValueChange={next => next && next !== value && onChange(next as T)}
    disabled={disabled}
    aria-label={label}
    className={cn('shrink-0 gap-0 rounded-full bg-foreground/[0.06] p-0.5', className)}
  >
    {options.map(option => {
      const active = option.value === value;
      return (
        <ToggleGroupItem
          key={option.value}
          value={option.value}
          aria-label={option.label}
          title={option.label}
          className={cn(
            'relative h-8 min-w-9 rounded-full px-2 text-micro font-semibold uppercase [-webkit-tap-highlight-color:transparent]',
            'hover:bg-transparent data-[state=on]:bg-transparent',
            'focus-visible:ring-2 focus-visible:ring-ring/50',
            active
              ? 'text-background data-[state=on]:text-background hover:text-background'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          {active && (
            <motion.span
              layoutId={layoutId}
              transition={{ type: 'spring', stiffness: 500, damping: 36 }}
              className={'absolute inset-0 rounded-full bg-foreground'}
            />
          )}
          <span className={'relative flex items-center'}>{option.content}</span>
        </ToggleGroupItem>
      );
    })}
  </ToggleGroup>
);

export { MenuSegmented };
