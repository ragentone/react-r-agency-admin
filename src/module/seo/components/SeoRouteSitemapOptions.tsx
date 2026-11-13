import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@ui/shad-cn/components/select.tsx';
import { Separator } from '@ui/shad-cn/components/separator.tsx';
import { Switch } from '@ui/shad-cn/components/switch.tsx';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { SEO_CHANGEFREQS, SEO_PRIORITIES } from '../const';
import type { SeoChangefreq } from '../types';
import type { SeoRouteForm } from '../use.seo.route.form';
import { SeoField, SeoSwitchRow } from './SeoField';
import { SEO_INPUT } from './SeoRouteFields';

/** Index / sitemap switches; changefreq and priority only while the entry is in the sitemap. */
export const SeoRouteSitemapOptions: React.FC<{ form: SeoRouteForm; saving: boolean }> = ({
  form,
  saving,
}) => {
  const { t } = useTranslation('seo');
  const { values, set } = form;
  const prefix = values.path.trim().endsWith('/*');
  const listed = values.inSitemap && values.index && !prefix;

  return (
    <div className="overflow-hidden rounded-lg border border-border/50">
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
          checked={listed}
          onCheckedChange={checked => set('inSitemap', checked)}
          disabled={saving || !values.index || prefix}
        />
      </SeoSwitchRow>
      {listed && (
        <>
          <Separator className="bg-border/50" />
          <div className="grid grid-cols-2 gap-3 px-3 py-3">
            <SeoField id="seo-changefreq" label={t('form.changefreq')}>
              <Select
                value={values.changefreq}
                onValueChange={value => set('changefreq', value as SeoChangefreq)}
                disabled={saving}
              >
                <SelectTrigger id="seo-changefreq" className={SEO_INPUT}>
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
                <SelectTrigger id="seo-priority" className={`${SEO_INPUT} tabular-nums`}>
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
  );
};
