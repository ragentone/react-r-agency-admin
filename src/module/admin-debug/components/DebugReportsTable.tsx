import { cn } from '@ui/lib/utils';
import { Badge } from '@ui/shad-cn/components/badge.tsx';
import { Button } from '@ui/shad-cn/components/button.tsx';
import { Checkbox } from '@ui/shad-cn/components/checkbox.tsx';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from '@ui/shad-cn/components/pagination.tsx';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@ui/shad-cn/components/table.tsx';
import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { StatsError, StatsSkeleton } from '../../admin/stats/components/common';
import { useStatsQuery } from '../../admin/stats/hooks/use.stats.query';
import { AdminDebugApi } from '../api';
import { ADMIN_DEBUG_PAGE_SIZE } from '../const';
import type { DebugSortDir, DebugSortField, IDebugReport } from '../types';
import { DebugReportCard } from './DebugReportCard';
import { DebugReportDrawer } from './DebugReportDrawer';

/** A destructive action waits for a second click (no modal, see design rules). */
type Confirm = 'selected' | 'all' | null;

/**
 * Paginated list of stored client debug reports. Mobile: cards; from `sm`: table.
 * Sorting, detail drawer, test send and delete.
 */
export const DebugReportsTable: React.FC = () => {
  const { t, i18n } = useTranslation('admin-debug');
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState<{ field: DebugSortField; dir: DebugSortDir }>({
    field: 'createdAt',
    dir: 'desc',
  });
  const [selected, setSelected] = useState<Set<string>>(() => new Set());
  const [confirm, setConfirm] = useState<Confirm>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [detail, setDetail] = useState<IDebugReport | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const { data, loading, refreshing, error, reload } = useStatsQuery(
    () => AdminDebugApi.reports(page, ADMIN_DEBUG_PAGE_SIZE, sort.field, sort.dir),
    result => ({ items: result.items ?? [], total: result.total ?? 0 }),
    `debug|${page}|${sort.field}|${sort.dir}`
  );

  // The hook drops its data when the key (page / sort) changes. Keep showing the last result
  // until the new one arrives, otherwise every sort or page change flashes the skeleton.
  const lastRef = useRef<{ items: IDebugReport[]; total: number } | null>(null);
  useEffect(() => {
    if (data) lastRef.current = data;
  }, [data]);
  const view = data ?? lastRef.current;

  if (loading && !view) return <StatsSkeleton tiles={0} variant="list" />;
  if (error && !view) return <StatsError onRetry={() => void reload()} />;
  if (!view) return null;

  const items = view.items;
  const pageIds = items.map(item => item.id);
  const allOnPage = pageIds.length > 0 && pageIds.every(id => selected.has(id));
  const pages = Math.max(1, Math.ceil(view.total / ADMIN_DEBUG_PAGE_SIZE));
  const formatTime = (iso: string) =>
    new Date(iso).toLocaleString(i18n.language, { dateStyle: 'short', timeStyle: 'medium' });

  const changePage = (next: number) => {
    setSelected(new Set());
    setConfirm(null);
    setMessage(null);
    setPage(next);
  };
  const go = (next: number) => (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    if (next >= 1 && next <= pages) changePage(next);
  };
  const toggleSort = (field: DebugSortField) => {
    setSort(prev =>
      prev.field === field
        ? { field, dir: prev.dir === 'asc' ? 'desc' : 'asc' }
        : { field, dir: field === 'createdAt' ? 'desc' : 'asc' }
    );
    changePage(1);
  };
  const sortHeader = (field: DebugSortField, label: string) => {
    const active = sort.field === field;
    const Icon = !active ? ArrowUpDown : sort.dir === 'asc' ? ArrowUp : ArrowDown;
    return (
      <button
        type="button"
        onClick={() => toggleSort(field)}
        className="inline-flex items-center gap-1 font-bold text-foreground"
      >
        {label}
        <Icon className="size-3.5 text-muted-foreground" aria-hidden="true" />
      </button>
    );
  };
  const openDetail = (item: IDebugReport) => {
    setDetail(item);
    setDetailOpen(true);
  };
  const toggleRow = (id: string, on: boolean) =>
    setSelected(prev => {
      const next = new Set(prev);
      if (on) next.add(id);
      else next.delete(id);
      return next;
    });
  const togglePage = (on: boolean) =>
    setSelected(prev => {
      const next = new Set(prev);
      pageIds.forEach(id => (on ? next.add(id) : next.delete(id)));
      return next;
    });

  const sendTest = async () => {
    setBusy(true);
    setMessage(null);
    const result = await AdminDebugApi.sendTest();
    setBusy(false);
    setMessage(result.success ? t('sent', { count: result.accepted ?? 0 }) : t('actionFailed'));
    reload();
  };

  const remove = async (kind: Exclude<Confirm, null>) => {
    const ids = [...selected];
    setBusy(true);
    setMessage(null);
    const result =
      kind === 'all' ? await AdminDebugApi.remove({ all: true }) : await AdminDebugApi.remove({ ids });
    setBusy(false);
    setConfirm(null);
    setSelected(new Set());
    setMessage(result.success ? t('deleted', { count: result.deleted ?? 0 }) : t('actionFailed'));

    // Emptied the last page → step back; otherwise just reload this page.
    if (kind === 'all' && page !== 1) setPage(1);
    else if (kind === 'selected' && page > 1 && pageIds.every(id => ids.includes(id))) setPage(page - 1);
    else reload();
  };

  return (
    <section className="space-y-4 px-4 pt-4 pb-10">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-caption text-muted-foreground">{t('count', { count: view.total })}</p>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => void sendTest()} disabled={busy}>
            {t('sendTest')}
          </Button>
          <Button variant="outline" size="sm" onClick={() => reload()} disabled={refreshing || busy}>
            {t('refresh')}
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button
          size="sm"
          variant={confirm === 'selected' ? 'default' : 'outline'}
          disabled={busy || selected.size === 0}
          onClick={() => (confirm === 'selected' ? void remove('selected') : setConfirm('selected'))}
        >
          {confirm === 'selected'
            ? t('confirmSelected', { count: selected.size })
            : t('deleteSelected', { count: selected.size })}
        </Button>
        <Button
          size="sm"
          variant={confirm === 'all' ? 'default' : 'outline'}
          disabled={busy || view.total === 0}
          onClick={() => (confirm === 'all' ? void remove('all') : setConfirm('all'))}
        >
          {confirm === 'all' ? t('confirmAll') : t('deleteAll')}
        </Button>
        {confirm && (
          <Button size="sm" variant="outline" onClick={() => setConfirm(null)} disabled={busy}>
            {t('cancel')}
          </Button>
        )}
        {message && (
          <p aria-live="polite" className="w-full text-caption text-muted-foreground sm:w-auto">
            {message}
          </p>
        )}
      </div>

      {/* Mobile sort: same two sort fields as the table headers. */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-caption sm:hidden">
        <span className="text-muted-foreground">{t('sortBy')}</span>
        {sortHeader('createdAt', t('time'))}
        {sortHeader('level', t('level'))}
      </div>

      {items.length === 0 ? (
        <p className="py-10 text-center text-body text-muted-foreground">{t('empty')}</p>
      ) : (
        <>
          <ul
            className={cn(
              'space-y-2 transition-opacity sm:hidden',
              (refreshing || loading || busy) && 'opacity-60'
            )}
          >
            {items.map(item => (
              <DebugReportCard
                key={item.id}
                item={item}
                time={formatTime(item.createdAt)}
                selected={selected.has(item.id)}
                selectLabel={t('selectRow')}
                onToggle={on => toggleRow(item.id, on)}
                onOpen={() => openDetail(item)}
              />
            ))}
          </ul>

          <div
            className={cn(
              'hidden overflow-x-auto rounded-2xl border border-border/50 transition-opacity sm:block',
              (refreshing || loading || busy) && 'opacity-60'
            )}
          >
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10">
                    <Checkbox
                      checked={allOnPage}
                      onCheckedChange={value => togglePage(value === true)}
                      aria-label={t('selectAll')}
                    />
                  </TableHead>
                  <TableHead>{sortHeader('createdAt', t('time'))}</TableHead>
                  <TableHead>{sortHeader('level', t('level'))}</TableHead>
                  <TableHead>{t('source')}</TableHead>
                  <TableHead>{t('tag')}</TableHead>
                  <TableHead>{t('message')}</TableHead>
                  <TableHead className="hidden md:table-cell">{t('device')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map(item => (
                  <TableRow
                    key={item.id}
                    data-state={selected.has(item.id) ? 'selected' : undefined}
                    className="cursor-pointer"
                    tabIndex={0}
                    onClick={() => openDetail(item)}
                    onKeyDown={event => {
                      if (event.key === 'Enter') openDetail(item);
                    }}
                  >
                    <TableCell onClick={event => event.stopPropagation()}>
                      <Checkbox
                        checked={selected.has(item.id)}
                        onCheckedChange={value => toggleRow(item.id, value === true)}
                        aria-label={t('selectRow')}
                      />
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-caption text-muted-foreground">
                      {formatTime(item.createdAt)}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={item.level === 'error' ? 'destructive' : 'outline'}
                        className={item.level === 'error' ? 'text-white' : undefined}
                      >
                        {item.level}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-caption whitespace-nowrap text-muted-foreground">
                      {item.source}
                    </TableCell>
                    <TableCell className="font-mono text-caption whitespace-nowrap">
                      {item.tag}
                    </TableCell>
                    <TableCell className="max-w-[260px]">
                      <p className="truncate text-body" title={item.message}>
                        {item.message}
                      </p>
                      {item.error && (
                        <p className="truncate text-caption text-muted-foreground" title={item.error}>
                          {item.error.split('\n')[0]}
                        </p>
                      )}
                    </TableCell>
                    <TableCell className="hidden font-mono text-caption text-muted-foreground md:table-cell">
                      {item.deviceId}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </>
      )}

      <DebugReportDrawer open={detailOpen} onOpenChange={setDetailOpen} report={detail} />

      {pages > 1 && (
        <Pagination>
          <PaginationContent className="flex-wrap justify-center">
            <PaginationItem>
              <PaginationPrevious
                href="#"
                aria-label={t('prev')}
                onClick={go(page - 1)}
                aria-disabled={page <= 1}
                className={cn(page <= 1 && 'pointer-events-none opacity-50')}
              >
                {t('prev')}
              </PaginationPrevious>
            </PaginationItem>
            <PaginationItem>
              <span className="px-3 text-caption text-muted-foreground" aria-live="polite">
                {t('page', { page, pages })}
              </span>
            </PaginationItem>
            <PaginationItem>
              <PaginationNext
                href="#"
                aria-label={t('next')}
                onClick={go(page + 1)}
                aria-disabled={page >= pages}
                className={cn(page >= pages && 'pointer-events-none opacity-50')}
              >
                {t('next')}
              </PaginationNext>
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </section>
  );
};
