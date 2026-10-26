import type { Hsv } from './types';

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

export function rgbToHex(r: number, g: number, b: number): string {
  return `#${[r, g, b].map(c => clamp(Math.round(c), 0, 255).toString(16).padStart(2, '0')).join('')}`;
}

export function hexToRgb(hex: string): [number, number, number] {
  const value = parseInt(hex.slice(1), 16);
  return [(value >> 16) & 255, (value >> 8) & 255, value & 255];
}

/**
 * Normalizes `#abc`, `abc`, `#aabbcc`, `rgb(…)`/`rgba(…)` to lower-case `#rrggbb`.
 * Returns `null` for anything else.
 */
export function normalizeColor(input?: string | null): string | null {
  if (!input) return null;
  let value = input.trim().toLowerCase();

  const rgb = value.match(/^rgba?\(\s*(\d{1,3})[\s,]+(\d{1,3})[\s,]+(\d{1,3})/);
  if (rgb) return rgbToHex(Number(rgb[1]), Number(rgb[2]), Number(rgb[3]));

  if (value.startsWith('#')) value = value.slice(1);
  if (/^[0-9a-f]{3}$/.test(value)) value = [...value].map(c => c + c).join('');
  return /^[0-9a-f]{6}$/.test(value) ? `#${value}` : null;
}

export function rgbToHsv(r: number, g: number, b: number): Hsv {
  const [rn, gn, bn] = [r / 255, g / 255, b / 255];
  const max = Math.max(rn, gn, bn);
  const delta = max - Math.min(rn, gn, bn);
  let h = 0;
  if (delta !== 0) {
    if (max === rn) h = ((gn - bn) / delta) % 6;
    else if (max === gn) h = (bn - rn) / delta + 2;
    else h = (rn - gn) / delta + 4;
  }
  return {
    h: (h * 60 + 360) % 360,
    s: max === 0 ? 0 : (delta / max) * 100,
    v: max * 100,
  };
}

export function hsvToRgb({ h, s, v }: Hsv): [number, number, number] {
  const sn = s / 100;
  const vn = v / 100;
  const k = (n: number) => (n + h / 60) % 6;
  const f = (n: number) => vn - vn * sn * Math.max(0, Math.min(k(n), 4 - k(n), 1));
  return [f(5) * 255, f(3) * 255, f(1) * 255];
}

export const hexToHsv = (hex: string): Hsv => rgbToHsv(...hexToRgb(hex));
export const hsvToHex = (hsv: Hsv): string => rgbToHex(...hsvToRgb(hsv));

/** Relative luminance (WCAG), 0 = black, 1 = white. */
export function luminance(hex: string): number {
  const [r, g, b] = hexToRgb(hex).map(c => {
    const n = c / 255;
    return n <= 0.03928 ? n / 12.92 : ((n + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** Black or white, whichever reads better on the given color. */
export const contrastColor = (hex: string) => (luminance(hex) > 0.4 ? '#000000' : '#ffffff');
