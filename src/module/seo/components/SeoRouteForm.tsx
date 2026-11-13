import { applyTemplate, siteOrigin } from '@core/seo/resolve';
import type { ISeoSettings } from '@core/seo/types';
import { Button } from '@ui/shad-cn/components/button.tsx';
import { Trash2 } from 'lucide-react';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { AdminPanel } from '../../admin/ui/AdminPanel';
import type { ISeoRoute } from '../types';
import type { SeoAdmin } from '../use.seo.admin';
import { useSeoRouteForm } from '../use.seo.route.form';
import { SeoDeleteDialog } from './SeoDeleteDialog';
import { SeoPreview } from './SeoPreview';
import { SeoRouteAdvanced } from './SeoRouteAdvanced';
import { SeoRouteFields } from './SeoRouteFields';
import { SeoRouteSitemapOptions } from './SeoRouteSitemapOptions';

interface IProps {
  admin: SeoAdmin;
  /** null = new entry. */
  route: ISeoRoute | null;
  initialPath?: string;
  suggestions: string[];
  settings: ISeoSettings | null;
  onDone: () => void;
}

/** One SEO entry as a page: form + live preview (Google, X) next to it from `lg`. */
export const SeoRouteForm: React.FC<IProps> = ({
  admin,
  route,
  initialPath,
  suggestions,
  settings,
  onDone,
}) => {
  const { t } = useTranslation('seo');
  const [confirmDelete, setConfirmDelete] = useState(false);
  const saving = admin.saving;
  const takenPaths = (admin.data?.routes ?? [])
    .filter(item => item.id !== route?.id)
    .map(item => item.path);
  const form = useSeoRouteForm({
    route,
    initialPath,
    takenPaths,
    onSave: admin.saveRoute,
    onDelete: admin.deleteRoute,
    onDone,
  });
  const { values } = form;

  const prefix = values.path.trim().endsWith('/*');
  const origin = siteOrigin(settings);
  const previewPath = prefix ? values.path.trim().slice(0, -2) || '/' : values.path.trim() || '/';
  const pageTitle = values.title.trim() || settings?.defaultTitle || '';

  return (
    <form
      noValidate
      onSubmit={event => {
        event.preventDefault();
        void form.submit();
      }}
      className="grid gap-4 md:gap-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start"
    >
      <AdminPanel title={t('form.path')} className="lg:row-span-2">
        <div className="space-y-5">
          {form.serverError && (
            <p
              role="alert"
              className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-caption text-destructive"
            >
              {form.serverError}
            </p>
          )}
          <SeoRouteFields
            form={form}
            isNew={!route}
            saving={saving}
            suggestions={suggestions}
            settings={settings}
          />
          <SeoRouteSitemapOptions form={form} saving={saving} />
          <SeoRouteAdvanced form={form} saving={saving} />
        </div>
      </AdminPanel>

      <div className="flex flex-col gap-4 lg:sticky lg:top-4">
        <SeoPreview
          documentTitle={applyTemplate(
            settings?.titleTemplate ?? '%s',
            pageTitle,
            settings?.siteName ?? ''
          )}
          title={pageTitle}
          description={values.description.trim() || settings?.defaultDescription || ''}
          url={`${origin}${previewPath}`}
          image={values.image.trim() || settings?.defaultImage || ''}
          siteName={settings?.siteName ?? ''}
          origin={origin}
          noindex={!values.index}
        />
        <div className="flex flex-col gap-2">
          <Button
            type="submit"
            size="xl"
            fullWidth
            data-state={saving ? 'loading' : undefined}
            disabled={saving}
          >
            {route ? t('form.save') : t('form.create')}
          </Button>
          <Button
            type="button"
            size="lg"
            variant="outline"
            fullWidth
            onClick={onDone}
            disabled={saving}
          >
            {t('form.cancel')}
          </Button>
          {route && (
            <Button
              type="button"
              size="lg"
              variant="destructive-outline"
              fullWidth
              onClick={() => setConfirmDelete(true)}
              disabled={saving}
            >
              <Trash2 aria-hidden="true" />
              {t('form.delete')}
            </Button>
          )}
        </div>
      </div>

      {route && (
        <SeoDeleteDialog
          open={confirmDelete}
          onOpenChange={setConfirmDelete}
          path={route.path}
          busy={saving}
          onConfirm={() => void form.remove()}
        />
      )}
    </form>
  );
};
