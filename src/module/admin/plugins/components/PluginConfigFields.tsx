import { FieldGroup } from '@ui/shad-cn/components/field.tsx';
import React, { useEffect, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';

import { isFieldVisible } from '../config.utils';
import type { PluginConfig } from '../hooks/use-plugin-config';
import { PluginConfigField } from './PluginConfigField';

interface IPluginConfigFieldsProps {
  config: PluginConfig;
}

/**
 * The visible fields of the configuration form. Fields whose `showIf` does not match are hidden, not validated.
 * Rows are separated by a hairline, so long forms read as one list on small screens.
 */
export const PluginConfigFields: React.FC<IPluginConfigFieldsProps> = ({ config }) => {
  const { t } = useTranslation('admin');
  const listRef = useRef<HTMLDivElement>(null);

  const visible = useMemo(
    () => config.fields.filter(field => isFieldVisible(field, config.draft)),
    [config.fields, config.draft]
  );
  const requiredCount = visible.filter(field => field.required).length;

  // Keys of the fields with a problem, in form order. Used to bring the first one into view after a rejected save.
  const invalidKeys = useMemo(
    () =>
      visible.filter(field => config.errors.some(error => error.key === field.key)).map(field => field.key),
    [visible, config.errors]
  );
  const invalidSignature = invalidKeys.join('|');
  const previousSignature = useRef('');

  useEffect(() => {
    // Only when problems appear (a rejected save), not while the user types into a field.
    const appeared = previousSignature.current === '' && invalidSignature !== '';
    previousSignature.current = invalidSignature;
    if (!appeared || !listRef.current) return;
    const target = listRef.current.querySelector<HTMLElement>(
      `[data-config-key="${CSS.escape(invalidKeys[0])}"]`
    );
    target?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    target?.querySelector<HTMLElement>('input, textarea, button, [role="switch"], [role="combobox"]')?.focus();
  }, [invalidSignature, invalidKeys]);

  if (visible.length === 0) {
    return <p className="text-caption text-muted-foreground">{t('plugins.config.noVisibleFields')}</p>;
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-caption text-muted-foreground tabular-nums" aria-live="polite">
        {t('plugins.config.summary', { count: visible.length, required: requiredCount })}
      </p>
      <div ref={listRef}>
        <FieldGroup className="gap-0">
          {visible.map(field => (
            <div
              key={field.key}
              data-config-key={field.key}
              className="border-border py-5 first:pt-0 last:pb-0 not-last:border-b"
            >
              <PluginConfigField
                field={field}
                value={config.draft[field.key]}
                errors={config.errors.filter(error => error.key === field.key)}
                disabled={config.saving}
                onChange={value => config.setValue(field.key, value)}
              />
            </div>
          ))}
        </FieldGroup>
      </div>
    </div>
  );
};
