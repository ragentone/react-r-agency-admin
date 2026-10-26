import { cn } from '@ui/lib/utils';

export interface ICreditsSegmentedOption<T extends string> {
  value: T;
  label: string;
}

/** Small segmented control (funding, single / batch …). */
export const CreditsSegmented = <T extends string>({
  value,
  options,
  onChange,
  label,
  className,
}: {
  value: T;
  options: ICreditsSegmentedOption<T>[];
  onChange: (value: T) => void;
  label: string;
  className?: string;
}) => (
  <div
    role="radiogroup"
    aria-label={label}
    className={cn('inline-flex rounded-full bg-foreground/[0.06] p-0.5', className)}
  >
    {options.map(option => {
      const selected = option.value === value;
      return (
        <button
          key={option.value}
          type="button"
          role="radio"
          aria-checked={selected}
          onClick={() => onChange(option.value)}
          className={cn(
            'h-8 rounded-full px-3 text-caption font-bold whitespace-nowrap outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring',
            selected
              ? 'bg-foreground text-background'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          {option.label}
        </button>
      );
    })}
  </div>
);
