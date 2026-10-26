import { applyTemplate, siteOrigin } from '@core/seo/resolve';
import { type ISeoSettings, SEO_SCHEMA_TYPES } from '@core/seo/types';
import { AppFormDrawer } from '@ui/patterns';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@ui/shad-cn/components/accordion.tsx';
import { Button } from '@ui/shad-cn/components/button.tsx';
import { Input } from '@ui/shad-cn/components/input.tsx';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@ui/shad-cn/components/select.tsx';
import { Separator } from '@ui/shad-cn/components/separator.tsx';
import { Switch } from '@ui/shad-cn/components/switch.tsx';
import { Textarea } from '@ui/shad-cn/components/textarea.tsx';
import { Trash2 } from 'lucide-react';
import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import {
  SEO_CHANGEFREQS,
  SEO_DESCRIPTION_IDEAL,
  SEO_DESCRIPTION_MAX,
  SEO_JSON_LD_MAX,
  SEO_PATH_MAX,
  SEO_PATH_PATTERN,
  SEO_PRIORITIES,
  SEO_TITLE_IDEAL,
  SEO_TITLE_MAX,
  SEO_URL_MAX,
} from '../const';
import type { ISeoRoute, ISeoRouteValues, ISeoSaveResult, SeoChangefreq } from '../types';
import { SeoCounter } from './SeoCounter';
import { SeoDeleteDialog } from './SeoDeleteDialog';
import { SeoField, SeoSwitchRow } from './SeoField';
import { SeoPreview } from './SeoPreview';

const EMPTY: ISeoRouteValues = {
  path: '',
  title: '',
  description: '',
  image: '',
  index: true,
  inSitemap: true,
  changefreq: 'weekly',
  priority: 0.5,
  schemaType: 'WebPage',
  jsonLd: '',
};

const toValues = (route: ISeoRoute | null, path?: string): ISeoRouteValues =>
  route
    ? {
        path: route.path,
        title: route.title,
        description: route.description,
        image: route.image,
        index: route.index,
        inSitemap: route.inSitemap,
        changefreq: route.changefreq,
        priority: route.priority,
        schemaType: route.schemaType,
        jsonLd: route.jsonLd ? JSON.stringify(route.jsonLd, null, 2) : '',
      }
    : { ...EMPTY, path: path ?? '' };

type Errors = Partial<Record<keyof ISeoRouteValues, string>>;

const SELECT = 'h-12 rounded-xl text-base sm:text-body';
const INPUT = 'h-12 rounded-xl text-base sm:text-body';

export interface ISeoRouteDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** null = new entry. */
  route: ISeoRoute | null;
  /** New entry: path to start with (suggestion). */
  initialPath?: string;
  /** Paths of the other entries (duplicate check while typing). */
  takenPaths: string[];
  /** Routes of the app without an entry yet – tap fills the path. */
  suggestions: string[];
  settings: ISeoSettings | null;
  saving: boolean;
  onSave: (id: string | null, values: ISeoRouteValues) => Promise<ISeoSaveResult<ISeoRoute>>;
  onDelete: (id: string) => Promise<ISeoSaveResult<true>>;
}

/**
 * Create / edit the meta data of one path – live preview for Google and X.
 * The parent gives it a new `key` per opening, so the form always starts fresh.
 */
