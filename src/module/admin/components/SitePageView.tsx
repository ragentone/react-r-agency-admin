import { useAuthStore } from '@core/auth/auth.store.tsx';
import { CoreVariables } from '@core/core.variables.ts';
import { useSeo } from '@core/seo/use.seo.ts';
import { Link, useNavigate, useRouter } from '@tanstack/react-router';
import { cn } from '@ui/lib/utils';
import { Skeleton } from '@ui/shad-cn/components/skeleton.tsx';
import { FileQuestion, Home, Lock, LogIn, Pencil } from 'lucide-react';
import React, { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { SITE_PAGE_COLUMN, SitePageBlocks } from '../blocks';
import { sitePagePath } from '../const';
import { useAdminAccess, useAdminPages, useSitePage } from '../hooks';
import type { ISitePage, ISitePageValues } from '../types';
import { formatDate } from '../utils';
import { AdminPageFormDrawer } from './AdminPageFormDrawer';
import { SitePageStatus } from './AdminPageItem';
import { SitePageHtml } from './SitePageHtml';

/** First absolute image url of the blocks (banner, image …) – social preview of the page. */
const firstBlockImage = (blocks: unknown[]): string | undefined => {
  for (const block of blocks ?? []) {
    const url = (block as { imageUrl?: unknown } | null)?.imageUrl;
    if (typeof url === 'string' && /^https?:\/\//.test(url)) return url;
  }
  return undefined;
};

/**
 * Public view of a dynamic page (`/p/$slug`). Drafts are only delivered to admins.
 * Admins edit the page right here: "Edit" opens the editor drawer on top of the page.
 */
export const SitePageView: React.FC<{ slug: string }> = ({ slug }) => {
  const { t, i18n } = useTranslation('admin');
  const { state, retry, replace } = useSitePage(slug);
  const admin = useAdminAccess();
  const navigate = useNavigate();
  const router = useRouter();
  const { saving, fetchOne, update, remove } = useAdminPages();

  const [editOpen, setEditOpen] = useState(false);
  const [editing, setEditing] = useState<ISitePage | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const request = useRef(0);

  const openEdit = async (page: ISitePage) => {
    const id = ++request.current;
    setEditing(null);
    setLoadError(null);
    setEditOpen(true);
    // Fresh copy – the public one may be older than the last save of another admin.
    const result = await fetchOne(page.id);
    if (id !== request.current) return;
    if (result.ok && result.page) setEditing(result.page);
    else setLoadError(result.error ?? 'error.load');
  };

  const submit = async (values: ISitePageValues): Promise<string | null> => {
    if (!editing) return 'error.save';
    const result = await update(editing.id, values);
    if (!result.ok || !result.page) return result.error ?? 'error.save';
    toast.success(t('pages.toast.saved', { title: result.page.title }));
    replace(result.page);
    // New address → follow it (the old one no longer exists).
    if (result.page.slug !== slug) {
      void navigate({ to: sitePagePath(result.page.slug), replace: true });
    }
    return null;
  };

  const deletePage = async (page: ISitePage) => {
    const result = await remove(page.id);
    if (!result.ok) {
      toast.error(t(result.error ?? 'error.delete'));
      return false;
    }
    toast.success(t('pages.toast.deleted', { title: page.title }));
    void navigate({ to: '/', replace: true });
    return true;
  };

  // Head (title, description, preview image, Article/WebPage data) – runtime shared/seo.
  const ready = state.status === 'ready' ? state.page : null;
  useSeo(
    ready
      ? {
          title: ready.title,
          description: ready.summary || undefined,
          image: firstBlockImage(ready.blocks),
          type: 'article',
          publishedAt: ready.publishedAt,
          modifiedAt: ready.updatedAt,
          noindex:
            !ready.published || ready.visibility === 'authenticated' || ready.seoIndex === false,
        }
      : null
  );

  if (state.status === 'loading') {
    return (
      <div className={cn(SITE_PAGE_COLUMN, 'space-y-4 py-6')} aria-busy="true">
        <Skeleton className="h-8 w-3/4 rounded-full" />
        <Skeleton className="h-4 w-1/2 rounded-full" />
        <div className="space-y-2.5 pt-4">
          {[0, 1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="h-4 w-full rounded-full" />
          ))}
          <Skeleton className="h-4 w-2/3 rounded-full" />
        </div>
      </div>
    );
  }

  if (state.status === 'login' || state.status === 'forbidden') {
    const login = state.status === 'login';
    return (
      <div className="mx-auto flex max-w-sm flex-col items-center px-8 py-20 text-center">
        <span className="grid size-14 place-items-center rounded-full bg-foreground/[0.07]">
          <Lock className="size-6" aria-hidden="true" />
        </span>
        <h1 className="mt-4 text-title font-bold">
          {login ? t('sitePage.loginTitle') : t('sitePage.forbiddenTitle')}
        </h1>
        <p className="mt-1 text-body text-muted-foreground">
          {login ? t('sitePage.login') : t('sitePage.forbidden')}
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          {login && (
            <button
              type="button"
              onClick={() => {
                // Back to this page after the login.
                useAuthStore.getState().setAfterLoginRoute(router.state.location);
                void navigate({ to: CoreVariables.routePathAuth });
              }}
              className="inline-flex h-10 items-center gap-1.5 rounded-full bg-foreground px-4 text-sm font-bold text-background"
            >
              <LogIn className="size-4" aria-hidden="true" />
              {t('sitePage.loginAction')}
            </button>
          )}
          <Link
            to="/"
            className="inline-flex h-10 items-center gap-1.5 rounded-full border border-border/60 px-4 text-sm font-bold transition-colors hover:bg-foreground/[0.06]"
          >
            <Home className="size-4" aria-hidden="true" />
            {t('sitePage.home')}
          </Link>
        </div>
      </div>
    );
  }

  if (state.status !== 'ready') {
    const missing = state.status === 'missing';
    return (
      <div className="mx-auto flex max-w-sm flex-col items-center px-8 py-20 text-center">
        <span className="grid size-14 place-items-center rounded-full bg-foreground/[0.07]">
          <FileQuestion className="size-6" aria-hidden="true" />
        </span>
        <h1 className="mt-4 text-title font-bold">
          {missing ? t('sitePage.missingTitle') : t('error.load')}
        </h1>
        {missing && <p className="mt-1 text-body text-muted-foreground">{t('sitePage.missing')}</p>}
        <div className="mt-6 flex gap-2">
          {!missing && (
            <button
              type="button"
              onClick={retry}
              className="h-10 rounded-full bg-foreground px-4 text-sm font-bold text-background"
            >
              {t('retry')}
            </button>
          )}
          <Link
            to="/"
            className="inline-flex h-10 items-center gap-1.5 rounded-full border border-border/60 px-4 text-sm font-bold transition-colors hover:bg-foreground/[0.06]"
          >
            <Home className="size-4" aria-hidden="true" />
            {t('sitePage.home')}
          </Link>
        </div>
      </div>
    );
  }

  const { page } = state;
  const blocks = page.blocks ?? [];
  const firstBlock = blocks[0];
  // A banner at the top replaces the default title header (its title becomes the h1).
  const heroFirst = firstBlock?.type === 'hero';
  const heroTitle = heroFirst && 'title' in firstBlock.data && Boolean(firstBlock.data.title);
  const updated = t('sitePage.updated', { date: formatDate(page.updatedAt, i18n.language) });
  return (
    <article className="pb-[max(3rem,env(safe-area-inset-bottom))]">
      {admin && (
        <div className={cn(SITE_PAGE_COLUMN, 'py-3')}>
          <div className="flex items-center gap-2 rounded-xl border border-border/60 px-3 py-2">
            <SitePageStatus published={page.published} />
            {page.visibility === 'authenticated' && (
              <Lock
                className="size-3.5 shrink-0 text-muted-foreground"
                aria-label={t('pages.access.authenticated')}
              />
            )}
            <span className="min-w-0 flex-1 truncate text-caption text-muted-foreground">
              {page.published ? t('sitePage.adminHint') : t('sitePage.draftHint')}
            </span>
            <button
              type="button"
              onClick={() => void openEdit(page)}
              className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full border border-border/70 px-3 text-caption font-bold hover:bg-foreground/[0.06]"
            >
              <Pencil className="size-3.5" aria-hidden="true" />
              {t('sitePage.edit')}
            </button>
          </div>
        </div>
      )}
      {!heroFirst && (
        <header className={cn(SITE_PAGE_COLUMN, 'pt-6 pb-8')}>
          <h1 className="text-2xl font-bold tracking-tight break-words text-foreground sm:text-3xl">
            {page.title}
          </h1>
          {page.summary && (
            <p className="mt-2 text-body text-muted-foreground sm:text-base">{page.summary}</p>
          )}
        </header>
      )}
      {heroFirst && !heroTitle && <h1 className="sr-only">{page.title}</h1>}
      {blocks.length > 0 ? (
        <SitePageBlocks blocks={blocks} />
      ) : (
        <SitePageHtml html={page.content} className={SITE_PAGE_COLUMN} />
      )}
      <div className={SITE_PAGE_COLUMN}>
        <p className="mt-12 border-t border-border/50 pt-4 text-caption text-muted-foreground tabular-nums">
          {updated}
        </p>
      </div>

      {admin && (
        <AdminPageFormDrawer
          open={editOpen}
          onOpenChange={setEditOpen}
          mode="edit"
          page={editing}
          loadError={loadError}
          saving={saving}
          onSubmit={submit}
          onDelete={deletePage}
          showViewLink={false}
        />
      )}
    </article>
  );
};
