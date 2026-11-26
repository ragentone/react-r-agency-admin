import { Input } from '@ui/shad-cn/components/input.tsx';
import { Switch } from '@ui/shad-cn/components/switch.tsx';
import { Textarea } from '@ui/shad-cn/components/textarea.tsx';
import React from 'react';
import { useTranslation } from 'react-i18next';

import {
  SITE_PAGE_MENU_ORDER_MAX,
  SITE_PAGE_MENU_ORDER_MIN,
  SITE_PAGE_SUMMARY_MAX,
  SITE_PAGE_TITLE_MAX,
} from '../const';
import type { ISitePage, ISitePageValues } from '../types';
import { PageAccessField } from './PageAccessField';
import { PageDisplayModeField } from './PageDisplayModeField';

const FIELD_LABEL = 'text-caption font-medium text-foreground';

export interface IPageConfigFieldsProps {
  mode: 'create' | 'edit';
  page: ISitePage | null;
  values: ISitePageValues;
  slug: string;
  saving: boolean;
  touched: boolean;
  titleError: string | null;
  slugError: string | null;
  summaryError: string | null;
  menuOrderError: string | null;
  set: <K extends keyof ISitePageValues>(key: K, value: ISitePageValues[K]) => void;
  setTitle: (title: string) => void;
  setSlug: (slug: string) => void;
  /** Access / display mode: patch several values and mark the form as changed. */
  patch: (patch: Partial<ISitePageValues>) => void;
}

