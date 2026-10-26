import { cn } from '@ui/lib/utils';
import { Input } from '@ui/shad-cn/components/input.tsx';
import { Switch } from '@ui/shad-cn/components/switch.tsx';
import { Textarea } from '@ui/shad-cn/components/textarea.tsx';
import { ArrowDown, ArrowUp, Link2, Plus, Trash2 } from 'lucide-react';
import React, { useId, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { isSafeUrl } from './types';

const LABEL =
  'mb-1.5 flex items-center justify-between gap-2 text-caption font-medium text-foreground';
const CONTROL = 'rounded-xl text-base sm:text-body';

interface IFieldProps {
  label: string;
  hint?: string;
  disabled?: boolean;
}

/** One line of plain text (with counter). */
export const TextField: React.FC<
  IFieldProps & {
    value: string;
    onChange: (value: string) => void;
    max: number;
    placeholder?: string;
  }
> = ({ label, hint, value, onChange, max, placeholder, disabled }) => {
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className={LABEL}>
        <span>{label}</span>
        {value.length > max * 0.8 && (
          <span className="text-xs font-normal text-muted-foreground tabular-nums">
            {value.length} / {max}
          </span>
        )}
      </label>
      <Input
        id={id}
        value={value}
        maxLength={max}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className={cn('h-11', CONTROL)}
      />
      {hint && <p className="mt-1 text-caption text-muted-foreground">{hint}</p>}
    </div>
  );
};

/** Several lines of plain text (line breaks are kept). */
export const TextAreaField: React.FC<
  IFieldProps & {
    value: string;
    onChange: (value: string) => void;
    max: number;
    rows?: number;
    placeholder?: string;
  }
> = ({ label, hint, value, onChange, max, rows = 3, placeholder, disabled }) => {
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className={LABEL}>
        <span>{label}</span>
        {value.length > max * 0.8 && (
          <span className="text-xs font-normal text-muted-foreground tabular-nums">
            {value.length} / {max}
          </span>
        )}
      </label>
      <Textarea
        id={id}
        value={value}
        maxLength={max}
        rows={rows}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className={cn('resize-y', CONTROL)}
      />
      {hint && <p className="mt-1 text-caption text-muted-foreground">{hint}</p>}
    </div>
  );
};

/** Link target: `/p/…`, `https://…`, `mailto:…`, `tel:…`. */
export const UrlField: React.FC<
  IFieldProps & { value: string; onChange: (value: string) => void }
> = ({ label, value, onChange, disabled }) => {
  const { t } = useTranslation('admin');
  const id = useId();
  const invalid = Boolean(value.trim()) && !isSafeUrl(value.trim());
  return (
    <div>
      <label htmlFor={id} className={LABEL}>
        {label}
      </label>
      <div className="relative">
        <Link2
          className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
        <Input
          id={id}
          value={value}
          maxLength={2000}
          onChange={e => onChange(e.target.value)}
          onBlur={() => onChange(value.trim())}
          placeholder={t('blocks.field.urlPlaceholder')}
          disabled={disabled}
          inputMode="url"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          aria-invalid={invalid}
          className={cn('h-11 pl-10', CONTROL)}
        />
      </div>
      <p
        className={cn('mt-1 text-caption', invalid ? 'text-destructive' : 'text-muted-foreground')}
      >
        {invalid ? t('blocks.field.urlInvalid') : t('blocks.field.urlHint')}
      </p>
    </div>
  );
};

/** Few options as segmented buttons (wraps on small screens). */
export const ChoiceField = <T extends string>({
  label,
  value,
  options,
  onChange,
  text,
  disabled,
}: IFieldProps & {
  value: T;
  options: readonly T[];
  onChange: (value: T) => void;
  text: (value: T) => string;
}) => (
  <div>
    <p className={LABEL}>{label}</p>
    <div role="radiogroup" aria-label={label} className="flex flex-wrap gap-1.5">
      {options.map(option => (
        <button
          key={option}
          type="button"
          role="radio"
          aria-checked={value === option}
          disabled={disabled}
          onClick={() => onChange(option)}
          className={cn(
            'h-9 rounded-full px-3.5 text-caption font-semibold transition-colors disabled:opacity-50',
            value === option
              ? 'bg-foreground text-background'
              : 'border border-border/70 text-muted-foreground hover:text-foreground'
          )}
        >
          {text(option)}
        </button>
      ))}
    </div>
  </div>
);

export const ToggleField: React.FC<
  IFieldProps & { value: boolean; onChange: (value: boolean) => void }
> = ({ label, hint, value, onChange, disabled }) => {
  const id = useId();
  return (
    <label htmlFor={id} className="flex cursor-pointer items-center gap-4 py-1">
      <span className="min-w-0 flex-1">
        <span className="block text-body font-semibold text-foreground">{label}</span>
        {hint && <span className="block text-caption text-muted-foreground">{hint}</span>}
      </span>
      <Switch id={id} checked={value} onCheckedChange={onChange} disabled={disabled} />
    </label>
  );
};

