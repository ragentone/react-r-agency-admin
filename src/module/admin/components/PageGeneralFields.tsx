import { Input } from '@ui/shad-cn/components/input.tsx';
import { Textarea } from '@ui/shad-cn/components/textarea.tsx';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { SITE_PAGE_SUMMARY_MAX, SITE_PAGE_TITLE_MAX } from '../const';
import type { ISitePage, ISitePageValues } from '../types';

const FIELD_LABEL = 'text-caption font-medium text-foreground';

export interface IPageGeneralFieldsProps {
  mode: 'create' | 'edit';
  page: ISitePage | null;
  values: ISitePageValues;
  slug: string;
  saving: boolean;
  touched: boolean;
  titleError: string | null;
  slugError: string | null;
  summaryError: string | null;
  set: <K extends keyof ISitePageValues>(key: K, value: ISitePageValues[K]) => void;
  setTitle: (title: string) => void;
  setSlug: (slug: string) => void;
}

/** "General" tab of the page editor: title, address, summary. */
export const PageGeneralFields: React.FC<IPageGeneralFieldsProps> = ({
  mode,
  page,
  values,
  slug,
  saving,
  touched,
  titleError,
  slugError,
  summaryError,
  set,
  setTitle,
  setSlug,
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
    </>
  );
};
