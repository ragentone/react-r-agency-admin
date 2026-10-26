import { applyTemplate, siteOrigin } from '@core/seo/resolve';
import type { ISeoSettings } from '@core/seo/types';
import { Alert, AlertDescription, AlertTitle } from '@ui/shad-cn/components/alert.tsx';
import { Button } from '@ui/shad-cn/components/button.tsx';
import { Input } from '@ui/shad-cn/components/input.tsx';
import { Separator } from '@ui/shad-cn/components/separator.tsx';
import { Switch } from '@ui/shad-cn/components/switch.tsx';
import { Textarea } from '@ui/shad-cn/components/textarea.tsx';
import { TriangleAlert } from 'lucide-react';
import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import {
  SEO_DESCRIPTION_IDEAL,
  SEO_DESCRIPTION_MAX,
  SEO_SAME_AS_MAX,
  SEO_SITE_NAME_MAX,
  SEO_TITLE_IDEAL,
  SEO_TITLE_MAX,
  SEO_URL_MAX,
} from '../const';
import type { ISeoSettingsValues } from '../types';
import type { SeoAdmin } from '../use.seo.admin';
import { SeoCounter } from './SeoCounter';
import { SeoField, SeoSwitchRow } from './SeoField';
import { SeoPreview } from './SeoPreview';

const INPUT = 'h-12 rounded-xl text-base sm:text-body';
const URL_OK = /^(https?:\/\/|\/(?!\/))/i;

interface IForm extends Omit<ISeoSettingsValues, 'sameAs'> {
  /** One url per line. */
  sameAs: string;
}

const toForm = (settings: ISeoSettings): IForm => ({
  siteName: settings.siteName,
  titleTemplate: settings.titleTemplate || '%s',
  defaultTitle: settings.defaultTitle,
  defaultDescription: settings.defaultDescription,
  defaultImage: settings.defaultImage,
  twitterHandle: settings.twitterHandle,
  logo: settings.logo,
  sameAs: settings.sameAs.join('\n'),
  indexing: settings.indexing,
});

type Errors = Partial<Record<keyof IForm, string>>;

/**
 * Tab "Allgemein": site name, title template, defaults, X account, organization, indexing.
 * Keyed by the saved settings in `SeoArea` – a save starts the form from the new values.
 */