/** List of sub items (cards, questions): add, remove, move. */
export const ItemsField = <T,>({
  label,
  items,
  onChange,
  create,
  max,
  title,
  addLabel,
  render,
  disabled,
}: IFieldProps & {
  items: T[];
  onChange: (items: T[]) => void;
  create: () => T;
  max: number;
  title: (item: T, index: number) => string;
  addLabel: string;
  render: (item: T, update: (item: T) => void) => React.ReactNode;
}) => {
  const { t } = useTranslation('admin');
  const set = (index: number, item: T) =>
    onChange(items.map((current, i) => (i === index ? item : current)));
  const move = (index: number, delta: number) => {
    const next = [...items];
    const [item] = next.splice(index, 1);
    next.splice(index + delta, 0, item);
    onChange(next);
  };
  return (
    <div>
      <p className={LABEL}>
        <span>{label}</span>
        <span className="text-xs font-normal text-muted-foreground tabular-nums">
          {items.length} / {max}
        </span>
      </p>
      <ol className="space-y-3">
        {items.map((item, index) => (
          <li key={index} className="rounded-xl border border-border/60 bg-background">
            <div className="flex items-center gap-1 border-b border-border/50 py-1 pr-1 pl-3">
              <span className="min-w-0 flex-1 truncate text-caption font-semibold text-muted-foreground">
                {index + 1}. {title(item, index)}
              </span>
              <button
                type="button"
                onClick={() => move(index, -1)}
                disabled={disabled || index === 0}
                aria-label={t('blocks.action.up')}
                className="grid size-8 place-items-center rounded-full hover:bg-foreground/10 disabled:opacity-30"
              >
                <ArrowUp className="size-4" />
              </button>
              <button
                type="button"
                onClick={() => move(index, 1)}
                disabled={disabled || index === items.length - 1}
                aria-label={t('blocks.action.down')}
                className="grid size-8 place-items-center rounded-full hover:bg-foreground/10 disabled:opacity-30"
              >
                <ArrowDown className="size-4" />
              </button>
              <button
                type="button"
                onClick={() => onChange(items.filter((_, i) => i !== index))}
                disabled={disabled}
                aria-label={t('blocks.action.removeItem')}
                className="grid size-8 place-items-center rounded-full text-destructive hover:bg-destructive/10 disabled:opacity-30"
              >
                <Trash2 className="size-4" />
              </button>
            </div>
            <div className="space-y-4 p-3">{render(item, next => set(index, next))}</div>
          </li>
        ))}
      </ol>
      {items.length < max && (
        <button
          type="button"
          onClick={() => onChange([...items, create()])}
          disabled={disabled}
          className="mt-3 inline-flex h-10 w-full items-center justify-center gap-1.5 rounded-full border border-dashed border-border text-caption font-bold text-muted-foreground hover:text-foreground disabled:opacity-50"
        >
          <Plus className="size-4" aria-hidden="true" />
          {addLabel}
        </button>
      )}
    </div>
  );
};

/** Whole number with unit (e.g. px) – clamped to min / max when leaving the field. */
export const NumberField: React.FC<
  IFieldProps & {
    value: number;
    onChange: (value: number) => void;
    min: number;
    max: number;
    step?: number;
    unit?: string;
    /** Decimal places (e.g. 6 for coordinates). */
    decimals?: number;
  }
> = ({ label, hint, value, onChange, min, max, step = 10, unit, decimals = 0, disabled }) => {
  const id = useId();
  const [draft, setDraft] = useState<string | null>(null);
  const commit = (raw: string) => {
    const factor = 10 ** decimals;
    const number = Math.round(Number(raw.replace(',', '.')) * factor) / factor;
    onChange(Number.isFinite(number) ? Math.min(max, Math.max(min, number)) : value);
    setDraft(null);
  };
  return (
    <div>
      <label htmlFor={id} className={LABEL}>
        {label}
      </label>
      <div className="relative">
        <Input
          id={id}
          type={decimals ? 'text' : 'number'}
          inputMode={decimals ? 'decimal' : 'numeric'}
          min={min}
          max={max}
          step={step}
          value={draft ?? String(value)}
          onChange={e => setDraft(e.target.value)}
          onBlur={e => commit(e.target.value)}
          disabled={disabled}
          className={cn('h-11 tabular-nums', unit && 'pr-10', CONTROL)}
        />
        {unit && (
          <span className="pointer-events-none absolute top-1/2 right-3.5 -translate-y-1/2 text-caption text-muted-foreground">
            {unit}
          </span>
        )}
      </div>
      {hint && <p className="mt-1 text-caption text-muted-foreground">{hint}</p>}
    </div>
  );
};

/** Date + time in the visitor's time zone, stored as ISO string (UTC). */
export const DateTimeField: React.FC<
  IFieldProps & { value: string; onChange: (value: string) => void }
> = ({ label, hint, value, onChange, disabled }) => {
  const id = useId();
  const date = new Date(value);
  const local = Number.isNaN(date.getTime())
    ? ''
    : new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
  return (
    <div>
      <label htmlFor={id} className={LABEL}>
        {label}
      </label>
      <Input
        id={id}
        type="datetime-local"
        value={local}
        onChange={e => {
          const next = new Date(e.target.value);
          if (!Number.isNaN(next.getTime())) onChange(next.toISOString());
        }}
        disabled={disabled}
        className={cn('h-11', CONTROL)}
      />
      {hint && <p className="mt-1 text-caption text-muted-foreground">{hint}</p>}
    </div>
  );
};
