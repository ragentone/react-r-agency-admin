import { cn } from '@ui/lib/utils';
import { Button } from '@ui/shad-cn/components/button';
import { Slider } from '@ui/shad-cn/components/slider';
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  Italic,
  Plus,
  Sparkles,
  Trash2,
  Type,
} from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next';

import type { ImageTextOverlay } from './types';

export interface ImageEditorTextProps {
  texts: ImageTextOverlay[];
  selectedTextId: string | null;
  onSelectTextId: (id: string | null) => void;
  onChangeTexts: (texts: ImageTextOverlay[]) => void;
  disabled?: boolean;
}

const PRESET_COLORS = [
  '#ffffff',
  '#000000',
  '#facc15', // yellow
  '#ef4444', // red
  '#22c55e', // green
  '#3b82f6', // blue
  '#a855f7', // purple
  '#f97316', // orange
  '#06b6d4', // cyan
];

const PRESET_BACKGROUND_KEYS = [
  { key: 'none', labelDefault: 'Kein', value: 'transparent' },
  { key: 'black', labelDefault: 'Schwarz', value: 'rgba(0, 0, 0, 0.75)' },
  { key: 'white', labelDefault: 'Weiß', value: 'rgba(255, 255, 255, 0.9)' },
  { key: 'red', labelDefault: 'Rot', value: 'rgba(220, 38, 38, 0.85)' },
];

