import type { ISeoSettings } from '@core/seo/types';
import { Button } from '@ui/shad-cn/components/button.tsx';
import { Input } from '@ui/shad-cn/components/input.tsx';
import { Textarea } from '@ui/shad-cn/components/textarea.tsx';
import React from 'react';
import { useTranslation } from 'react-i18next';

import {
  SEO_DESCRIPTION_IDEAL,
  SEO_DESCRIPTION_MAX,
  SEO_TITLE_IDEAL,
  SEO_TITLE_MAX,
} from '../const';
import type { SeoRouteForm } from '../use.seo.route.form';
import { SeoCounter } from './SeoCounter';
import { SeoField } from './SeoField';

export const SEO_INPUT = 'h-11 rounded-lg text-base sm:text-body';

interface IProps {
  form: SeoRouteForm;
  isNew: boolean;
  saving: boolean;
  suggestions: string[];
  settings: ISeoSettings | null;
}

const describe = (form: SeoRouteForm, id: string, key: Parameters<SeoRouteForm['shown']>[0]) =>
  form.shown(key) ? `${id}-error` : `${id}-hint`;

/** Path, title, description and image of one entry. */
export const SeoRouteFields: React.FC<IProps> = ({
  form,
  isNew,
  saving,
  suggestions,
  settings,
}) => {
  const { t } = useTranslation('seo');
  const { values, set, shown } = form;
  return (
    <>
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
          onBlur={() => form.setTouched(true)}
          placeholder="/timeline"
          disabled={saving}
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          inputMode="url"
          aria-invalid={Boolean(shown('path'))}
          aria-describedby={describe(form, 'seo-path', 'path')}
          className={`${SEO_INPUT} font-mono`}
        />
      </SeoField>
      {isNew && suggestions.length > 0 && (
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
          aria-describedby={describe(form, 'seo-title', 'title')}
          className={`${SEO_INPUT} font-semibold`}
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
          aria-describedby={describe(form, 'seo-description', 'description')}
          className="min-h-24 resize-none rounded-lg text-base sm:text-body"
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
          onBlur={() => form.setTouched(true)}
          placeholder="https://…/vorschau.jpg"
          disabled={saving}
          inputMode="url"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          aria-invalid={Boolean(shown('image'))}
          aria-describedby={describe(form, 'seo-image', 'image')}
          className={SEO_INPUT}
        />
      </SeoField>
    </>
  );
};
