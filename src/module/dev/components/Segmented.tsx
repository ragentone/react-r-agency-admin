import { cn } from '@ui/lib/utils';

/** Segmented control (priority / status) – big touch targets. */
export function Segmented<T extends string>({
  label,
  value,
  options,
  onChange,
  text,
  disabled,
}: {
  label: string;
  value: T;
  options: readonly T[];
  onChange: (value: T) => void;
  text: (value: T) => string;
  disabled?: boolean;
}) {
  return (
    <div>
      <p className="mb-1.5 text-caption font-medium text-foreground">{label}</p>
      <div
        role="radiogroup"
        aria-label={label}
        className="grid grid-cols-3 gap-1 rounded-xl bg-foreground/[0.06] p-1"
      >
        {options.map(option => (
          <button
            key={option}
            type="button"
            role="radio"
            aria-checked={value === option}
            disabled={disabled}
            onClick={() => onChange(option)}
            className={cn(
              'h-10 rounded-lg text-body font-semibold transition-colors disabled:opacity-60',
              value === option
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {text(option)}
          </button>
        ))}
      </div>
    </div>
  );
}
