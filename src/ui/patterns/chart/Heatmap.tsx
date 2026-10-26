import { cn } from '@ui/lib/utils';
import React from 'react';

/**
 * Grey-scale grid (rows × columns), e.g. weekday × hour. The darker, the more. Every cell has
 * a title with the exact value; `columnStep` merges columns on small screens (24 → 12).
 */
export const Heatmap: React.FC<{
  matrix: number[][];
  rowLabels: string[];
  columnLabels: (column: number) => string | null;
  cellTitle: (row: number, column: number, value: number) => string;
  label: string;
  className?: string;
}> = ({ matrix, rowLabels, columnLabels, cellTitle, label, className }) => {
  const max = Math.max(1, ...matrix.flat());
  const columns = matrix[0]?.length ?? 0;
  return (
    <div className={cn('w-full', className)} role="img" aria-label={label}>
      <div
        className="grid gap-[3px]"
        style={{ gridTemplateColumns: `2.25rem repeat(${columns}, minmax(0, 1fr))` }}
      >
        {matrix.map((row, rowIndex) => (
          <React.Fragment key={rowIndex}>
            <span className="self-center pr-1 text-micro font-semibold text-muted-foreground">
              {rowLabels[rowIndex]}
            </span>
            {row.map((value, column) => (
              <span
                key={column}
                title={cellTitle(rowIndex, column, value)}
                className={cn(
                  'aspect-square rounded-[3px]',
                  value === 0 ? 'border border-border/70' : 'bg-foreground'
                )}
                style={value ? { opacity: 0.15 + (value / max) * 0.85 } : undefined}
              />
            ))}
          </React.Fragment>
        ))}
        <span />
        {Array.from({ length: columns }, (_, column) => (
          <span key={column} className="text-center text-micro text-muted-foreground tabular-nums">
            {columnLabels(column) ?? ''}
          </span>
        ))}
      </div>
      <div className="mt-2 flex items-center justify-end gap-1 text-micro text-muted-foreground">
        <span>0</span>
        {[0.15, 0.4, 0.65, 1].map(opacity => (
          <span
            key={opacity}
            className="size-3 rounded-[3px] bg-foreground"
            style={{ opacity }}
            aria-hidden="true"
          />
        ))}
        <span className="tabular-nums">{max.toLocaleString()}</span>
      </div>
    </div>
  );
};
