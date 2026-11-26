import { cn } from '@ui/lib/utils';
import { Input } from '@ui/shad-cn/components/input.tsx';
import { Hash } from 'lucide-react';
import React, { useId } from 'react';
import { useTranslation } from 'react-i18next';

import { type PageBlock, SITE_PAGE_BLOCK_ANCHOR } from './types';

/** While typing: lower case, spaces → dashes, only a–z, 0–9, dashes, max 40. */
const normalize = (value: string) =>
  value
    .toLowerCase()
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .replace(/ß/g, 'ss')
    .replace(/[\s_]+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-{2,}/g, '-')
    .slice(0, 40);

/** Optional jump target of a block (`#preise`) – unique per page, same rule as the backend. */
export const BlockAnchorField: React.FC<{
  block: PageBlock;
  /** Anchors of the other blocks. */
  taken: string[];
  onChange: (block: PageBlock) => void;
  disabled?: boolean;
}> = ({ block, taken, onChange, disabled }) => {
  const { t } = useTranslation('admin');
  const id = useId();
  const value = block.anchor ?? '';

  const set = (next: string) => {
    const copy = { ...block };
    delete copy.anchor;
    onChange(next ? { ...copy, anchor: next } : copy);
  };

  const error = !value
    ? ''
    : !SITE_PAGE_BLOCK_ANCHOR.test(value)
      ? t('blocks.anchor.invalid')
      : taken.includes(value)
        ? t('blocks.anchor.taken')
        : '';

  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-caption font-medium text-foreground">
        {t('blocks.anchor.label')}
      </label>
      <div className="relative">
        <Hash
          className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
        <Input
          id={id}
          value={value}
          onChange={e => set(normalize(e.target.value))}
          // Leading dashes / digits are not allowed – cleaned when leaving the field.
          onBlur={() => set(value.replace(/^[^a-z]+/, '').replace(/-+$/, ''))}
          placeholder="preise"
          disabled={disabled}
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          aria-invalid={Boolean(error)}
          className="h-11 rounded-xl pl-10 text-base sm:text-body"
        />
      </div>
      <p className={cn('mt-1 text-caption', error ? 'text-destructive' : 'text-muted-foreground')}>
        {error ||
          (value ? t('blocks.anchor.linkHint', { anchor: value }) : t('blocks.anchor.hint'))}
      </p>
    </div>
  );
};
