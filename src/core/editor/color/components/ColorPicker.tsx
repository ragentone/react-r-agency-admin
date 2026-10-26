import { cn } from '@ui/lib/utils';
import { ChevronDownIcon, PipetteIcon } from 'lucide-react';
import { type CSSProperties, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useStoredState } from '../../shared';
import { DEFAULT_COLOR_PALETTE } from '../palette';
import type { ColorPickerProps, ColorPickSource, Hsv } from '../types';
import { hexToHsv, hsvToHex, normalizeColor } from '../utils';
import { ColorPickerArea } from './ColorPickerArea';
import { ColorPickerHue } from './ColorPickerHue';
import { ColorSwatch } from './ColorSwatch';

const STORAGE_RECENT = 'editor.color.recent';

interface EyeDropperResult {
  sRGBHex: string;
}
type EyeDropperCtor = new () => { open: () => Promise<EyeDropperResult> };

const getEyeDropper = () =>
  typeof window !== 'undefined'
    ? (window as unknown as { EyeDropper?: EyeDropperCtor }).EyeDropper
    : undefined;

export function ColorPicker({
  value,
  onChange,
  onChangeComplete,
  palette = DEFAULT_COLOR_PALETTE,
  swatchSize = 22,
  showCustom = true,
  customOpen = false,
  showRecent = true,
  maxRecent,
  persist = true,
  fluid = false,
  className,
}: ColorPickerProps) {
  const { t } = useTranslation('editor');
  const current = normalizeColor(value);

  const [hsv, setHsv] = useState<Hsv>(() =>
    current ? hexToHsv(current) : { h: 0, s: 100, v: 100 }
  );
  const [hexInput, setHexInput] = useState(current ?? '');
  const [syncedValue, setSyncedValue] = useState(current);
  const [customVisible, setCustomVisible] = useState(customOpen);
  const [recent, setRecent] = useStoredState<string[]>(STORAGE_RECENT, [], persist);
  const latest = useRef(current);

  // Follow external value changes (e.g. cursor moved to differently colored text).
  if (current !== syncedValue) {
    setSyncedValue(current);
    setHexInput(current ?? '');
    if (current && current !== hsvToHex(hsv)) setHsv(hexToHsv(current));
  }

  const columns = Math.max(...palette.map(row => row.length), 1);
  const recentColors = recent.slice(0, maxRecent ?? columns);
  const EyeDropper = getEyeDropper();

  const emit = (hex: string) => {
    latest.current = hex;
    onChange?.(hex);
  };

  const commit = (hex: string, source: ColorPickSource) => {
    setRecent(prev => [hex, ...prev.filter(color => color !== hex)].slice(0, 30));
    onChangeComplete?.(hex, source);
  };

  const pick = (hex: string, source: ColorPickSource) => {
    setHsv(hexToHsv(hex));
    setHexInput(hex);
    emit(hex);
    commit(hex, source);
  };

  const changeHsv = (next: Hsv) => {
    const hex = hsvToHex(next);
    setHsv(next);
    setHexInput(hex);
    emit(hex);
  };

  const endDrag = () => {
    if (latest.current) commit(latest.current, 'custom');
  };

  const confirmHex = () => {
    const hex = normalizeColor(hexInput);
    if (hex) pick(hex, 'custom');
    else setHexInput(current ?? '');
  };

  const pickFromScreen = async () => {
    if (!EyeDropper) return;
    try {
      const result = await new EyeDropper().open();
      const hex = normalizeColor(result.sRGBHex);
      if (hex) {
        setCustomVisible(true);
        pick(hex, 'custom');
      }
    } catch {
      // cancelled with Esc
    }
  };

  const gridStyle = {
    gridTemplateColumns: fluid
      ? `repeat(${columns}, minmax(0, 1fr))`
      : `repeat(${columns}, minmax(0, ${swatchSize}px))`,
  } as CSSProperties;
  const width = columns * swatchSize + (columns - 1) * 5 + 24;

  const renderSwatches = (colors: string[], keyPrefix: string) =>
    colors.map((color, index) => (
      <ColorSwatch
        key={`${keyPrefix}-${index}-${color}`}
        color={color}
        selected={current === normalizeColor(color)}
        onClick={() => pick(normalizeColor(color) ?? color, 'swatch')}
      />
    ));

  return (
    <div
      data-html-editor-ui=""
      className={cn('flex flex-col gap-3 p-3 text-popover-foreground', className)}
      style={{ width: fluid ? '100%' : `min(${width}px, calc(100vw - 1rem))` }}
    >
      <div
        className="grid justify-between gap-[5px]"
        style={gridStyle}
        role="group"
        aria-label={t('color.palette')}
      >
        {palette.flatMap((row, rowIndex) => renderSwatches(row, `p${rowIndex}`))}
      </div>

      {showRecent && recentColors.length > 0 && (
        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-muted-foreground">{t('color.recent')}</span>
          <div className="grid justify-between gap-[5px]" style={gridStyle}>
            {renderSwatches(recentColors, 'r')}
          </div>
        </div>
      )}

      {showCustom && (
        <div className="flex flex-col gap-2.5 border-t border-border/50 pt-2.5">
          <div className="flex items-center justify-between">
            <button
              type="button"
              aria-expanded={customVisible}
              onClick={() => setCustomVisible(open => !open)}
              className="-mx-1 flex items-center gap-1 rounded-sm px-1 py-0.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none pointer-coarse:py-1.5"
            >
              {t('color.custom')}
              <ChevronDownIcon
                className={cn('size-3.5 transition-transform', customVisible && 'rotate-180')}
              />
            </button>
            {EyeDropper && (
              <button
                type="button"
                onClick={pickFromScreen}
                title={t('color.eyeDropper')}
                aria-label={t('color.eyeDropper')}
                className="flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none"
              >
                <PipetteIcon className="size-4" />
              </button>
            )}
          </div>

          {customVisible && (
            <>
              <ColorPickerArea
                hsv={hsv}
                onChange={changeHsv}
                onChangeEnd={endDrag}
                label={t('color.saturation')}
              />
              <ColorPickerHue
                hue={hsv.h}
                onChange={h => changeHsv({ ...hsv, h })}
                onChangeEnd={endDrag}
                label={t('color.hue')}
              />
              <div className="flex items-center gap-2">
                <span
                  className="size-8 shrink-0 rounded-md shadow-[inset_0_0_0_1px_rgb(0_0_0/0.12)]"
                  style={{ backgroundColor: hsvToHex(hsv) }}
                />
                <label className="relative flex-1">
                  <span className="sr-only">{t('color.hex')}</span>
                  <input
                    value={hexInput}
                    onChange={event => setHexInput(event.target.value)}
                    onBlur={confirmHex}
                    onKeyDown={event => {
                      if (event.key === 'Enter') {
                        event.preventDefault();
                        confirmHex();
                      }
                    }}
                    spellCheck={false}
                    autoComplete="off"
                    autoCapitalize="none"
                    autoCorrect="off"
                    enterKeyHint="done"
                    placeholder="#000000"
                    aria-invalid={hexInput !== '' && !normalizeColor(hexInput)}
                    className="h-8 w-full rounded-md border border-input bg-transparent px-2 font-mono text-sm uppercase outline-none focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring aria-invalid:border-destructive pointer-coarse:h-10 pointer-coarse:text-base"
                  />
                </label>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
