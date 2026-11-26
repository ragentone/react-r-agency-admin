import { Link, useNavigate } from '@tanstack/react-router';
import { AppFormDrawer } from '@ui/patterns';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@ui/shad-cn/components/alert-dialog.tsx';
import { Button } from '@ui/shad-cn/components/button.tsx';
import { Skeleton } from '@ui/shad-cn/components/skeleton.tsx';
import { Tabs, TabsContent } from '@ui/shad-cn/components/tabs.tsx';
import { Eye, Trash2 } from 'lucide-react';
import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { AdminBlocksEditor, blocksFromPage, SITE_PAGE_BLOCKS_MAX } from '../blocks';
import { PageImageSessionProvider, usePageImageSession } from '../blocks/image.session';
import {
  SITE_PAGE_MENU_ORDER_MAX,
  SITE_PAGE_MENU_ORDER_MIN,
  SITE_PAGE_SLUG_MAX,
  SITE_PAGE_SLUG_PATTERN,
  SITE_PAGE_SUMMARY_MAX,
  SITE_PAGE_TITLE_MAX,
  sitePagePath,
} from '../const';
import type { ISitePage, ISitePageValues } from '../types';
import { AdminTabsBar } from '../ui/AdminTabsBar';
import { cleanSlugInput, slugify } from '../utils';
import { PageConfigFields } from './PageConfigFields';

const EMPTY: ISitePageValues = {
  title: '',
  slug: '',
  summary: '',
  content: '',
  blocks: [],
  published: false,
  showInMenu: true,
  seoIndex: true,
  menuOrder: 0,
  visibility: 'all',
  displayMode: 'route',
  roles: [],
};

export interface IAdminPageFormDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** `create` = new page, `edit` = `page` (null while it is loading). */
  mode: 'create' | 'edit';
  page: ISitePage | null;
  /** Loading the page failed – translation key. */
  loadError?: string | null;
  saving: boolean;
  /** Returns an error translation key, or null on success. */
  onSubmit: (values: ISitePageValues) => Promise<string | null>;
  onDelete: (page: ISitePage) => Promise<boolean>;
  /** Show the "view page" link (off when the drawer is opened on the page itself). */
  showViewLink?: boolean;
}

