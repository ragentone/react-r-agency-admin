import { cn } from '@ui/lib/utils';
import { Check } from 'lucide-react';
import React from 'react';

export interface IMultiSelectorOption<T extends string = string> {
  value: T;
  label: React.ReactNode;
  /** Optional icon in front of the label. */
  icon?: React.ReactNode;
  disabled?: boolean;
}

export interface IMultiSelectorProps<T extends string = string> {
  options: IMultiSelectorOption<T>[];
  /** Selected values – empty = nothing selected (with `allLabel`: "all"). */
  value: T[];
  onChange: (value: T[]) => void;
  /**
   * Adds a first chip that clears the selection (e.g. "All"). It is active while nothing is
   * selected – for filters where "none" means "everything".
   */
  allLabel?: React.ReactNode;
  /** Max. selectable values (further chips are disabled). */
  max?: number;
  disabled?: boolean;
  /** Accessible name of the group. */
  'aria-label'?: string;
  className?: string;
}

const chip =
  'inline-flex h-9 items-center gap-1.5 rounded-full border px-3.5 text-sm font-semibold outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-40';
const chipOn = 'border-foreground bg-foreground text-background';
const chipOff = 'border-border/60 text-foreground hover:bg-foreground/[0.05]';

/**
 * Multi select as chips (mobile first, large touch targets): tap toggles a value, the order of
 * `value` follows the order of `options`. Optional "All" chip that clears the selection.
 *
 * @example
 * <MultiSelector
 *   options={[{ value: 'sport', label: 'Sport' }, { value: 'music', label: 'Musik' }]}
 *   value={selected}
 *   onChange={setSelected}
 *   allLabel="Alle"
 * />
 */
export const MultiSelector = <T extends string = string>({
  options,
  value,
  onChange,
  allLabel,
  max,
  disabled = false,
  className,
  ...aria
}: IMultiSelectorProps<T>) => {
  const selected = new Set(value);
  const full = max !== undefined && selected.size >= max;

  const toggle = (option: T) => {
    const next = new Set(selected);
    if (next.has(option)) next.delete(option);
    else next.add(option);
    // Stable order (same as the options).
    onChange(options.map(item => item.value).filter(item => next.has(item)));
  };

  return (
    <div
      role="group"
      aria-label={aria['aria-label']}
      className={cn('flex flex-wrap gap-2', className)}
    >
      {allLabel !== undefined && (
        <button
          type="button"
          aria-pressed={selected.size === 0}
          disabled={disabled}
          onClick={() => onChange([])}
          className={cn(chip, selected.size === 0 ? chipOn : chipOff)}
        >
          {allLabel}
        </button>
      )}
      {options.map(option => {
        const on = selected.has(option.value);
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={on}
            disabled={disabled || option.disabled || (!on && full)}
            onClick={() => toggle(option.value)}
            className={cn(chip, on ? chipOn : chipOff)}
          >
            {on ? <Check className="size-3.5" strokeWidth={3} aria-hidden="true" /> : option.icon}
            {option.label}
          </button>
        );
      })}
    </div>
  );
};