/** "Config" tab of the page editor: title, address, summary, access, display, menu. */
export const PageConfigFields: React.FC<IPageConfigFieldsProps> = ({
  mode,
  page,
  values,
  slug,
  saving,
  touched,
  titleError,
  slugError,
  summaryError,
  menuOrderError,
  set,
  setTitle,
  setSlug,
  patch,
}) => {
  const { t } = useTranslation('admin');
  return (
    <>
      <div>
        <div className="mb-1.5 flex items-center justify-between">
          <label htmlFor="admin-page-title" className={FIELD_LABEL}>
            {t('pages.form.title')}
          </label>
          <span className="text-caption text-muted-foreground tabular-nums">
            {values.title.length} / {SITE_PAGE_TITLE_MAX}
          </span>
        </div>
        <Input
          id="admin-page-title"
          value={values.title}
          onChange={e => setTitle(e.target.value)}
          placeholder={t('pages.form.titlePlaceholder')}
          disabled={saving}
          aria-invalid={Boolean(touched && titleError)}
          className="h-12 rounded-xl text-base font-semibold sm:text-body"
        />
        {touched && titleError && (
          <p role="alert" className="mt-1.5 text-caption text-destructive">
            {titleError}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="admin-page-slug" className={`mb-1.5 block ${FIELD_LABEL}`}>
          {t('pages.form.slug')}
        </label>
        <div className="flex h-12 items-center overflow-hidden rounded-xl border border-input focus-within:ring-1 focus-within:ring-ring">
          <span className="shrink-0 pl-3 text-base text-muted-foreground select-none sm:text-body">
            /site/
          </span>
          <input
            id="admin-page-slug"
            value={values.slug}
            onChange={e => setSlug(e.target.value)}
            onBlur={() => set('slug', values.slug.replace(/-+$/g, ''))}
            placeholder={t('pages.form.slugPlaceholder')}
            disabled={saving}
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            inputMode="url"
            aria-invalid={Boolean(touched && slugError)}
            aria-describedby="admin-page-slug-hint"
            className="h-full min-w-0 flex-1 bg-transparent pr-3 text-base outline-none disabled:opacity-50 sm:text-body"
          />
        </div>
        {touched && slugError ? (
          <p role="alert" className="mt-1.5 text-caption text-destructive">
            {slugError}
          </p>
        ) : (
          <p id="admin-page-slug-hint" className="mt-1.5 text-caption text-muted-foreground">
            {mode === 'edit' && page && slug !== page.slug
              ? t('pages.form.slugChanged')
              : t('pages.form.slugHint')}
          </p>
        )}
      </div>

      <div>
        <div className="mb-1.5 flex items-center justify-between">
          <label htmlFor="admin-page-summary" className={FIELD_LABEL}>
            {t('pages.form.summary')}
          </label>
          <span className="text-caption text-muted-foreground tabular-nums">
            {values.summary.length} / {SITE_PAGE_SUMMARY_MAX}
          </span>
        </div>
        <Textarea
          id="admin-page-summary"
          value={values.summary}
          onChange={e => set('summary', e.target.value)}
          placeholder={t('pages.form.summaryPlaceholder')}
          disabled={saving}
          rows={2}
          aria-invalid={Boolean(summaryError)}
          className="min-h-20 resize-none rounded-xl text-base sm:text-body"
        />
        {summaryError && (
          <p role="alert" className="mt-1.5 text-caption text-destructive">
            {summaryError}
          </p>
        )}
      </div>

      <PageAccessField
        visibility={values.visibility}
        roles={values.roles}
        onChange={(visibility, roles) => patch({ visibility, roles })}
        disabled={saving}
      />

      <PageDisplayModeField
        value={values.displayMode}
        onChange={displayMode => patch({ displayMode })}
        disabled={saving}
      />

      <label
        htmlFor="admin-page-published"
        className="flex cursor-pointer items-center gap-4 rounded-xl border border-border/50 px-3 py-3"
      >
        <span className="min-w-0 flex-1">
          <span className="block text-body font-semibold text-foreground">
            {t('pages.form.published')}
          </span>
          <span className="mt-0.5 block text-caption text-muted-foreground">
            {t('pages.form.publishedHint')}
          </span>
        </span>
        <Switch
          id="admin-page-published"
          checked={values.published}
          onCheckedChange={checked => set('published', checked)}
          disabled={saving}
        />
      </label>

      <label
        htmlFor="admin-page-seo-index"
        className="flex cursor-pointer items-center gap-4 rounded-xl border border-border/50 px-3 py-3 has-[:disabled]:cursor-not-allowed"
      >
        <span className="min-w-0 flex-1">
          <span className="block text-body font-semibold text-foreground">
            {t('pages.form.seoIndex')}
          </span>
          <span className="mt-0.5 block text-caption text-muted-foreground">
            {values.visibility === 'authenticated'
              ? t('pages.form.seoIndexPrivate')
              : values.seoIndex
                ? values.published
                  ? t('pages.form.seoIndexHint')
                  : t('pages.form.seoIndexDraftHint')
                : t('pages.form.seoIndexOffHint')}
          </span>
        </span>
        <Switch
          id="admin-page-seo-index"
          checked={values.seoIndex && values.visibility !== 'authenticated'}
          onCheckedChange={checked => set('seoIndex', checked)}
          disabled={saving || values.visibility === 'authenticated'}
        />
      </label>

      <div className="rounded-xl border border-border/50">
        <label
          htmlFor="admin-page-menu"
          className="flex cursor-pointer items-center gap-4 px-3 py-3"
        >
          <span className="min-w-0 flex-1">
            <span className="block text-body font-semibold text-foreground">
              {t('pages.form.showInMenu')}
            </span>
            <span className="mt-0.5 block text-caption text-muted-foreground">
              {values.published
                ? t('pages.form.showInMenuHint')
                : t('pages.form.showInMenuDraftHint')}
            </span>
          </span>
          <Switch
            id="admin-page-menu"
            checked={values.showInMenu}
            onCheckedChange={checked => set('showInMenu', checked)}
            disabled={saving}
          />
        </label>
        {values.showInMenu && (
          <div className="flex items-center gap-4 border-t border-border/50 px-3 py-2.5">
            <label
              htmlFor="admin-page-menu-order"
              className="min-w-0 flex-1 text-caption text-muted-foreground"
            >
              {t('pages.form.menuOrder')}
            </label>
            <Input
              id="admin-page-menu-order"
              type="number"
              inputMode="numeric"
              step={1}
              min={SITE_PAGE_MENU_ORDER_MIN}
              max={SITE_PAGE_MENU_ORDER_MAX}
              value={Number.isNaN(values.menuOrder) ? '' : values.menuOrder}
              onChange={e => set('menuOrder', e.target.value === '' ? 0 : Number(e.target.value))}
              disabled={saving}
              aria-invalid={Boolean(menuOrderError)}
              className="h-10 w-24 rounded-lg text-right text-base tabular-nums sm:text-body"
            />
          </div>
        )}
        {menuOrderError && (
          <p role="alert" className="px-3 pb-2.5 text-caption text-destructive">
            {menuOrderError}
          </p>
        )}
      </div>
    </>
  );
};
