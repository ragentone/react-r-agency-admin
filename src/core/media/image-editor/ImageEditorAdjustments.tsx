import { Button } from '@ui/shad-cn/components/button';
import { Slider } from '@ui/shad-cn/components/slider';
import {
  Contrast,
  Eye,
  Flame,
  Layers,
  Palette,
  RotateCcw,
  Sparkles,
  Sun,
  SunMedium,
  Zap,
} from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { DEFAULT_ADJUSTMENTS } from './constants';
import type { ImageAdjustments } from './types';

interface ImageEditorAdjustmentsProps {
  adjustments: ImageAdjustments;
  onChange: (adjustments: ImageAdjustments) => void;
  disabled?: boolean;
}

interface SliderConfig {
  key: keyof ImageAdjustments;
  label: string;
  min: number;
  max: number;
  step: number;
  icon: React.ReactNode;
  unit?: string;
}

export const ImageEditorAdjustments: React.FC<ImageEditorAdjustmentsProps> = ({
  adjustments,
  onChange,
  disabled = false,
}) => {
  const { t } = useTranslation('media');

  const configs: SliderConfig[] = [
    {
      key: 'brightness',
      label: t('brightness', { defaultValue: 'Helligkeit' }),
      min: -100,
      max: 100,
      step: 1,
      icon: <Sun className="h-4 w-4" />,
    },
    {
      key: 'contrast',
      label: t('contrast', { defaultValue: 'Kontrast' }),
      min: -100,
      max: 100,
      step: 1,
      icon: <Contrast className="h-4 w-4" />,
    },
    {
      key: 'saturation',
      label: t('saturation', { defaultValue: 'Sättigung' }),
      min: -100,
      max: 100,
      step: 1,
      icon: <Palette className="h-4 w-4" />,
    },
    {
      key: 'exposure',
      label: t('exposure', { defaultValue: 'Belichtung' }),
      min: -100,
      max: 100,
      step: 1,
      icon: <SunMedium className="h-4 w-4" />,
    },
    {
      key: 'warmth',
      label: t('warmth', { defaultValue: 'Farbtemperatur' }),
      min: -100,
      max: 100,
      step: 1,
      icon: <Flame className="h-4 w-4" />,
    },
    {
      key: 'blur',
      label: t('blur', { defaultValue: 'Unschärfe' }),
      min: 0,
      max: 20,
      step: 0.5,
      icon: <Eye className="h-4 w-4" />,
      unit: 'px',
    },
    {
      key: 'sepia',
      label: t('sepia', { defaultValue: 'Sepia' }),
      min: 0,
      max: 100,
      step: 1,
      icon: <Sparkles className="h-4 w-4" />,
      unit: '%',
    },
    {
      key: 'grayscale',
      label: t('grayscale', { defaultValue: 'Graustufen' }),
      min: 0,
      max: 100,
      step: 1,
      icon: <Layers className="h-4 w-4" />,
      unit: '%',
    },
    {
      key: 'hueRotate',
      label: t('hueRotate', { defaultValue: 'Farbton' }),
      min: -180,
      max: 180,
      step: 1,
      icon: <Zap className="h-4 w-4" />,
      unit: '°',
    },
  ];

  const handleValueChange = (key: keyof ImageAdjustments, value: number) => {
    onChange({
      ...adjustments,
      [key]: value,
    });
  };

  const handleReset = () => {
    onChange({ ...DEFAULT_ADJUSTMENTS });
  };

  const isModified = Object.entries(DEFAULT_ADJUSTMENTS).some(
    ([k, v]) => adjustments[k as keyof ImageAdjustments] !== v
  );

  return (
    <div className="flex flex-col gap-4 p-3 sm:p-4 text-white">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
          {t('adjustments', { defaultValue: 'Anpassungen' })}
        </span>
        {isModified && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleReset}
            disabled={disabled}
            className="h-7 gap-1.5 rounded-full px-2.5 text-xs text-neutral-400 hover:bg-neutral-900 hover:text-white"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            {t('reset', { defaultValue: 'Zurücksetzen' })}
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-2.5">
        {configs.map(item => {
          const val = adjustments[item.key];
          return (
            <div
              key={item.key}
              className="flex flex-col gap-2 rounded-xl border border-neutral-800 bg-neutral-900/60 p-3"
            >
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="flex items-center gap-2 text-white">
                  <span className="text-neutral-400">{item.icon}</span>
                  {item.label}
                </span>
                <span className="font-mono text-neutral-400">
                  {val > 0 && item.min < 0 ? `+${val}` : val}
                  {item.unit || ''}
                </span>
              </div>
              <Slider
                value={[val]}
                min={item.min}
                max={item.max}
                step={item.step}
                disabled={disabled}
                onValueChange={values => {
                  if (values[0] !== undefined) {
                    handleValueChange(item.key, values[0]);
                  }
                }}
                className="py-1 [&_[role=slider]]:border-white [&_[role=slider]]:bg-white [&_.bg-primary]:bg-white [&_.bg-primary\/20]:bg-neutral-800"
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};
