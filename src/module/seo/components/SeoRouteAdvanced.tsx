import { SEO_SCHEMA_TYPES } from '@core/seo/types';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@ui/shad-cn/components/accordion.tsx';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@ui/shad-cn/components/select.tsx';
import { Textarea } from '@ui/shad-cn/components/textarea.tsx';
import React from 'react';
import { useTranslation } from 'react-i18next';

import type { ISeoRouteValues } from '../types';
import type { SeoRouteForm } from '../use.seo.route.form';
import { SeoField } from './SeoField';
import { SEO_INPUT } from './SeoRouteFields';

/** Schema.org type and the optional JSON-LD block (open when it already has content). */
export const SeoRouteAdvanced: React.FC<{ form: SeoRouteForm; saving: boolean }> = ({
  form,
  saving,
}) => {
  const { t } = useTranslation('seo');
  const { values, set, shown } = form;
  return (
    <>
      <SeoField id="seo-schema" label={t('form.schemaType')} hint={t('form.schemaTypeHint')}>
        <Select
          value={values.schemaType}
          onValueChange={value => set('schemaType', value as ISeoRouteValues['schemaType'])}
          disabled={saving}
        >
          <SelectTrigger id="seo-schema" className={SEO_INPUT} aria-describedby="seo-schema-hint">
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
        className="rounded-lg border border-border/50 px-3"
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
                aria-describedby={shown('jsonLd') ? 'seo-jsonld-error' : 'seo-jsonld-hint'}
                className="min-h-36 rounded-lg font-mono text-sm"
              />
            </SeoField>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </>
  );
};