export const SeoRouteDrawer: React.FC<ISeoRouteDrawerProps> = ({
  open,
  onOpenChange,
  route,
  initialPath,
  takenPaths,
  suggestions,
  settings,
  saving,
  onSave,
  onDelete,
}) => {
  const { t } = useTranslation('seo');
  const [values, setValues] = useState<ISeoRouteValues>(() => toValues(route, initialPath));
  const [touched, setTouched] = useState(false);
  const [serverErrors, setServerErrors] = useState<Errors>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const set = <K extends keyof ISeoRouteValues>(key: K, value: ISeoRouteValues[K]) => {
    setValues(prev => ({ ...prev, [key]: value }));
    setServerErrors(prev => ({ ...prev, [key]: undefined }));
    setServerError(null);
  };

  const prefix = values.path.trim().endsWith('/*');

  const errors = useMemo<Errors>(() => {
    const result: Errors = {};
    const path = values.path.trim();
    if (!path) result.path = t('form.errors.pathRequired');
    else if (path.length > SEO_PATH_MAX || !SEO_PATH_PATTERN.test(path)) {
      result.path = t('form.errors.pathInvalid');
    } else if (takenPaths.includes(path.replace(/(.)\/$/, '$1'))) {
      result.path = t('error.path_exists');
    }
    if (values.title.length > SEO_TITLE_MAX) result.title = t('error.title_too_long');
    if (values.description.length > SEO_DESCRIPTION_MAX) {
      result.description = t('error.description_too_long');
    }
    const image = values.image.trim();
    if (image && (image.length > SEO_URL_MAX || !/^(https?:\/\/|\/(?!\/))/i.test(image))) {
      result.image = t('error.url_invalid');
    }
    if (values.jsonLd.trim()) {
      try {
        const parsed: unknown = JSON.parse(values.jsonLd);
        if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
          result.jsonLd = t('error.json_ld_invalid');
        } else if (JSON.stringify(parsed).length > SEO_JSON_LD_MAX) {
          result.jsonLd = t('error.json_ld_too_long');
        }
      } catch {
        result.jsonLd = t('error.json_ld_invalid');
      }
    }
    return result;
  }, [values, takenPaths, t]);

  const shown = (key: keyof ISeoRouteValues) =>
    serverErrors[key] ??
    (touched || key === 'jsonLd' || key === 'title' || key === 'description'
      ? errors[key]
      : undefined);

  const submit = async () => {
    setTouched(true);
    if (Object.values(errors).some(Boolean)) return;
    const result = await onSave(route?.id ?? null, {
      ...values,
      path: values.path.trim(),
      title: values.title.trim(),
      description: values.description.trim(),
      image: values.image.trim(),
    });
    if (result.ok) {
      toast.success(
        route ? t('toast.saved', { path: values.path }) : t('toast.created', { path: values.path })
      );
      onOpenChange(false);
      return;
    }
    const message = t(result.error ?? 'error.unknown');
    if (result.field) setServerErrors({ [result.field]: message });
    else setServerError(message);
  };

  const remove = async () => {
    if (!route) return;
    const result = await onDelete(route.id);
    if (result.ok) {
      toast.success(t('toast.deleted', { path: route.path }));
      setConfirmDelete(false);
      onOpenChange(false);
    } else {
      toast.error(t(result.error ?? 'error.unknown'));
    }
  };

  const origin = siteOrigin(settings);
  const previewPath = prefix ? values.path.trim().slice(0, -2) || '/' : values.path.trim() || '/';
  const pageTitle = values.title.trim() || settings?.defaultTitle || '';
  const describe = (id: string) =>
    shown(id as keyof ISeoRouteValues) ? `${id}-error` : `${id}-hint`;

  return (
    <AppFormDrawer
      open={open}
      onOpenChange={onOpenChange}
      title={route ? t('form.editTitle') : t('form.createTitle')}
      onSubmit={() => void submit()}
      submitLabel={route ? t('form.save') : t('form.create')}
      busy={saving}
      secondaryAction={
        route ? (
          <Button
            type="button"
            variant="destructive-outline"
            size="xl"
            onClick={() => setConfirmDelete(true)}
            disabled={saving}
            aria-label={t('form.delete')}
          >
            <Trash2 aria-hidden="true" />
            <span className="sr-only sm:not-sr-only">{t('form.delete')}</span>
          </Button>
        ) : undefined
      }
    >
      <div className="space-y-5 px-4 py-5 sm:px-6">
        {serverError && (
          <p
            role="alert"
            className="rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-caption text-destructive"
          >
            {serverError}
          </p>
        )}

        <SeoField
          id="seo-path"
          label={t('form.path')}
          error={shown('path')}
          hint={t('form.pathHint')}
        >
          <Input
            id="seo-path"
            value={values.path}
            onChange={e => set('path', e.target.value)}
            onBlur={() => setTouched(true)}
            placeholder="/timeline"
            disabled={saving}
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            inputMode="url"
            aria-invalid={Boolean(shown('path'))}
            aria-describedby={describe('seo-path')}
            className={`${INPUT} font-mono`}
          />
        </SeoField>
        {!route && suggestions.length > 0 && (
          <div className="-mt-2">
            <p className="mb-2 text-caption text-muted-foreground">{t('form.suggestions')}</p>
            <div className="flex flex-wrap gap-2">
              {suggestions.map(path => (
                <Button
                  key={path}
                  type="button"
                  variant={values.path === path ? 'default' : 'outline'}
                  size="sm"
                  className="rounded-full font-mono"
                  onClick={() => set('path', path)}
                  aria-pressed={values.path === path}
                >
                  {path}
                </Button>
              ))}
            </div>
          </div>
        )}

        <SeoField
          id="seo-title"
          label={t('form.title')}
          error={shown('title')}
          hint={t('form.titleHint', { title: settings?.defaultTitle || '–' })}
          aside={
            <SeoCounter length={values.title.length} ideal={SEO_TITLE_IDEAL} max={SEO_TITLE_MAX} />
          }
        >
          <Input
            id="seo-title"
            value={values.title}
            onChange={e => set('title', e.target.value)}
            placeholder={t('form.titlePlaceholder')}
            disabled={saving}
            aria-invalid={Boolean(shown('title'))}
            aria-describedby={describe('seo-title')}
            className={`${INPUT} font-semibold`}
          />
        </SeoField>

        <SeoField
          id="seo-description"
          label={t('form.description')}
          error={shown('description')}
          hint={t('form.descriptionHint')}
          aside={
            <SeoCounter
              length={values.description.length}
              ideal={SEO_DESCRIPTION_IDEAL}
              max={SEO_DESCRIPTION_MAX}
            />
          }
        >
          <Textarea
            id="seo-description"
            value={values.description}
            onChange={e => set('description', e.target.value)}
            placeholder={t('form.descriptionPlaceholder')}
            disabled={saving}
            rows={3}
            aria-invalid={Boolean(shown('description'))}
            aria-describedby={describe('seo-description')}
            className="min-h-24 resize-none rounded-xl text-base sm:text-body"
          />
        </SeoField>

        <SeoField
          id="seo-image"
          label={t('form.image')}
          error={shown('image')}
          hint={t('form.imageHint')}
        >
          <Input
            id="seo-image"
            value={values.image}
            onChange={e => set('image', e.target.value)}
            onBlur={() => setTouched(true)}
            placeholder="https://…/vorschau.jpg"
            disabled={saving}
            inputMode="url"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            aria-invalid={Boolean(shown('image'))}
            aria-describedby={describe('seo-image')}
            className={INPUT}
          />
        </SeoField>

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

        <div className="overflow-hidden rounded-xl border border-border/50">
          <SeoSwitchRow id="seo-index" title={t('form.index')} hint={t('form.indexHint')}>
            <Switch
              id="seo-index"
              checked={values.index}
              onCheckedChange={checked => set('index', checked)}
              disabled={saving}
            />
          </SeoSwitchRow>
          <Separator className="bg-border/50" />
          <SeoSwitchRow
            id="seo-sitemap"
            title={t('form.inSitemap')}
            hint={prefix ? t('form.inSitemapPrefix') : t('form.inSitemapHint')}
          >
            <Switch
              id="seo-sitemap"
              checked={values.inSitemap && values.index && !prefix}
              onCheckedChange={checked => set('inSitemap', checked)}
              disabled={saving || !values.index || prefix}
            />
          </SeoSwitchRow>
          {values.inSitemap && values.index && !prefix && (
            <>
              <Separator className="bg-border/50" />
              <div className="grid grid-cols-2 gap-3 px-3 py-3">
                <SeoField id="seo-changefreq" label={t('form.changefreq')}>
                  <Select
                    value={values.changefreq}
                    onValueChange={value => set('changefreq', value as SeoChangefreq)}
                    disabled={saving}
                  >
                    <SelectTrigger id="seo-changefreq" className={SELECT}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {SEO_CHANGEFREQS.map(value => (
                        <SelectItem key={value} value={value}>
                          {t(`changefreq.${value}`)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </SeoField>
                <SeoField id="seo-priority" label={t('form.priority')}>
                  <Select
                    value={values.priority.toFixed(1)}
                    onValueChange={value => set('priority', Number(value))}
                    disabled={saving}
                  >
                    <SelectTrigger id="seo-priority" className={`${SELECT} tabular-nums`}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {SEO_PRIORITIES.map(value => (
                        <SelectItem key={value} value={value.toFixed(1)} className="tabular-nums">
                          {value.toFixed(1)}
                          {value === 1 ? ` · ${t('form.priorityHigh')}` : ''}
                          {value === 0.5 ? ` · ${t('form.priorityNormal')}` : ''}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </SeoField>
              </div>
            </>
          )}
        </div>

        <SeoField id="seo-schema" label={t('form.schemaType')} hint={t('form.schemaTypeHint')}>
          <Select
            value={values.schemaType}
            onValueChange={value => set('schemaType', value as ISeoRouteValues['schemaType'])}
            disabled={saving}
          >
            <SelectTrigger id="seo-schema" className={SELECT} aria-describedby="seo-schema-hint">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SEO_SCHEMA_TYPES.map(value => (
                <SelectItem key={value} value={value}>
                  {t(`schema.${value}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </SeoField>

        <Accordion
          key={`${route?.id ?? 'new'}-${String(open)}`}
          className="rounded-xl border border-border/50 px-3"
          defaultValue={values.jsonLd.trim() ? ['advanced'] : []}
        >
          <AccordionItem value="advanced" className="border-b-0">
            <AccordionTrigger className="min-h-12 py-3 text-body font-semibold text-foreground">
              {t('form.advanced')}
            </AccordionTrigger>
            <AccordionContent>
              <SeoField
                id="seo-jsonld"
                label={t('form.jsonLd')}
                error={shown('jsonLd')}
                hint={t('form.jsonLdHint')}
              >
                <Textarea
                  id="seo-jsonld"
                  value={values.jsonLd}
                  onChange={e => set('jsonLd', e.target.value)}
                  placeholder={'{\n  "@type": "FAQPage",\n  "mainEntity": []\n}'}
                  disabled={saving}
                  rows={6}
                  spellCheck={false}
                  autoCapitalize="none"
                  autoCorrect="off"
                  aria-invalid={Boolean(shown('jsonLd'))}
                  aria-describedby={describe('seo-jsonld')}
                  className="min-h-36 rounded-xl font-mono text-sm"
                />
              </SeoField>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>

      {route && (
        <SeoDeleteDialog
          open={confirmDelete}
          onOpenChange={setConfirmDelete}
          path={route.path}
          busy={saving}
          onConfirm={() => void remove()}
        />
      )}
    </AppFormDrawer>
  );
};
