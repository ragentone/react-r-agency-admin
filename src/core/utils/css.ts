type ValueIn = string | number | undefined | null;
type Def = string | '100%' | 'auto';
/**
 * Parses a CSS width or height value and returns a valid CSS string representation.
 */
const parseCssWidthOrHeight = (value: ValueIn, def: Def = 'auto') => {
  if (!value) return def;
  if (typeof value === 'number') return value + 'px';
  return value;
};

export { parseCssWidthOrHeight };
