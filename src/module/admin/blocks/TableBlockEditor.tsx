import { cn } from '@ui/lib/utils';
import { Textarea } from '@ui/shad-cn/components/textarea.tsx';
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  ArrowDown,
  ArrowUp,
  ClipboardPaste,
  Columns2,
  Plus,
  Rows2,
  Trash2,
  X,
} from 'lucide-react';
import React, { useId, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { ChoiceField, TextField, ToggleField } from './BlockFields';
import {
  emptyTableColumn,
  emptyTableRow,
  type ITableBlockData,
  type ITableColumn,
  type ITableRow,
  SITE_PAGE_TABLE_COLUMNS_MAX,
  SITE_PAGE_TABLE_ROWS_MAX,
  TABLE_CELL_KEYS,
} from './types';

const CELL_MAX = 300;
const LABEL_MAX = 80;

const ALIGN_NEXT = { left: 'center', center: 'right', right: 'left' } as const;
const ALIGN_ICON = { left: AlignLeft, center: AlignCenter, right: AlignRight } as const;

const ICON_BUTTON =
  'grid size-8 shrink-0 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-foreground/10 hover:text-foreground disabled:pointer-events-none disabled:opacity-30';
const PILL_BUTTON =
  'inline-flex h-9 items-center gap-1.5 rounded-full border border-border/70 px-3.5 text-caption font-semibold text-muted-foreground transition-colors hover:text-foreground disabled:pointer-events-none disabled:opacity-40';
const CELL_INPUT =
  'h-10 w-full min-w-[8.5rem] rounded-lg border border-transparent bg-transparent px-2.5 text-base outline-none transition-colors placeholder:text-muted-foreground/50 hover:border-border/70 focus:border-foreground/40 focus:bg-background sm:text-body disabled:opacity-60';

/**
 * Delimited text (Excel / Google Sheets copy = tabs, CSV = `;` or `,`) → rows of cells.
 * Handles quoted cells with line breaks and `""` escapes.
 */
const parseDelimited = (raw: string): string[][] => {
  const input = raw.replace(/\r\n?/g, '\n').replace(/\n+$/, '');
  if (!input.trim()) return [];
  const firstLine = input.split('\n', 1)[0];
  const delimiter = firstLine.includes('\t') ? '\t' : firstLine.includes(';') ? ';' : ',';
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = '';
  let quoted = false;
  for (let i = 0; i < input.length; i++) {
    const char = input[i];
    if (quoted) {
      if (char === '"' && input[i + 1] === '"') {
        cell += '"';
        i++;
      } else if (char === '"') {
        quoted = false;
      } else {
        cell += char;
      }
    } else if (char === '"' && cell === '') {
      quoted = true;
    } else if (char === delimiter) {
      row.push(cell);
      cell = '';
    } else if (char === '\n') {
      row.push(cell);
      rows.push(row);
      row = [];
      cell = '';
    } else {
      cell += char;
    }
  }
  row.push(cell);
  rows.push(row);
  return rows.map(cells => cells.map(value => value.trim()));
};

/** Cells of a row as array (length = column count). */
const cellsOf = (row: ITableRow, count: number) =>
  TABLE_CELL_KEYS.slice(0, count).map(key => row[key] ?? '');

/** Array of cells → row object (missing cells empty). */
const rowOf = (cells: string[]): ITableRow => {
  const row = emptyTableRow();
  TABLE_CELL_KEYS.forEach((key, index) => {
    row[key] = (cells[index] ?? '').slice(0, CELL_MAX);
  });
  return row;
};

/** Inline grid: column heads + cells, rows / columns added, moved and removed in place. */
const TableGrid: React.FC<{
  data: ITableBlockData;
  onChange: (data: ITableBlockData) => void;
  disabled?: boolean;
}> = ({ data, onChange, disabled }) => {
  const { t } = useTranslation('admin');
  const gridRef = useRef<HTMLDivElement>(null);
  const { columns, rows } = data;
  const count = columns.length;

  const focusCell = (row: number, column: number) =>
    requestAnimationFrame(() =>
      gridRef.current?.querySelector<HTMLInputElement>(`[data-cell="${row}:${column}"]`)?.focus()
    );

  const setColumn = (index: number, column: ITableColumn) =>
    onChange({ ...data, columns: columns.map((c, i) => (i === index ? column : c)) });

  const setCell = (rowIndex: number, column: number, value: string) =>
    onChange({
      ...data,
      rows: rows.map((row, i) =>
        i === rowIndex ? { ...row, [TABLE_CELL_KEYS[column]]: value } : row
      ),
    });

  const addColumn = () => {
    if (count >= SITE_PAGE_TABLE_COLUMNS_MAX) return;
    onChange({ ...data, columns: [...columns, emptyTableColumn()] });
    focusCell(-1, count);
  };

  /** Removes the column and shifts the cells right of it to the left. */
  const removeColumn = (index: number) =>
    onChange({
      ...data,
      columns: columns.filter((_, i) => i !== index),
      rows: rows.map(row => rowOf(cellsOf(row, count).filter((_, i) => i !== index))),
    });

  const addRow = (focus = true) => {
    if (rows.length >= SITE_PAGE_TABLE_ROWS_MAX) return;
    onChange({ ...data, rows: [...rows, emptyTableRow()] });
    if (focus) focusCell(rows.length, 0);
  };

  const moveRow = (index: number, delta: number) => {
    const next = [...rows];
    const [row] = next.splice(index, 1);
    next.splice(index + delta, 0, row);
    onChange({ ...data, rows: next });
  };

  /** Enter → same column one row down (new row at the end). */
  const onCellKeyDown = (event: React.KeyboardEvent, rowIndex: number, column: number) => {
    if (event.key !== 'Enter' || event.nativeEvent.isComposing) return;
    event.preventDefault();
    if (rowIndex + 1 < rows.length) focusCell(rowIndex + 1, column);
    else if (rows.length < SITE_PAGE_TABLE_ROWS_MAX) {
      onChange({ ...data, rows: [...rows, emptyTableRow()] });
      focusCell(rowIndex + 1, column);
    }
  };

  /** Pasting several cells (from a spreadsheet) fills the grid from this cell on. */
  const onCellPaste = (event: React.ClipboardEvent, rowIndex: number, column: number) => {
    const text = event.clipboardData.getData('text/plain');
    if (!/[\t\n]/.test(text.replace(/\n+$/, ''))) return;
    event.preventDefault();
    const pasted = parseDelimited(text);
    // rowIndex -1 = header row.
    const head = rowIndex < 0 ? pasted.shift() : undefined;
    const startRow = Math.max(rowIndex, 0);
    const widest = Math.max(head?.length ?? 0, ...pasted.map(cells => cells.length));
    const nextCount = Math.min(SITE_PAGE_TABLE_COLUMNS_MAX, Math.max(count, column + widest));
    const nextColumns = [...columns];
    while (nextColumns.length < nextCount) nextColumns.push(emptyTableColumn());
    head?.forEach((label, offset) => {
      const index = column + offset;
      if (index < nextCount)
        nextColumns[index] = { ...nextColumns[index], label: label.slice(0, LABEL_MAX) };
    });
    const nextRows = [...rows];
    pasted.forEach((cells, offset) => {
      const index = startRow + offset;
      if (index >= SITE_PAGE_TABLE_ROWS_MAX) return;
      const current = cellsOf(nextRows[index] ?? emptyTableRow(), SITE_PAGE_TABLE_COLUMNS_MAX);
      cells.forEach((value, cellOffset) => {
        if (column + cellOffset < nextCount) current[column + cellOffset] = value;
      });
      nextRows[index] = rowOf(current);
    });
    onChange({ ...data, columns: nextColumns, rows: nextRows });
  };

  return (
    <div>
      <div
        ref={gridRef}
        className="-mx-3 overflow-x-auto overscroll-x-contain px-3 pb-1 sm:mx-0 sm:px-0"
      >
        <table className="w-max min-w-full border-separate border-spacing-0 text-left">
          <thead>
            <tr>
              {columns.map((column, index) => {
                const AlignIcon = ALIGN_ICON[column.align] ?? AlignLeft;
                return (
                  <th
                    key={index}
                    scope="col"
                    className="border-b border-border/70 bg-foreground/[0.04] p-1 align-bottom font-normal first:rounded-tl-xl last:rounded-tr-xl"
                  >
                    <div className="flex items-center justify-between gap-1 px-1 pb-0.5">
                      <span className="text-[11px] font-semibold text-muted-foreground tabular-nums">
                        {t('blocks.table.column', { index: index + 1 })}
                      </span>
                      <span className="flex">
                        <button
                          type="button"
                          onClick={() =>
                            setColumn(index, {
                              ...column,
                              align: ALIGN_NEXT[column.align] ?? 'left',
                            })
                          }
                          disabled={disabled}
                          aria-label={t('blocks.table.alignValue', {
                            value: t(`blocks.position.h.${column.align}`),
                          })}
                          title={t(`blocks.position.h.${column.align}`)}
                          className={ICON_BUTTON}
                        >
                          <AlignIcon className="size-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => removeColumn(index)}
                          disabled={disabled || count <= 1}
                          aria-label={t('blocks.table.removeColumn')}
                          className={cn(
                            ICON_BUTTON,
                            'hover:bg-destructive/10 hover:text-destructive'
                          )}
                        >
                          <X className="size-4" />
                        </button>
                      </span>
                    </div>
                    <input
                      data-cell={`-1:${index}`}
                      value={column.label}
                      maxLength={LABEL_MAX}
                      onChange={e => setColumn(index, { ...column, label: e.target.value })}
                      onKeyDown={e => onCellKeyDown(e, -1, index)}
                      onPaste={e => onCellPaste(e, -1, index)}
                      placeholder={t('blocks.table.columnLabel')}
                      aria-label={t('blocks.table.columnLabelOf', { index: index + 1 })}
                      disabled={disabled}
                      className={cn(CELL_INPUT, 'font-bold')}
                    />
                  </th>
                );
              })}
              <th
                aria-hidden="true"
                className="border-b border-border/70 bg-foreground/[0.04] p-1 rounded-tr-xl"
              />
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIndex) => (
              <tr key={rowIndex} className="group">
                {cellsOf(row, count).map((value, column) => (
                  <td key={column} className="border-b border-border/50 p-1">
                    <input
                      data-cell={`${rowIndex}:${column}`}
                      value={value}
                      maxLength={CELL_MAX}
                      onChange={e => setCell(rowIndex, column, e.target.value)}
                      onKeyDown={e => onCellKeyDown(e, rowIndex, column)}
                      onPaste={e => onCellPaste(e, rowIndex, column)}
                      aria-label={t('blocks.table.cellOf', {
                        row: rowIndex + 1,
                        column: columns[column]?.label || column + 1,
                      })}
                      disabled={disabled}
                      className={cn(
                        CELL_INPUT,
                        column === 0 && data.firstColumn && 'font-semibold',
                        columns[column]?.align === 'center' && 'text-center',
                        columns[column]?.align === 'right' && 'text-right tabular-nums'
                      )}
                    />
                  </td>
                ))}
                <td className="border-b border-border/50 py-1 pr-1">
                  <div className="flex">
                    <button
                      type="button"
                      onClick={() => moveRow(rowIndex, -1)}
                      disabled={disabled || rowIndex === 0}
                      aria-label={t('blocks.action.up')}
                      className={ICON_BUTTON}
                    >
                      <ArrowUp className="size-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => moveRow(rowIndex, 1)}
                      disabled={disabled || rowIndex === rows.length - 1}
                      aria-label={t('blocks.action.down')}
                      className={ICON_BUTTON}
                    >
                      <ArrowDown className="size-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        onChange({ ...data, rows: rows.filter((_, i) => i !== rowIndex) })
                      }
                      disabled={disabled}
                      aria-label={t('blocks.table.removeRow')}
                      className={cn(ICON_BUTTON, 'hover:bg-destructive/10 hover:text-destructive')}
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => addRow()}
          disabled={disabled || rows.length >= SITE_PAGE_TABLE_ROWS_MAX}
          className={PILL_BUTTON}
        >
          <Rows2 className="size-4" aria-hidden="true" />
          {t('blocks.table.addRow')}
        </button>
        <button
          type="button"
          onClick={addColumn}
          disabled={disabled || count >= SITE_PAGE_TABLE_COLUMNS_MAX}
          className={PILL_BUTTON}
        >
          <Columns2 className="size-4" aria-hidden="true" />
          {t('blocks.table.addColumn')}
        </button>
        <span className="ml-auto text-xs text-muted-foreground tabular-nums">
          {t('blocks.table.size', { columns: count, rows: rows.length })}
        </span>
      </div>
      <p className="mt-2 text-caption text-muted-foreground">{t('blocks.table.pasteHint')}</p>
    </div>
  );
};

