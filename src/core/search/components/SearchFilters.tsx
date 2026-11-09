import { cn } from '@ui/lib/utils';
import { Toggle } from '@ui/shad-cn/components/toggle';
import type React from 'react';
import { useTranslation } from 'react-i18next';

import type { ISearchBundle } from '../types';
import { useSearchLabel } from './use-search-label';

const chip = cn(
  'relative h-9 shrink-0 rounded-full border border-border/50 px-4 text-caption font-bold whitespace-nowrap text-foreground',
  'hover:bg-accent hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring',
  'data-[state=on]:border-foreground data-[state=on]:bg-foreground data-[state=on]:text-background data-[state=on]:hover:bg-foreground/85 data-[state=on]:hover:text-background',
  // ≥ 44 px tap target on touch screens without growing visually.
  "pointer-coarse:after:absolute pointer-coarse:after:-inset-y-1 pointer-coarse:after:inset-x-0 pointer-coarse:after:content-['']"
);

export interface ISearchFiltersProps {
  bundles: ISearchBundle[];
  selected: string[];
  allSelected: boolean;
  onToggle: (alias: string) => void;
  onSelectAll: () => void;
}

/** Filter chips: "All" + one chip per search area (multi-select). */
export const SearchFilters: React.FC<ISearchFiltersProps> = ({
  bundles,
  selected,
  allSelected,
  onToggle,
  onSelectAll,
}) => {
  const { t } = useTranslation('search');
  const label = useSearchLabel();
  if (bundles.length < 2) return null;

  return (
    <div
      role="group"
      aria-label={t('bundles')}
      className="flex gap-2 overflow-x-auto border-b border-border/50 px-4 pb-3 [scrollbar-width:none]"
    >
      <Toggle className={chip} pressed={allSelected} onPressedChange={onSelectAll}>
        {t('all')}
      </Toggle>
      {bundles.map(bundle => (
        <Toggle
          key={bundle.alias}
          className={chip}
          pressed={!allSelected && selected.includes(bundle.alias)}
          onPressedChange={() => onToggle(bundle.alias)}
        >
          {label(bundle.label, `bundleLabels.${bundle.alias}`)}
        </Toggle>
      ))}
    </div>
  );
};
