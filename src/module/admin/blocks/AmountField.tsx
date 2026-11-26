import { cn } from '@ui/lib/utils';
import { Input } from '@ui/shad-cn/components/input.tsx';
import React, { useId, useState } from 'react';
import { useTranslation } from 'react-i18next';

const LABEL = 'mb-1.5 block text-caption font-medium text-foreground';

/** "1.234,56" / "1,234.56" / "9,9" / "9.9" → number (the last separator is the decimal one). */
export const parseAmount = (raw: string): number => {
  const clean = raw.replace(/[^\d.,]/g, '');
  const at = Math.max(clean.lastIndexOf(','), clean.lastIndexOf('.'));
  const normal =
    at >= 0 ? `${clean.slice(0, at).replace(/[.,]/g, '')}.${clean.slice(at + 1)}` : clean;
  const value = Number(normal);
  return Number.isFinite(value) ? value : 0;
};

/**
 * Money amount: decimal keypad on phones, always shown with two decimals in the language of
 * the admin ("9,90"), currency symbol inside the field. Typing is free; the value is parsed,
 * clamped and formatted when the field is left.
 */
export const AmountField: React.FC<{
  label: string;
  hint?: string;
  value: number;
  onChange: (value: number) => void;
  currency: string;
  max?: number;
  disabled?: boolean;
}> = ({ label, hint, value, onChange, currency, max = 1000000, disabled }) => {
  const { i18n } = useTranslation('admin');
  const id = useId();
  const [draft, setDraft] = useState<string | null>(null);
  const symbol =
    new Intl.NumberFormat(i18n.language, { style: 'currency', currency })
      .formatToParts(0)
      .find(part => part.type === 'currency')?.value ?? currency;
  const shown = new Intl.NumberFormat(i18n.language, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    useGrouping: false,
  }).format(Number(value) || 0);
  const commit = (raw: string) => {
    onChange(Math.min(max, Math.max(0, Math.round(parseAmount(raw) * 100) / 100)));
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
          type="text"
          inputMode="decimal"
          autoComplete="off"
          value={draft ?? shown}
          onChange={e => setDraft(e.target.value)}
          onFocus={e => e.target.select()}
          onBlur={e => commit(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && commit(e.currentTarget.value)}
          disabled={disabled}
          className={cn('h-11 rounded-xl pr-12 text-base tabular-nums sm:text-body')}
        />
        <span className="pointer-events-none absolute top-1/2 right-3.5 -translate-y-1/2 text-body font-semibold text-muted-foreground">
          {symbol}
        </span>
      </div>
      {hint && <p className="mt-1 text-caption text-muted-foreground">{hint}</p>}
    </div>
  );
};
