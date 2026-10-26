import { Link } from '@tanstack/react-router';
import { cn } from '@ui/lib/utils';
import { Input } from '@ui/shad-cn/components/input.tsx';
import { Skeleton } from '@ui/shad-cn/components/skeleton.tsx';
import { FolderOpen, Lock, LogIn, Plus, Search } from 'lucide-react';
import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { FILE_SHARE_MAX_FILE_SIZE, FILE_SHARE_SEARCH_MIN } from '../const';
import { useFileShare, useFileShareAdmin, useFileShareAuthorized } from '../hooks';
import type { FileShareVisibility, IFileShareItem, IFileShareWriteResult } from '../types';
import { formatBytes } from '../utils';
import { FileShareFormDrawer } from './FileShareFormDrawer';
import { FileShareItem } from './FileShareItem';

type Filter = 'all' | FileShareVisibility;
const FILTERS: Filter[] = ['all', 'public', 'authenticated', 'private'];

/** `/files`: list + download for everyone (by visibility), upload / edit / delete for admins. */
export const FileShareView: React.FC = () => {
  const { t, i18n } = useTranslation('file-share');
  const authorized = useFileShareAuthorized();
  const admin = useFileShareAdmin();
  const {
    files,
    restricted,
    loading,
    loaded,
    saving,
    error,
    load,
    create,
    update,
    remove,
    createLink,
    revokeLink,
  } = useFileShare();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('all');
  // Opened file by id → the drawer always gets the current version (e.g. a new share link).
  // The snapshot keeps the drawer content while it closes after a delete.
  const [opened, setOpened] = useState<IFileShareItem | null>(null);
  const editing = useMemo(
    () => (opened ? (files.find(file => file.id === opened.id) ?? opened) : null),
    [files, opened]
  );
  const [formOpen, setFormOpen] = useState(false);

  // Reload on login / logout – the visible files depend on it.
  useEffect(() => {
    void load();
  }, [authorized, load]);

  const counts = useMemo(
    () => ({
      all: files.length,
      public: files.filter(file => file.visibility === 'public').length,
      authenticated: files.filter(file => file.visibility === 'authenticated').length,
      private: files.filter(file => file.visibility === 'private').length,
    }),
    [files]
  );

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return files.filter(
      file =>
        (!admin || filter === 'all' || file.visibility === filter) &&
        (!needle ||
          [file.title, file.description, file.fileName].some(text =>
            text.toLowerCase().includes(needle)
          ))
    );
  }, [files, query, filter, admin]);

  const openForm = (file: IFileShareItem | null) => {
    setOpened(file);
    setFormOpen(true);
  };

  const notify = (result: IFileShareWriteResult, success: string) => {
    if (result.ok) toast.success(t(success));
    else
      toast.error(
        t(result.error ?? 'error.save', {
          max: formatBytes(FILE_SHARE_MAX_FILE_SIZE, i18n.language),
        })
      );
    return result;
  };

  const showSearch = files.length >= FILE_SHARE_SEARCH_MIN;

  let body: React.ReactNode;
  if (loading && !loaded) {
    body = (
      <div className="space-y-5 px-4 py-4" aria-busy="true">
        {[0, 1, 2, 3].map(i => (
          <div key={i} className="flex gap-3">
            <Skeleton className="size-12 rounded-xl" />
            <div className="flex-1 space-y-2 pt-1">
              <Skeleton className="h-4 w-3/4 rounded-full" />
              <Skeleton className="h-3 w-1/2 rounded-full" />
            </div>
            <Skeleton className="size-11 rounded-full" />
          </div>
        ))}
      </div>
    );
  } else if (error && files.length === 0) {
    body = (
      <div role="alert" className="px-8 py-16 text-center">
        <p className="text-body text-muted-foreground">{t('error.load')}</p>
        <button
          type="button"
          onClick={() => void load()}
          className="mt-4 h-10 rounded-full bg-foreground px-4 text-sm font-bold text-background"
        >
          {t('retry')}
        </button>
      </div>
    );
  } else if (files.length === 0) {
    body = (
      <div className="mx-auto flex max-w-sm flex-col items-center px-8 py-16 text-center">
        <span className="grid size-12 place-items-center rounded-full bg-foreground/[0.07]">
          <FolderOpen className="size-5" aria-hidden="true" />
        </span>
        <h2 className="mt-4 text-title font-bold">{t('empty.title')}</h2>
        <p className="mt-1 text-body text-muted-foreground">
          {admin ? t('empty.admin') : t('empty.description')}
        </p>
        {admin && (
          <button
            type="button"
            onClick={() => openForm(null)}
            className="mt-5 inline-flex h-11 items-center gap-1.5 rounded-full bg-foreground px-5 text-sm font-bold text-background transition-opacity hover:opacity-85"
          >
            <Plus className="size-4" aria-hidden="true" />
            {t('upload')}
          </button>
        )}
      </div>
    );
  } else if (visible.length === 0) {
    body = (
      <div className="px-8 py-16 text-center">
        <p className="text-body text-muted-foreground">{t('search.empty')}</p>
      </div>
    );
  } else {
    body = (
      <ul className="divide-y divide-border/50">
        {visible.map(file => (
          <FileShareItem key={file.id} file={file} manage={admin} onEdit={openForm} />
        ))}
      </ul>
    );
  }

  return (
    <div data-slot="file-share" className="mx-auto flex min-h-dvh w-full flex-col bg-background">
      <header className="sticky top-0 z-20 border-b border-border/50 bg-background/85 backdrop-blur-md">
        <div className="flex items-center gap-3 px-4 pt-3 pb-2">
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-xl font-bold tracking-tight text-foreground">
              {t('title')}
            </h1>
            {loaded && files.length > 0 && (
              <p className="text-caption text-muted-foreground tabular-nums">
                {t('count', { count: files.length })}
              </p>
            )}
          </div>
          {admin && (
            <button
              type="button"
              onClick={() => openForm(null)}
              className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-full bg-foreground px-4 text-sm font-bold text-background transition-opacity hover:opacity-85"
            >
              <Plus className="size-4" aria-hidden="true" />
              {t('upload')}
            </button>
          )}
        </div>

        {(showSearch || (admin && files.length > 0)) && (
          <div className="space-y-2 px-3 pb-2">
            {showSearch && (
              <div className="relative">
                <Search
                  className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground"
                  aria-hidden="true"
                />
                <Input
                  type="search"
                  value={query}
                  onChange={event => setQuery(event.target.value)}
                  placeholder={t('search.placeholder')}
                  aria-label={t('search.placeholder')}
                  className="h-10 rounded-full pl-10 text-base sm:text-body"
                />
              </div>
            )}
            {admin && (
              <div
                role="tablist"
                aria-label={t('filter.label')}
                className="flex items-center gap-1 overflow-x-auto [scrollbar-width:none]"
              >
                {FILTERS.map(f => (
                  <button
                    key={f}
                    type="button"
                    role="tab"
                    aria-selected={filter === f}
                    onClick={() => setFilter(f)}
                    className={cn(
                      'inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full px-3 text-sm font-semibold transition-colors',
                      filter === f
                        ? 'bg-foreground text-background'
                        : 'bg-foreground/[0.06] text-muted-foreground hover:text-foreground'
                    )}
                  >
                    {t(`filter.${f}`)}
                    <span className="tabular-nums opacity-70">{counts[f]}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </header>

      <div className="flex-1 pb-[max(2rem,env(safe-area-inset-bottom))]">
        {body}

        {/* Guests: hint that more files exist for signed-in users. */}
        {!authorized && loaded && restricted > 0 && (
          <div className="mx-4 my-4 flex items-center gap-3 rounded-2xl border border-border/60 p-4">
            <span className="grid size-10 shrink-0 place-items-center rounded-full bg-foreground/[0.07]">
              <Lock className="size-4" aria-hidden="true" />
            </span>
            <p className="min-w-0 flex-1 text-caption text-muted-foreground">
              {t('restricted', { count: restricted })}
            </p>
            <Link
              to="/login"
              className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full bg-foreground px-3.5 text-sm font-bold text-background transition-opacity hover:opacity-85"
            >
              <LogIn className="size-4" aria-hidden="true" />
              {t('login')}
            </Link>
          </div>
        )}
      </div>

      {admin && (
        <FileShareFormDrawer
          open={formOpen}
          onOpenChange={setFormOpen}
          item={editing}
          saving={saving}
          onSubmit={async (values, file) =>
            editing
              ? notify(await update(editing.id, values, file), 'saved')
              : file
                ? notify(await create(values, file), 'uploaded')
                : { ok: false }
          }
          onDelete={async id => notify(await remove(id), 'deleted')}
          onCreateLink={createLink}
          onRevokeLink={revokeLink}
        />
      )}
    </div>
  );
};
