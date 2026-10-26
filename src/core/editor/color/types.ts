export type ColorPickSource = 'swatch' | 'custom';

/** HSV with h 0–360, s/v 0–100. */
export interface Hsv {
  h: number;
  s: number;
  v: number;
}

export interface ColorPickerProps {
  /** Current color (hex, rgb() or any value `normalizeColor` understands). */
  value?: string | null;
  /** Fires on every change, including while dragging. */
  onChange?: (color: string) => void;
  /**
   * Fires once a color is picked. `source` is `'swatch'` for palette/recent clicks
   * and `'custom'` for drag end, hex input and eye dropper.
   */
  onChangeComplete?: (color: string, source: ColorPickSource) => void;
  /** Swatch rows. Default: `DEFAULT_COLOR_PALETTE` */
  palette?: string[][];
  /** Swatch size in px. Default: 22 */
  swatchSize?: number;
  /** Show the custom color area (saturation/brightness + hue + hex). Default: true */
  showCustom?: boolean;
  /** Open the custom color area initially. Default: false */
  customOpen?: boolean;
  showRecent?: boolean;
  /** Number of remembered colors. Default: one palette row */
  maxRecent?: number;
  /** Remember recent colors in localStorage. Default: true */
  persist?: boolean;
  /** Fill the available width (swatches grow), e.g. in a bottom sheet. */
  fluid?: boolean;
  className?: string;
}
