import { cn } from '@ui/lib/utils';
import { Button } from '@ui/shad-cn/components/button';
import {
  FlipHorizontal as FlipHIcon,
  FlipVertical as FlipVIcon,
  Maximize2,
  Ratio,
  RotateCcw,
  RotateCw,
} from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next';

import type { AspectRatioOption, AspectRatioValue, ImageTransformations } from './types';

interface ImageEditorCropTransformProps {
  aspectRatio: AspectRatioValue;
  aspectRatioOptions: AspectRatioOption[];
  transform: ImageTransformations;
  onAspectRatioChange: (aspectRatio: AspectRatioValue) => void;
  onTransformChange: (transform: ImageTransformations) => void;
  disabled?: boolean;
}

export const ImageEditorCropTransform: React.FC<ImageEditorCropTransformProps> = ({
  aspectRatio,
  aspectRatioOptions,
  transform,
  onAspectRatioChange,
  onTransformChange,
  disabled = false,
}) => {
  const { t } = useTranslation('media');

  const handleRotateLeft = () => {
    onTransformChange({
      ...transform,
      rotation: (transform.rotation - 90 + 360) % 360,
    });
  };

  const handleRotateRight = () => {
    onTransformChange({
      ...transform,
      rotation: (transform.rotation + 90) % 360,
    });
  };

  const handleFlipHorizontal = () => {
    onTransformChange({
      ...transform,
      flipHorizontal: !transform.flipHorizontal,
    });
  };

  const handleFlipVertical = () => {
    onTransformChange({
      ...transform,
      flipVertical: !transform.flipVertical,
    });
  };

  const handleResetTransform = () => {
    onTransformChange({
      rotation: 0,
      flipHorizontal: false,
      flipVertical: false,
    });
    onAspectRatioChange(null);
  };

  const isTransformModified =
    transform.rotation !== 0 ||
    transform.flipHorizontal ||
    transform.flipVertical ||
    aspectRatio !== null;

  return (
    <div className="flex flex-col gap-4 p-3 sm:p-4 text-white">
      {/* Aspect Ratio Selection */}
      <div className="flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-xs font-bold text-neutral-400 uppercase tracking-wider">
            <Ratio className="h-3.5 w-3.5 text-white" />
            {t('aspectRatio', { defaultValue: 'Seitenverhältnis' })}
          </span>
          {isTransformModified && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleResetTransform}
              disabled={disabled}
              className="h-7 gap-1.5 rounded-full px-2.5 text-xs text-neutral-400 hover:bg-neutral-900 hover:text-white"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              {t('reset', { defaultValue: 'Zurücksetzen' })}
            </Button>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          {aspectRatioOptions.map(option => {
            const isSelected =
              aspectRatio === option.value ||
              (aspectRatio === null && option.value === null);

            return (
              <button
                key={option.label}
                type="button"
                disabled={disabled}
                onClick={() => onAspectRatioChange(option.value)}
                className={cn(
                  'flex items-center justify-center rounded-full px-4 py-1.5 text-xs font-semibold transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed',
                  isSelected
                    ? 'bg-white text-black shadow-sm font-bold'
                    : 'border border-neutral-800 bg-neutral-900/60 text-neutral-300 hover:border-neutral-700 hover:bg-neutral-800 hover:text-white'
                )}
              >
                {option.value === null ? <Maximize2 className="mr-1.5 h-3 w-3" /> : null}
                {option.label === 'Free'
                  ? t('ratios.free', { defaultValue: 'Frei' })
                  : option.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Rotation & Flip Controls */}
      <div className="flex flex-col gap-2.5">
        <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
          {t('transform', { defaultValue: 'Drehen & Spiegeln' })}
        </span>

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            disabled={disabled}
            onClick={handleRotateLeft}
            className="flex h-10 items-center justify-center gap-2 rounded-xl border border-neutral-800 bg-neutral-900/60 px-3 text-xs font-semibold text-white transition-all hover:border-neutral-700 hover:bg-neutral-800 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <RotateCcw className="h-4 w-4" />
            <span>-90°</span>
          </button>

          <button
            type="button"
            disabled={disabled}
            onClick={handleRotateRight}
            className="flex h-10 items-center justify-center gap-2 rounded-xl border border-neutral-800 bg-neutral-900/60 px-3 text-xs font-semibold text-white transition-all hover:border-neutral-700 hover:bg-neutral-800 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <RotateCw className="h-4 w-4" />
            <span>+90°</span>
          </button>

          <button
            type="button"
            disabled={disabled}
            onClick={handleFlipHorizontal}
            className={cn(
              'flex h-10 items-center justify-center gap-2 rounded-xl border px-3 text-xs font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed',
              transform.flipHorizontal
                ? 'border-white bg-white text-black'
                : 'border-neutral-800 bg-neutral-900/60 text-white hover:border-neutral-700 hover:bg-neutral-800'
            )}
          >
            <FlipHIcon className="h-4 w-4" />
            <span>{t('flipHorizontal', { defaultValue: 'Horizontal' })}</span>
          </button>

          <button
            type="button"
            disabled={disabled}
            onClick={handleFlipVertical}
            className={cn(
              'flex h-10 items-center justify-center gap-2 rounded-xl border px-3 text-xs font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed',
              transform.flipVertical
                ? 'border-white bg-white text-black'
                : 'border-neutral-800 bg-neutral-900/60 text-white hover:border-neutral-700 hover:bg-neutral-800'
            )}
          >
            <FlipVIcon className="h-4 w-4" />
            <span>{t('flipVertical', { defaultValue: 'Vertikal' })}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