/** Replace the whole table with pasted spreadsheet / CSV data. */
const TableImport: React.FC<{
  data: ITableBlockData;
  onChange: (data: ITableBlockData) => void;
  disabled?: boolean;
}> = ({ data, onChange, disabled }) => {
  const { t } = useTranslation('admin');
  const id = useId();
  const [open, setOpen] = useState(false);
  const [raw, setRaw] = useState('');
  const [header, setHeader] = useState(true);
  const parsed = parseDelimited(raw);
  const apply = () => {
    const lines = [...parsed];
    const head = header ? (lines.shift() ?? []) : [];
    const width = Math.min(
      SITE_PAGE_TABLE_COLUMNS_MAX,
      Math.max(1, head.length, ...lines.map(cells => cells.length))
    );
    onChange({
      ...data,
      columns: Array.from({ length: width }, (_, index) => ({
        label: (head[index] ?? '').slice(0, LABEL_MAX),
        align: data.columns[index]?.align ?? 'left',
      })),
      rows: lines.slice(0, SITE_PAGE_TABLE_ROWS_MAX).map(rowOf),
    });
    setRaw('');
    setOpen(false);
  };

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        disabled={disabled}
        className={PILL_BUTTON}
      >
        <ClipboardPaste className="size-4" aria-hidden="true" />
        {t('blocks.table.import')}
      </button>
    );
  }
  const tooWide = parsed.some(cells => cells.length > SITE_PAGE_TABLE_COLUMNS_MAX);
  const tooLong = parsed.length - (header ? 1 : 0) > SITE_PAGE_TABLE_ROWS_MAX;
  return (
    <div className="space-y-3 rounded-xl border border-border/60 bg-background p-3">
      <div className="flex items-center justify-between gap-2">
        <label htmlFor={id} className="text-caption font-bold">
          {t('blocks.table.import')}
        </label>
        <button
          type="button"
          onClick={() => setOpen(false)}
          aria-label={t('pages.form.cancel')}
          className={ICON_BUTTON}
        >
          <X className="size-4" />
        </button>
      </div>
      <Textarea
        id={id}
        value={raw}
        onChange={e => setRaw(e.target.value)}
        rows={5}
        placeholder={t('blocks.table.importPlaceholder')}
        className="resize-y rounded-xl font-mono text-base sm:text-caption"
        autoFocus
      />
      <ToggleField label={t('blocks.table.importHeader')} value={header} onChange={setHeader} />
      {(tooWide || tooLong) && (
        <p className="text-caption text-amber-600 dark:text-amber-400">
          {t('blocks.table.importLimit', {
            columns: SITE_PAGE_TABLE_COLUMNS_MAX,
            rows: SITE_PAGE_TABLE_ROWS_MAX,
          })}
        </p>
      )}
      <button
        type="button"
        onClick={apply}
        disabled={!parsed.length}
        className="inline-flex h-10 w-full items-center justify-center gap-1.5 rounded-full bg-foreground px-4 text-caption font-bold text-background transition-opacity hover:opacity-85 disabled:opacity-40"
      >
        <Plus className="size-4" aria-hidden="true" />
        {t('blocks.table.importApply', {
          count: Math.max(0, parsed.length - (header ? 1 : 0)),
        })}
      </button>
    </div>
  );
};

