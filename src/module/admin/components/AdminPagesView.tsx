import { Input } from '@ui/shad-cn/components/input.tsx';
import { Skeleton } from '@ui/shad-cn/components/skeleton.tsx';
import { FilePlus2, FileText, Plus, Search } from 'lucide-react';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { useAdminPages } from '../hooks';
import type { ISitePage, ISitePageValues } from '../types';
import { AdminPageFormDrawer } from './AdminPageFormDrawer';
import { AdminPageItem } from './AdminPageItem';

type Filter = 'all' | 'published' | 'draft';
const FILTERS: Filter[] = ['all', 'published', 'draft'];

/** Dynamic pages: list (filter + search) → tap → editor drawer; "+" creates a new page. */
export const AdminPagesView: React.FC = () => {
  const { t } = useTranslation('admin');
  const { pages, loading, loaded, saving, error, load, fetchOne, create, update, remove } =
    useAdminPages();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('all');

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [mode, setMode] = useState<'create' | 'edit'>('create');
  const [editing, setEditing] = useState<ISitePage | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  // Only the latest "open" may fill the drawer.
  const request = useRef(0);

  useEffect(() => {
    void load();
  }, [load]);

  const visible = useMemo(() => {
    const term = query.trim().toLowerCase();
    return pages.filter(
      page =>
        (filter === 'all' || page.published === (filter === 'published')) &&
        (!term ||
          page.title.toLowerCase().includes(term) ||
          page.slug.includes(term) ||
          page.summary.toLowerCase().includes(term))
    );
  }, [pages, query, filter]);

  const openCreate = () => {
    request.current += 1;
    setMode('create');
    setEditing(null);
    setLoadError(null);
    setDrawerOpen(true);
  };

  const openEdit = async (item: ISitePage) => {
    const id = ++request.current;
    setMode('edit');
    setEditing(null);
    setLoadError(null);
    setDrawerOpen(true);
    const result = await fetchOne(item.id);
    if (id !== request.current) return;
    if (result.ok && result.page) setEditing(result.page);
    else setLoadError(result.error ?? 'error.load');
  };

  const submit = async (values: ISitePageValues): Promise<string | null> => {
    const result = editing ? await update(editing.id, values) : await create(values);
    if (!result.ok) return result.error ?? 'error.save';
    toast.success(
      editing
        ? t('pages.toast.saved', { title: result.page?.title })
        : t('pages.toast.created', { title: result.page?.title })
    );
    return null;
  };

  const deletePage = async (page: ISitePage) => {
    const result = await remove(page.id);
    if (!result.ok) {
      toast.error(t(result.error ?? 'error.delete'));
      return false;
    }
    toast.success(t('pages.toast.deleted', { title: page.title }));
    return true;
  };

  const counts = useMemo(
    () => ({
      all: pages.length,
      published: pages.filter(page => page.published).length,
      draft: pages.filter(page => !page.published).length,
    }),
    [pages]
  );

  let body: React.ReactNode;
  if (loading && !loaded) {
    body = (
      <div className="space-y-5 px-4 py-4" aria-busy="true">
        {[0, 1, 2, 3].map(i => (
          <div key={i} className="flex gap-3">
            <Skeleton className="size-11 rounded-xl" />
            <div className="flex-1 space-y-2 pt-1">
              <Skeleton className="h-4 w-1/2 rounded-full" />
              <Skeleton className="h-3 w-1/3 rounded-full" />
              <Skeleton className="h-5 w-1/4 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    );
  } else if (error && pages.length === 0) {
    body = (
      <div role="alert" className="px-8 py-16 text-center">
        <p className="text-body text-muted-foreground">{t('error.load')}</p>
        <button
          type="button"
          onClick={() => void load()}
          className="mt-4 h-11 rounded-full bg-foreground px-5 text-sm font-bold text-background"
        >
          {t('retry')}
        </button>
      </div>
    );
  } else if (pages.length === 0) {
    body = (
      <div className="mx-auto flex max-w-sm flex-col items-center px-8 py-16 text-center">
        <span className="grid size-12 place-items-center rounded-full bg-foreground/[0.07]">
          <FilePlus2 className="size-5" aria-hidden="true" />
        </span>
        <h2 className="mt-4 text-title font-bold">{t('pages.emptyTitle')}</h2>
        <p className="mt-1 text-body text-muted-foreground">{t('pages.empty')}</p>
        <button
          type="button"
          onClick={openCreate}
          className="mt-5 inline-flex h-11 items-center gap-2 rounded-full bg-foreground px-5 text-sm font-bold text-background"
        >
          <Plus className="size-4" aria-hidden="true" />
          {t('pages.create')}
        </button>
      </div>
    );
  } else if (visible.length === 0) {
    body = (
      <div className="mx-auto flex max-w-sm flex-col items-center px-8 py-16 text-center">
        <span className="grid size-12 place-items-center rounded-full bg-foreground/[0.07]">
          <FileText className="size-5" aria-hidden="true" />
        </span>
        <p className="mt-4 text-body text-muted-foreground">{t('pages.noResults')}</p>
      </div>
    );
  } else {
    body = (
      <ul className="divide-y divide-border/50" aria-busy={loading}>
        {visible.map(page => (
          <AdminPageItem key={page.id} page={page} onOpen={item => void openEdit(item)} />
        ))}
      </ul>
    );
  }

  return (
    <>
      <div className="sticky top-0 z-10 space-y-2 bg-background/85 px-3 pt-3 pb-2 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <div className="relative min-w-0 flex-1">
            <Search
              className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              type="search"
              value={query}
              onChange={event => setQuery(event.target.value)}
              placeholder={t('pages.searchPlaceholder')}
              aria-label={t('pages.searchPlaceholder')}
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              enterKeyHint="search"
              className="h-11 rounded-full pr-4 pl-10 text-base sm:text-body"
            />
          </div>
          <button
            type="button"
            onClick={openCreate}
            aria-label={t('pages.create')}
            className="inline-flex h-11 shrink-0 items-center justify-center gap-1.5 rounded-full bg-foreground px-4 text-sm font-bold text-background transition-opacity hover:opacity-85"
          >
            <Plus className="size-4" aria-hidden="true" />
            <span className="hidden min-[400px]:inline">{t('pages.new')}</span>
          </button>
        </div>
        {pages.length > 0 && (
          <div
            role="radiogroup"
            aria-label={t('pages.filterLabel')}
            className="flex gap-1.5 overflow-x-auto px-0.5 scrollbar-hide"
          >
            {FILTERS.map(value => (
              <button
                key={value}
                type="button"
                role="radio"
                aria-checked={filter === value}
                onClick={() => setFilter(value)}
                className={
                  filter === value
                    ? 'h-8 shrink-0 rounded-full bg-foreground px-3 text-caption font-bold text-background'
                    : 'h-8 shrink-0 rounded-full border border-border/70 px-3 text-caption font-semibold text-muted-foreground hover:text-foreground'
                }
              >
                {t(`pages.filter.${value}`)}{' '}
                <span className="tabular-nums opacity-70">{counts[value]}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {body}

      <AdminPageFormDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        mode={mode}
        page={editing}
        loadError={loadError}
        saving={saving}
        onSubmit={submit}
        onDelete={deletePage}
      />
    </>
  );
};
