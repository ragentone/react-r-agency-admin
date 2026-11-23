import { Input } from '@ui/shad-cn/components/input.tsx';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { parseEuroToCents } from '../utils/request-crm';

export interface IShopRequestValueProps {
  /** Current value in cents (`null`: not set). */
  cents: number | null;
  /** Saves the value; returns `false` on error. */
  onSave: (cents: number | null) => Promise<boolean>;
}

const toText = (cents: number | null): string =>
  cents === null ? '' : String(cents / 100).replace('.', ',');

/** Job value in euros; saved when the field loses focus. Remount (`key`) when the value changes. */
export const ShopRequestValue: React.FC<IShopRequestValueProps> = ({ cents, onSave }) => {
  const { t } = useTranslation('admin-shop');
  const [text, setText] = useState(toText(cents));
  const [invalid, setInvalid] = useState(false);

  const commit = async () => {
    const next = parseEuroToCents(text);
    if (next === undefined) {
      setInvalid(true);
      return;
    }
    setInvalid(false);
    if (next === cents) return;
    if (!(await onSave(next))) setText(toText(cents));
  };

  return (
    <div className="space-y-1">
      <label htmlFor="request-value" className="text-caption text-muted-foreground">
        {t('crm.value.label')}
      </label>
      <div className="relative">
        <Input
          id="request-value"
          inputMode="decimal"
          value={text}
          onChange={event => setText(event.target.value)}
          onBlur={() => void commit()}
          placeholder={t('crm.value.placeholder')}
          aria-invalid={invalid}
          className="border-border/50 pr-8"
        />
        <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-muted-foreground">
          €
        </span>
      </div>
      {invalid && <p className="text-caption text-destructive">{t('crm.value.error')}</p>}
    </div>
  );
};