/** Create / edit a dynamic page (bottom drawer, full height) incl. delete with confirm. */
export const AdminPageFormDrawer: React.FC<IAdminPageFormDrawerProps> = ({
  open,
  onOpenChange,
  mode,
  page,
  loadError,
  saving,
  onSubmit,
  onDelete,
  showViewLink = true,
}) => {
  const { t } = useTranslation('admin');
  const [values, setValues] = useState<ISitePageValues>(EMPTY);
  /** Values when the drawer opened – unsaved changes = difference to these. */
  const [initial, setInitial] = useState<ISitePageValues>(EMPTY);
  /** Close request while there are unsaved changes → "discard?" dialog (+ what to do after). */
  const [confirmDiscard, setConfirmDiscard] = useState<{ then?: () => void } | null>(null);
  const navigate = useNavigate();
  const [touched, setTouched] = useState(false);
  const [tab, setTab] = useState('config');
  /** New page: the slug follows the title until it is edited by hand. */
  const [slugManual, setSlugManual] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  /** Uploads of this editing session – unsaved ones are deleted again on the server. */
  const images = usePageImageSession();

  // Fresh values whenever the drawer opens or the loaded page changes – adjusted during render.
  const [source, setSource] = useState<{ open: boolean; page: ISitePage | null; mode: string }>({
    open: false,
    page: null,
    mode,
  });
  if (open && (!source.open || source.page !== page || source.mode !== mode)) {
    setSource({ open, page, mode });
    const fresh: ISitePageValues = page
      ? {
          title: page.title,
          slug: page.slug,
          summary: page.summary,
          content: '',
          // Older pages: the HTML content becomes the first text block.
          blocks: blocksFromPage(page),
          published: page.published,
          showInMenu: page.showInMenu ?? true,
          seoIndex: page.seoIndex ?? true,
          menuOrder: page.menuOrder ?? 0,
          visibility: page.visibility ?? 'all',
          displayMode: page.displayMode ?? 'route',
          roles: page.roles ?? [],
        }
      : EMPTY;
    setValues(fresh);
    setInitial(fresh);
    setConfirmDiscard(null);
    setSlugManual(Boolean(page));
    setTouched(false);
    setServerError(null);
  } else if (!open && source.open) {
    setSource({ open: false, page: null, mode });
  }

  const loadingPage = mode === 'edit' && !page;
  const ready = !loadingPage;

  const title = values.title.trim();
  const titleError = !title
    ? t('pages.form.titleRequired')
    : title.length > SITE_PAGE_TITLE_MAX
      ? t('pages.form.tooLong', { max: SITE_PAGE_TITLE_MAX })
      : null;
  const slug = values.slug.replace(/-+$/g, '');
  const slugError = !slug
    ? t('pages.form.slugRequired')
    : !SITE_PAGE_SLUG_PATTERN.test(slug)
      ? t('error.slugInvalid')
      : null;
  const summaryError =
    values.summary.trim().length > SITE_PAGE_SUMMARY_MAX
      ? t('pages.form.tooLong', { max: SITE_PAGE_SUMMARY_MAX })
      : null;
  const contentError =
    values.blocks.length > SITE_PAGE_BLOCKS_MAX
      ? t('blocks.full', { max: SITE_PAGE_BLOCKS_MAX })
      : null;
  const menuOrderError =
    !Number.isInteger(values.menuOrder) ||
    values.menuOrder < SITE_PAGE_MENU_ORDER_MIN ||
    values.menuOrder > SITE_PAGE_MENU_ORDER_MAX
      ? t('error.menuOrderInvalid')
      : null;
  const invalid = Boolean(
    titleError || slugError || summaryError || contentError || menuOrderError
  );

  const set = <K extends keyof ISitePageValues>(key: K, value: ISitePageValues[K]) => {
    setValues(prev => ({ ...prev, [key]: value }));
    setTouched(true);
    setServerError(null);
  };

  const setTitle = (next: string) => {
    setValues(prev => ({
      ...prev,
      title: next,
      slug: slugManual ? prev.slug : slugify(next, SITE_PAGE_SLUG_MAX),
    }));
    setTouched(true);
    setServerError(null);
  };

  const setSlug = (next: string) => {
    setSlugManual(true);
    set('slug', cleanSlugInput(next, SITE_PAGE_SLUG_MAX));
  };

  /** Unsaved changes (anything that differs from the opened state). */
  const dirty = useMemo(
    () => ready && !loadError && JSON.stringify(values) !== JSON.stringify(initial),
    [values, initial, ready, loadError]
  );

  // Reload / tab close with unsaved changes → the browser asks first.
  useEffect(() => {
    if (!open || !dirty) return;
    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      // Older browsers need a return value to show the prompt.
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [open, dirty]);

  /** Returns true when saved (drawer closed). */
  const save = async (): Promise<boolean> => {
    setTouched(true);
    if (invalid || saving || !ready) return false;
    const error = await onSubmit({
      title,
      slug,
      summary: values.summary.trim(),
      // Blocks replace the old HTML content.
      content: '',
      blocks: values.blocks,
      published: values.published,
      showInMenu: values.showInMenu,
      seoIndex: values.seoIndex,
      menuOrder: values.menuOrder,
      visibility: values.visibility,
      displayMode: values.displayMode,
      roles: values.visibility === 'authenticated' ? values.roles : [],
    });
    if (error) {
      setServerError(error);
      return false;
    }
    // Saved: uploads the saved blocks don't use (replaced / removed) go.
    images.commit(values.blocks);
    onOpenChange(false);
    return true;
  };

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    void save();
  };

  /** Closes for real: every upload of this session goes, then `then` (e.g. navigate). */
  const discardAndClose = (then?: () => void) => {
    setConfirmDiscard(null);
    images.cancel();
    onOpenChange(false);
    then?.();
  };

  /**
   * Every way out (X, swipe, Escape, back button, "view page"): with unsaved changes the
   * drawer stays open and asks first – save, discard or keep editing.
   */
  const requestClose = (then?: () => void) => {
    if (saving) return;
    if (dirty) setConfirmDiscard({ then });
    else discardAndClose(then);
  };

  const close = (next: boolean) => {
    if (next) onOpenChange(true);
    else requestClose();
  };

  return (
    <AppFormDrawer
      open={open}
      onOpenChange={close}
      title={mode === 'edit' ? t('pages.form.editTitle') : t('pages.form.createTitle')}
      description={t('pages.form.description')}
      closeLabel={t('pages.form.cancel')}
      submitLabel={mode === 'edit' ? t('pages.form.save') : t('pages.form.create')}
      submitDisabled={!ready || (touched && invalid)}
      busy={saving}
      submitPlacement="header"
      onSubmit={submit}
      bodyClassName="px-0 pt-0"
      contentProps={{ className: 'max-w-180' }}
    >
      {loadError ? (
        <div role="alert" className="px-8 py-16 text-center">
          <p className="text-body text-muted-foreground">{t(loadError)}</p>
        </div>
      ) : loadingPage ? (
        <div className="space-y-5 px-4 py-5 sm:px-6" aria-busy="true">
          <Skeleton className="h-12 w-full rounded-xl" />
          <Skeleton className="h-12 w-full rounded-xl" />
          <Skeleton className="h-20 w-full rounded-xl" />
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
      ) : (
        <Tabs value={tab} onValueChange={setTab} className="px-4 py-5 sm:px-6">
          <AdminTabsBar
            label={t('pages.form.tabs.label')}
            tabs={[
              { value: 'config', label: t('pages.form.tabs.config') },
              { value: 'blocks', label: t('pages.form.tabs.blocks'), count: values.blocks.length },
            ]}
          />
          {serverError && (
            <p
              role="alert"
              className="mt-5 rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-caption text-destructive"
            >
              {t(serverError)}
            </p>
          )}

          <TabsContent value="config" className="mt-5 space-y-5">
            <PageConfigFields
              mode={mode}
              page={page}
              values={values}
              slug={slug}
              saving={saving}
              touched={touched}
              titleError={titleError}
              slugError={slugError}
              summaryError={summaryError}
              menuOrderError={menuOrderError}
              set={set}
              setTitle={setTitle}
              setSlug={setSlug}
              patch={patch => {
                setValues(prev => ({ ...prev, ...patch }));
                setTouched(true);
                setServerError(null);
              }}
            />

            {page && (
              <div className={showViewLink ? 'grid grid-cols-1 gap-3 pt-1 sm:grid-cols-2' : 'pt-1'}>
                {showViewLink && (
                  <Link
                    to={sitePagePath(page.slug)}
                    onClick={event => {
                      // Unsaved changes → ask first, navigate after discarding.
                      event.preventDefault();
                      const to = sitePagePath(page.slug);
                      requestClose(() => void navigate({ to }));
                    }}
                    className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-full border border-border/50 text-body font-bold transition-colors hover:bg-foreground/[0.04]"
                  >
                    <Eye className="size-4" aria-hidden="true" />
                    {page.published ? t('pages.view') : t('pages.preview')}
                  </Link>
                )}
                <Button
                  type="button"
                  onClick={() => setConfirmDelete(true)}
                  disabled={saving}
                  variant="destructive-outline"
                  size="lg"
                  fullWidth
                >
                  <Trash2 className="size-4" aria-hidden="true" />
                  {t('pages.delete.action')}
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="blocks" className="mt-5">
            <PageImageSessionProvider session={images}>
              <AdminBlocksEditor
                value={values.blocks}
                onChange={blocks => {
                  set('blocks', blocks);
                  images.sync(blocks);
                }}
                disabled={saving}
              />
            </PageImageSessionProvider>
          </TabsContent>
        </Tabs>
      )}

      <AlertDialog
        open={confirmDiscard !== null}
        onOpenChange={next => !saving && !next && setConfirmDiscard(null)}
      >
        <AlertDialogContent className="w-[calc(100%-2rem)] max-w-[340px] gap-6 rounded-2xl p-8">
          <AlertDialogHeader className="space-y-2 text-left">
            <AlertDialogTitle className="text-title font-bold">
              {t('pages.discard.title')}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-body leading-5">
              {t('pages.discard.description')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col gap-3 sm:flex-col sm:space-x-0">
            {!invalid && (
              <Button
                type="button"
                disabled={saving}
                isLoading={saving}
                onClick={async () => {
                  const then = confirmDiscard?.then;
                  const saved = await save();
                  setConfirmDiscard(null);
                  if (saved) then?.();
                }}
                size="lg"
                fullWidth
              >
                {mode === 'edit' ? t('pages.discard.save') : t('pages.discard.create')}
              </Button>
            )}
            <Button
              type="button"
              disabled={saving}
              onClick={() => discardAndClose(confirmDiscard?.then)}
              variant="destructive-outline"
              size="lg"
              fullWidth
            >
              {t('pages.discard.confirm')}
            </Button>
            <AlertDialogCancel disabled={saving} className="mt-0 h-11 w-full text-body sm:mt-0">
              {t('pages.discard.keep')}
            </AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {page && (
        <AlertDialog open={confirmDelete} onOpenChange={next => !saving && setConfirmDelete(next)}>
          <AlertDialogContent className="w-[calc(100%-2rem)] max-w-[340px] gap-6 rounded-2xl p-8">
            <AlertDialogHeader className="space-y-2 text-left">
              <AlertDialogTitle className="text-title font-bold">
                {t('pages.delete.title')}
              </AlertDialogTitle>
              <AlertDialogDescription className="text-body leading-5">
                {t('pages.delete.description', { title: page.title })}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="flex-col gap-3 sm:flex-col sm:space-x-0">
              <Button
                type="button"
                disabled={saving}
                onClick={async () => {
                  const ok = await onDelete(page);
                  if (ok) {
                    setConfirmDelete(false);
                    images.cancel();
                    onOpenChange(false);
                  }
                }}
                variant="destructive"
                size="lg"
                fullWidth
                isLoading={saving}
              >
                {t('pages.delete.confirm')}
              </Button>
              <AlertDialogCancel disabled={saving} className="mt-0 h-11 w-full text-body sm:mt-0">
                {t('pages.form.cancel')}
              </AlertDialogCancel>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </AppFormDrawer>
  );
};