export const SeoSettingsTab: React.FC<{ admin: SeoAdmin; settings: ISeoSettings }> = ({
  admin,
  settings,
}) => {
  const { t } = useTranslation('seo');
  const initial = useMemo(() => toForm(settings), [settings]);
  const [form, setForm] = useState<IForm>(initial);
  const [serverErrors, setServerErrors] = useState<Errors>({});

  const set = <K extends keyof IForm>(key: K, value: IForm[K]) => {
    setForm(prev => ({ ...prev, [key]: value }));
    setServerErrors(prev => ({ ...prev, [key]: undefined }));
  };

  const sameAs = form.sameAs
    .split(/\s+/)
    .map(item => item.trim())
    .filter(Boolean);

  const errors = useMemo<Errors>(() => {
    const result: Errors = {};
    if (form.siteName.length > SEO_SITE_NAME_MAX) result.siteName = t('error.site_name_too_long');
    if (!form.titleTemplate.includes('%s')) result.titleTemplate = t('error.template_invalid');
    if (form.defaultTitle.length > SEO_TITLE_MAX) result.defaultTitle = t('error.title_too_long');
    if (form.defaultDescription.length > SEO_DESCRIPTION_MAX) {
      result.defaultDescription = t('error.description_too_long');
    }
    for (const key of ['defaultImage', 'logo'] as const) {
      const value = form[key].trim();
      if (value && (value.length > SEO_URL_MAX || !URL_OK.test(value))) {
        result[key] = t('error.url_invalid');
      }
    }
    const handle = form.twitterHandle.trim().replace(/^@/, '');
    if (handle && !/^[A-Za-z0-9_]{1,15}$/.test(handle)) {
      result.twitterHandle = t('error.handle_invalid');
    }
    if (sameAs.length > SEO_SAME_AS_MAX || sameAs.some(url => !/^https?:\/\//i.test(url))) {
      result.sameAs = t('error.same_as_invalid');
    }
    return result;
    // `sameAs` is derived from `form`.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form, t]);

  const dirty = JSON.stringify(form) !== JSON.stringify(initial);
  const invalid = Object.values(errors).some(Boolean);
  const shown = (key: keyof IForm) => serverErrors[key] ?? errors[key];
  const describe = (id: string, key: keyof IForm) => (shown(key) ? `${id}-error` : `${id}-hint`);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (invalid || !dirty || admin.saving) return;
    const result = await admin.saveSettings({
      ...form,
      siteName: form.siteName.trim(),
      titleTemplate: form.titleTemplate.trim(),
      defaultTitle: form.defaultTitle.trim(),
      defaultDescription: form.defaultDescription.trim(),
      defaultImage: form.defaultImage.trim(),
      logo: form.logo.trim(),
      twitterHandle: form.twitterHandle.trim().replace(/^@/, ''),
      sameAs,
    });
    if (result.ok) {
      toast.success(t('toast.settingsSaved'));
      return;
    }
    const message = t(result.error ?? 'error.unknown');
    if (result.field) setServerErrors({ [result.field]: message });
    else toast.error(message);
  };

  const origin = siteOrigin(settings);
  const homeTitle = form.defaultTitle.trim() || form.siteName.trim();

  return (
    <form onSubmit={event => void submit(event)} noValidate className="space-y-6 px-4 py-5">
      {!form.indexing && (
        <Alert variant="destructive" className="rounded-xl">
          <TriangleAlert aria-hidden="true" />
          <AlertTitle>{t('settings.indexingOffTitle')}</AlertTitle>
          <AlertDescription>{t('settings.indexingOffText')}</AlertDescription>
        </Alert>
      )}

      <section className="space-y-5" aria-labelledby="seo-settings-site">
        <h2 id="seo-settings-site" className="text-title font-bold">
          {t('settings.site')}
        </h2>
        <SeoField
          id="seo-site-name"
          label={t('settings.siteName')}
          error={shown('siteName')}
          hint={t('settings.siteNameHint')}
        >
          <Input
            id="seo-site-name"
            value={form.siteName}
            onChange={e => set('siteName', e.target.value)}
            placeholder="r-agency"
            disabled={admin.saving}
            aria-invalid={Boolean(shown('siteName'))}
            aria-describedby={describe('seo-site-name', 'siteName')}
            className={`${INPUT} font-semibold`}
          />
        </SeoField>
        <SeoField
          id="seo-template"
          label={t('settings.titleTemplate')}
          error={shown('titleTemplate')}
          hint={t('settings.titleTemplateHint', {
            example: applyTemplate(form.titleTemplate, t('settings.examplePage'), form.siteName),
          })}
        >
          <Input
            id="seo-template"
            value={form.titleTemplate}
            onChange={e => set('titleTemplate', e.target.value)}
            placeholder="%s · r-agency"
            disabled={admin.saving}
            aria-invalid={Boolean(shown('titleTemplate'))}
            aria-describedby={describe('seo-template', 'titleTemplate')}
            className={`${INPUT} font-mono`}
          />
        </SeoField>
        <SeoField
          id="seo-default-title"
          label={t('settings.defaultTitle')}
          error={shown('defaultTitle')}
          hint={t('settings.defaultTitleHint')}
          aside={
            <SeoCounter
              length={form.defaultTitle.length}
              ideal={SEO_TITLE_IDEAL}
              max={SEO_TITLE_MAX}
            />
          }
        >
          <Input
            id="seo-default-title"
            value={form.defaultTitle}
            onChange={e => set('defaultTitle', e.target.value)}
            disabled={admin.saving}
            aria-invalid={Boolean(shown('defaultTitle'))}
            aria-describedby={describe('seo-default-title', 'defaultTitle')}
            className={INPUT}
          />
        </SeoField>
        <SeoField
          id="seo-default-description"
          label={t('settings.defaultDescription')}
          error={shown('defaultDescription')}
          hint={t('settings.defaultDescriptionHint')}
          aside={
            <SeoCounter
              length={form.defaultDescription.length}
              ideal={SEO_DESCRIPTION_IDEAL}
              max={SEO_DESCRIPTION_MAX}
            />
          }
        >
          <Textarea
            id="seo-default-description"
            value={form.defaultDescription}
            onChange={e => set('defaultDescription', e.target.value)}
            disabled={admin.saving}
            rows={3}
            aria-invalid={Boolean(shown('defaultDescription'))}
            aria-describedby={describe('seo-default-description', 'defaultDescription')}
            className="min-h-24 resize-none rounded-xl text-base sm:text-body"
          />
        </SeoField>
        <SeoField
          id="seo-default-image"
          label={t('settings.defaultImage')}
          error={shown('defaultImage')}
          hint={t('form.imageHint')}
        >
          <Input
            id="seo-default-image"
            value={form.defaultImage}
            onChange={e => set('defaultImage', e.target.value)}
            placeholder="/og.png"
            inputMode="url"
            autoCapitalize="none"
            spellCheck={false}
            disabled={admin.saving}
            aria-invalid={Boolean(shown('defaultImage'))}
            aria-describedby={describe('seo-default-image', 'defaultImage')}
            className={INPUT}
          />
        </SeoField>

        <SeoPreview
          documentTitle={homeTitle}
          title={homeTitle}
          description={form.defaultDescription.trim()}
          url={`${origin}/`}
          image={form.defaultImage.trim()}
          siteName={form.siteName.trim()}
          origin={origin}
          noindex={!form.indexing}
        />
      </section>

      <Separator className="bg-border/50" />

      <section className="space-y-5" aria-labelledby="seo-settings-social">
        <h2 id="seo-settings-social" className="text-title font-bold">
          {t('settings.social')}
        </h2>
        <SeoField
          id="seo-handle"
          label={t('settings.twitterHandle')}
          error={shown('twitterHandle')}
          hint={t('settings.twitterHandleHint')}
        >
          <div className="flex h-12 items-center overflow-hidden rounded-xl border border-input focus-within:ring-1 focus-within:ring-ring">
            <span className="shrink-0 pl-3 text-base text-muted-foreground select-none sm:text-body">
              @
            </span>
            <Input
              id="seo-handle"
              value={form.twitterHandle}
              onChange={e => set('twitterHandle', e.target.value.replace(/^@/, ''))}
              placeholder="ragency"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              disabled={admin.saving}
              aria-invalid={Boolean(shown('twitterHandle'))}
              aria-describedby={describe('seo-handle', 'twitterHandle')}
              className="h-full flex-1 rounded-none border-0 pl-1 text-base shadow-none focus-visible:ring-0 sm:text-body"
            />
          </div>
        </SeoField>
        <SeoField
          id="seo-logo"
          label={t('settings.logo')}
          error={shown('logo')}
          hint={t('settings.logoHint')}
        >
          <Input
            id="seo-logo"
            value={form.logo}
            onChange={e => set('logo', e.target.value)}
            placeholder="/logo.png"
            inputMode="url"
            autoCapitalize="none"
            spellCheck={false}
            disabled={admin.saving}
            aria-invalid={Boolean(shown('logo'))}
            aria-describedby={describe('seo-logo', 'logo')}
            className={INPUT}
          />
        </SeoField>
        <SeoField
          id="seo-same-as"
          label={t('settings.sameAs')}
          error={shown('sameAs')}
          hint={t('settings.sameAsHint', { max: SEO_SAME_AS_MAX })}
        >
          <Textarea
            id="seo-same-as"
            value={form.sameAs}
            onChange={e => set('sameAs', e.target.value)}
            placeholder={'https://x.com/…\nhttps://github.com/…'}
            rows={3}
            spellCheck={false}
            autoCapitalize="none"
            disabled={admin.saving}
            aria-invalid={Boolean(shown('sameAs'))}
            aria-describedby={describe('seo-same-as', 'sameAs')}
            className="min-h-24 resize-none rounded-xl font-mono text-sm"
          />
        </SeoField>
      </section>

      <Separator className="bg-border/50" />

      <section aria-labelledby="seo-settings-search">
        <h2 id="seo-settings-search" className="mb-3 text-title font-bold">
          {t('settings.search')}
        </h2>
        <div className="overflow-hidden rounded-xl border border-border/50">
          <SeoSwitchRow
            id="seo-indexing"
            title={t('settings.indexing')}
            hint={t('settings.indexingHint')}
          >
            <Switch
              id="seo-indexing"
              checked={form.indexing}
              onCheckedChange={checked => set('indexing', checked)}
              disabled={admin.saving}
            />
          </SeoSwitchRow>
        </div>
      </section>

      <div className="sticky bottom-0 -mx-4 border-t border-border/50 bg-background/90 px-4 py-3 backdrop-blur">
        <Button
          type="submit"
          size="xl"
          fullWidth
          isLoading={admin.saving}
          disabled={!dirty || invalid}
        >
          {dirty ? t('settings.save') : t('settings.saved')}
        </Button>
      </div>
    </form>
  );
};