export const TableEditor: React.FC<{
  data: ITableBlockData;
  onChange: (data: ITableBlockData) => void;
  disabled?: boolean;
}> = ({ data, onChange, disabled }) => {
  const { t } = useTranslation('admin');
  const set =
    <K extends keyof ITableBlockData>(key: K) =>
    (value: ITableBlockData[K]) =>
      onChange({ ...data, [key]: value });
  return (
    <>
      <TextField
        label={t('blocks.field.heading')}
        value={data.title}
        onChange={set('title')}
        max={150}
        disabled={disabled}
      />
      <div>
        <p className="mb-1.5 text-caption font-medium text-foreground">
          {t('blocks.table.content')}
        </p>
        <TableGrid data={data} onChange={onChange} disabled={disabled} />
      </div>
      <TableImport data={data} onChange={onChange} disabled={disabled} />
      <ChoiceField
        label={t('blocks.field.style')}
        value={data.variant}
        options={['striped', 'lines', 'grid'] as const}
        onChange={set('variant')}
        text={value => t(`blocks.table.variant.${value}`)}
        disabled={disabled}
      />
      <ChoiceField
        label={t('blocks.table.mobile')}
        value={data.mobile}
        options={['scroll', 'stack'] as const}
        onChange={set('mobile')}
        text={value => t(`blocks.table.mobileValue.${value}`)}
        disabled={disabled}
      />
      <ToggleField
        label={t('blocks.table.firstColumn')}
        hint={t('blocks.table.firstColumnHint')}
        value={data.firstColumn}
        onChange={set('firstColumn')}
        disabled={disabled}
      />
      <TextField
        label={t('blocks.table.caption')}
        hint={t('blocks.table.captionHint')}
        value={data.caption}
        onChange={set('caption')}
        max={300}
        disabled={disabled}
      />
    </>
  );
};
