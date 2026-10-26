/**
 * Black / white charts: series differ by filled / outlined / dashed / dotted / hatched,
 * never by colour (works in light and dark mode, readable for colour blindness).
 */
export const CHART_FILL = 'var(--foreground)';
export const CHART_HOLLOW = 'var(--background)';
export const CHART_MUTED = 'var(--muted-foreground)';
export const CHART_GRID = 'var(--border)';

/** Stroke dash patterns for up to 5 lines. */
export const CHART_DASHES = ['0', '6 4', '2 3', '10 4 2 4', '1 6'] as const;

/** Stroke widths that go with `CHART_DASHES` (thicker first line). */
export const CHART_WIDTHS = [2.5, 2, 2, 1.75, 1.75] as const;

/** id of the hatch pattern rendered by `<ChartHatch />` inside an SVG chart. */
export const CHART_HATCH_ID = 'chart-hatch';
export const CHART_HATCH = `url(#${CHART_HATCH_ID})`;

/** Change in percent (`null` when there is nothing to compare with). */
export const changePercent = (current: number, previous: number): number | null =>
  previous > 0 ? ((current - previous) / previous) * 100 : current > 0 ? null : 0;
