import { cn } from '@ui/lib/utils';
import { Sparkles } from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { DEFAULT_ADJUSTMENTS, FILTER_PRESETS } from './constants';
import type { FilterPresetId, ImageAdjustments } from './types';
import { getCssFilterString } from './utils';

interface ImageEditorFiltersProps {
  imageSrc: string;
  selectedFilter: FilterPresetId;
  onSelectFilter: (filterId: FilterPresetId, adjustments: ImageAdjustments) => void;
  disabled?: boolean;
}

export const ImageEditorFilters: React.FC<ImageEditorFiltersProps> = ({
  imageSrc,
  selectedFilter,
  onSelectFilter,
  disabled = false,
}) => {
  const { t } = useTranslation('media');

  const handleFilterClick = (presetId: FilterPresetId) => {
    const preset = FILTER_PRESETS.find(p => p.id === presetId);
    if (!preset) return;

    const newAdjustments: ImageAdjustments = {
      ...DEFAULT_ADJUSTMENTS,
      ...preset.adjustments,
    };

    onSelectFilter(presetId, newAdjustments);
  };

  return (
    <div className="flex flex-col gap-3 p-3 sm:p-4 text-white">
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-1.5 text-xs font-bold text-neutral-400 uppercase tracking-wider">
          <Sparkles className="h-3.5 w-3.5 text-white" />
          {t('filters', { defaultValue: 'Filter' })}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-2.5">
        {FILTER_PRESETS.map(preset => {
          const isSelected = selectedFilter === preset.id;
          const previewAdjustments: ImageAdjustments = {
            ...DEFAULT_ADJUSTMENTS,
            ...preset.adjustments,
          };
          const filterCss = getCssFilterString(previewAdjustments);

          return (
            <button
              key={preset.id}
              type="button"
              disabled={disabled}
              onClick={() => handleFilterClick(preset.id)}
              className={cn(
                'group relative flex flex-col items-center gap-2 rounded-2xl border p-2 text-center transition-all',
                isSelected
                  ? 'border-white bg-white/10 shadow-sm ring-2 ring-white/30'
                  : 'border-neutral-800 bg-neutral-900/50 hover:border-neutral-700 hover:bg-neutral-900'
              )}
            >
              <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-neutral-950 border border-neutral-800/80">
                {imageSrc ? (
                  <img
                    src={imageSrc}
                    alt={preset.name}
                    className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
                    style={{
                      filter: filterCss !== 'none' ? filterCss : undefined,
                    }}
                    loading="lazy"
                  />
                ) : (
                  <div className="h-full w-full bg-neutral-900" />
                )}
              </div>
              <span
                className={cn(
                  'text-xs line-clamp-1 transition-colors',
                  isSelected ? 'font-bold text-white' : 'font-medium text-neutral-300'
                )}
              >
                {t(`filterPresets.${preset.id}`, { defaultValue: preset.name })}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