export const ImageEditorText: React.FC<ImageEditorTextProps> = ({
  texts,
  selectedTextId,
  onSelectTextId,
  onChangeTexts,
  disabled = false,
}) => {
  const { t } = useTranslation('media');

  const selectedText = texts.find(t => t.id === selectedTextId) || texts[0] || null;

  const handleAddText = () => {
    const newText: ImageTextOverlay = {
      id: `text_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      text: t('sampleText', { defaultValue: 'Text eingeben' }),
      x: 50,
      y: texts.length === 0 ? 50 : Math.min(85, 30 + texts.length * 15),
      fontSize: 28,
      color: '#ffffff',
      backgroundColor: 'transparent',
      fontWeight: 'bold',
      fontStyle: 'normal',
      textAlign: 'center',
      shadow: true,
    };

    const next = [...texts, newText];
    onChangeTexts(next);
    onSelectTextId(newText.id);
  };

  const handleUpdateSelected = (patch: Partial<ImageTextOverlay>) => {
    if (!selectedText) return;
    const next = texts.map(item => (item.id === selectedText.id ? { ...item, ...patch } : item));
    onChangeTexts(next);
  };

  const handleDeleteText = (id: string) => {
    const next = texts.filter(item => item.id !== id);
    onChangeTexts(next);
    if (selectedTextId === id) {
      onSelectTextId(next.length > 0 ? next[next.length - 1].id : null);
    }
  };

  return (
    <div className="flex flex-col gap-4 p-4 text-white">
      {/* Add Text Button */}
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={disabled}
        onClick={handleAddText}
        className="w-full gap-2 rounded-full border-neutral-700 bg-neutral-900/60 py-2.5 text-xs font-semibold text-white hover:bg-neutral-800 hover:text-white hover:border-neutral-600"
      >
        <Plus className="h-4 w-4" />
        {t('addText', { defaultValue: 'Text hinzufügen' })}
      </Button>

      {/* Text Layer list */}
      {texts.length > 0 && (
        <div className="flex flex-col gap-1.5">
          <div className="text-[11px] font-medium tracking-wider text-neutral-400 uppercase">
            {t('textLayers', { defaultValue: 'Text-Ebenen' })} ({texts.length})
          </div>
          <div className="flex flex-wrap gap-1.5">
            {texts.map((item, idx) => {
              const isSelected = selectedText?.id === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onSelectTextId(item.id)}
                  className={cn(
                    'flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all max-w-40 truncate border',
                    isSelected
                      ? 'border-white bg-white text-black font-semibold'
                      : 'border-neutral-800 bg-neutral-900/80 text-neutral-300 hover:bg-neutral-800 hover:text-white'
                  )}
                >
                  <Type className="h-3 w-3 shrink-0" />
                  <span className="truncate">{item.text || `${t('text', { defaultValue: 'Text' })} ${idx + 1}`}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Selected Text Controls */}
      {selectedText ? (
        <div className="flex flex-col gap-4 rounded-xl border border-neutral-800/80 bg-neutral-950/60 p-3.5">
          {/* Text Input */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-neutral-300">
              {t('textContent', { defaultValue: 'Inhalt' })}
            </label>
            <textarea
              value={selectedText.text}
              rows={2}
              disabled={disabled}
              onChange={e => handleUpdateSelected({ text: e.target.value })}
              placeholder={t('enterTextPlaceholder', { defaultValue: 'Dein Text hier...' })}
              className="w-full resize-none rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2 text-xs text-white placeholder-neutral-500 focus:border-white focus:outline-none"
            />
          </div>

          {/* Font Size Slider */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-xs font-medium">
              <span className="text-neutral-300">{t('fontSize', { defaultValue: 'Größe' })}</span>
              <span className="font-mono text-neutral-400">{selectedText.fontSize}px</span>
            </div>
            <Slider
              value={[selectedText.fontSize]}
              min={12}
              max={72}
              step={1}
              disabled={disabled}
              onValueChange={vals => vals[0] !== undefined && handleUpdateSelected({ fontSize: vals[0] })}
            />
          </div>

          {/* Formatting & Alignment Buttons */}
          <div className="flex items-center justify-between gap-2 border-t border-neutral-800/80 pt-3">
            <div className="flex items-center gap-1">
              <button
                type="button"
                disabled={disabled}
                onClick={() =>
                  handleUpdateSelected({
                    fontWeight: selectedText.fontWeight === 'bold' ? 'normal' : 'bold',
                  })
                }
                className={cn(
                  'flex size-8 items-center justify-center rounded-lg border text-xs font-bold transition-colors',
                  selectedText.fontWeight === 'bold'
                    ? 'border-white bg-white text-black'
                    : 'border-neutral-800 bg-neutral-900 text-neutral-300 hover:bg-neutral-800'
                )}
                title={t('bold', { defaultValue: 'Fett' })}
              >
                <Bold className="h-3.5 w-3.5" />
              </button>

              <button
                type="button"
                disabled={disabled}
                onClick={() =>
                  handleUpdateSelected({
                    fontStyle: selectedText.fontStyle === 'italic' ? 'normal' : 'italic',
                  })
                }
                className={cn(
                  'flex size-8 items-center justify-center rounded-lg border text-xs italic transition-colors',
                  selectedText.fontStyle === 'italic'
                    ? 'border-white bg-white text-black'
                    : 'border-neutral-800 bg-neutral-900 text-neutral-300 hover:bg-neutral-800'
                )}
                title={t('italic', { defaultValue: 'Kursiv' })}
              >
                <Italic className="h-3.5 w-3.5" />
              </button>

              <button
                type="button"
                disabled={disabled}
                onClick={() =>
                  handleUpdateSelected({
                    shadow: !selectedText.shadow,
                  })
                }
                className={cn(
                  'flex size-8 items-center justify-center rounded-lg border text-xs transition-colors',
                  selectedText.shadow
                    ? 'border-white bg-white text-black'
                    : 'border-neutral-800 bg-neutral-900 text-neutral-300 hover:bg-neutral-800'
                )}
                title={t('shadow', { defaultValue: 'Schlagschatten' })}
              >
                <Sparkles className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                disabled={disabled}
                onClick={() => handleUpdateSelected({ textAlign: 'left' })}
                className={cn(
                  'flex size-8 items-center justify-center rounded-lg border text-xs transition-colors',
                  selectedText.textAlign === 'left'
                    ? 'border-white bg-white text-black'
                    : 'border-neutral-800 bg-neutral-900 text-neutral-300 hover:bg-neutral-800'
                )}
                title={t('alignLeft', { defaultValue: 'Linksbündig' })}
              >
                <AlignLeft className="h-3.5 w-3.5" />
              </button>

              <button
                type="button"
                disabled={disabled}
                onClick={() => handleUpdateSelected({ textAlign: 'center' })}
                className={cn(
                  'flex size-8 items-center justify-center rounded-lg border text-xs transition-colors',
                  !selectedText.textAlign || selectedText.textAlign === 'center'
                    ? 'border-white bg-white text-black'
                    : 'border-neutral-800 bg-neutral-900 text-neutral-300 hover:bg-neutral-800'
                )}
                title={t('alignCenter', { defaultValue: 'Zentriert' })}
              >
                <AlignCenter className="h-3.5 w-3.5" />
              </button>

              <button
                type="button"
                disabled={disabled}
                onClick={() => handleUpdateSelected({ textAlign: 'right' })}
                className={cn(
                  'flex size-8 items-center justify-center rounded-lg border text-xs transition-colors',
                  selectedText.textAlign === 'right'
                    ? 'border-white bg-white text-black'
                    : 'border-neutral-800 bg-neutral-900 text-neutral-300 hover:bg-neutral-800'
                )}
                title={t('alignRight', { defaultValue: 'Rechtsbündig' })}
              >
                <AlignRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Color Presets */}
          <div className="flex flex-col gap-1.5 border-t border-neutral-800/80 pt-3">
            <span className="text-xs font-medium text-neutral-300">
              {t('textColor', { defaultValue: 'Textfarbe' })}
            </span>
            <div className="flex flex-wrap items-center gap-2">
              {PRESET_COLORS.map(color => (
                <button
                  key={color}
                  type="button"
                  disabled={disabled}
                  onClick={() => handleUpdateSelected({ color })}
                  style={{ backgroundColor: color }}
                  className={cn(
                    'size-6 rounded-full border transition-transform hover:scale-110',
                    selectedText.color === color
                      ? 'border-white ring-2 ring-white ring-offset-2 ring-offset-black scale-110'
                      : 'border-neutral-700'
                  )}
                  aria-label={color}
                />
              ))}
            </div>
          </div>

          {/* Background Pill Presets */}
          <div className="flex flex-col gap-1.5 border-t border-neutral-800/80 pt-3">
            <span className="text-xs font-medium text-neutral-300">
              {t('background', { defaultValue: 'Hintergrund' })}
            </span>
            <div className="flex flex-wrap items-center gap-1.5">
              {PRESET_BACKGROUND_KEYS.map(bg => {
                const isSelected =
                  (!selectedText.backgroundColor && bg.value === 'transparent') ||
                  selectedText.backgroundColor === bg.value;
                return (
                  <button
                    key={bg.value}
                    type="button"
                    disabled={disabled}
                    onClick={() => handleUpdateSelected({ backgroundColor: bg.value })}
                    className={cn(
                      'rounded-full px-2.5 py-1 text-[11px] font-medium border transition-colors disabled:opacity-40 disabled:cursor-not-allowed',
                      isSelected
                        ? 'border-white bg-white text-black font-semibold'
                        : 'border-neutral-800 bg-neutral-900 text-neutral-300 hover:bg-neutral-800 hover:text-white'
                    )}
                  >
                    {t(`backgrounds.${bg.key}`, { defaultValue: bg.labelDefault })}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick Position Presets */}
          <div className="flex flex-col gap-1.5 border-t border-neutral-800/80 pt-3">
            <span className="text-xs font-medium text-neutral-300">
              {t('position', { defaultValue: 'Position' })}
            </span>
            <div className="grid grid-cols-3 gap-1.5">
              <button
                type="button"
                disabled={disabled}
                onClick={() => handleUpdateSelected({ x: 50, y: 15 })}
                className="rounded-lg border border-neutral-800 bg-neutral-900 py-1.5 text-center text-[11px] font-medium text-neutral-300 hover:bg-neutral-800 hover:text-white"
              >
                {t('top', { defaultValue: 'Oben' })}
              </button>
              <button
                type="button"
                disabled={disabled}
                onClick={() => handleUpdateSelected({ x: 50, y: 50 })}
                className="rounded-lg border border-neutral-800 bg-neutral-900 py-1.5 text-center text-[11px] font-medium text-neutral-300 hover:bg-neutral-800 hover:text-white"
              >
                {t('center', { defaultValue: 'Mitte' })}
              </button>
              <button
                type="button"
                disabled={disabled}
                onClick={() => handleUpdateSelected({ x: 50, y: 85 })}
                className="rounded-lg border border-neutral-800 bg-neutral-900 py-1.5 text-center text-[11px] font-medium text-neutral-300 hover:bg-neutral-800 hover:text-white"
              >
                {t('bottom', { defaultValue: 'Unten' })}
              </button>
            </div>
          </div>

          {/* Delete Button */}
          <div className="border-t border-neutral-800/80 pt-3">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={disabled}
              onClick={() => handleDeleteText(selectedText.id)}
              className="w-full gap-1.5 rounded-full text-xs font-semibold text-red-400 hover:bg-red-500/10 hover:text-red-300"
            >
              <Trash2 className="h-3.5 w-3.5" />
              {t('deleteText', { defaultValue: 'Text entfernen' })}
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-neutral-800 p-6 text-center text-xs text-neutral-500">
          <Type className="mb-2 h-8 w-8 text-neutral-600" />
          <p>{t('noTextAdded', { defaultValue: 'Noch kein Text hinzugefügt' })}</p>
          <p className="mt-1 text-[11px] text-neutral-600">
            {t('clickAddTextInstruction', { defaultValue: 'Klicke auf "Text hinzufügen", um Text auf dem Bild zu platzieren.' })}
          </p>
        </div>
      )}
    </div>
  );
};
