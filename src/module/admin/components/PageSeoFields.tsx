import { Switch } from '@ui/shad-cn/components/switch.tsx';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { TextField } from '../blocks/BlockFields';
import { CropImageField } from '../blocks/CropImageField';
import { SITE_PAGE_SEO_CANONICAL_MAX } from '../const';
import type { ISitePageValues } from '../types';

export interface IPageSeoFieldsProps {
  values: ISitePageValues;
  saving: boolean;
  error: string | null;
  onImage: (url: string) => void;
  set: <K extends keyof ISitePageValues>(key: K, value: ISitePageValues[K]) => void;
}

/** "SEO" tab: search engines on / off, preview image (1200 × 630) and canonical address. */
export const PageSeoFields: React.FC<IPageSeoFieldsProps> = ({
  values,
  saving,
  error,
  onImage,
  set,
}) => {
  const { t } = useTranslation('admin');
  const details = values.seoIndex && values.visibility !== 'authenticated';
  return (
    <>
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

      {details && (
        <div className="space-y-5 rounded-xl border border-border/50 px-3 py-3">
          <CropImageField
            label={t('pages.form.seoImage')}
            hint={t('pages.form.seoImageHint')}
            value={values.seoImage}
            onChange={onImage}
            ratio="1200/630"
            aspect="aspect-[1200/630]"
            disabled={saving}
          />
          <div>
            <TextField
              label={t('pages.form.seoCanonical')}
              hint={t('pages.form.seoCanonicalHint')}
              value={values.seoCanonical}
              onChange={url => set('seoCanonical', url)}
              max={SITE_PAGE_SEO_CANONICAL_MAX}
              placeholder="https://example.com/…"
              disabled={saving}
            />
            {error && (
              <p role="alert" className="mt-1.5 text-caption text-destructive">
                {error}
              </p>
            )}
          </div>
        </div>
      )}
    </>
  );
};
