import { FieldGroup } from '@ui/shad-cn/components/field.tsx';
import React from 'react';

import { isFieldVisible } from '../config.utils';
import type { PluginConfig } from '../hooks/use-plugin-config';
import { PluginConfigField } from './PluginConfigField';

interface IPluginConfigFieldsProps {
  config: PluginConfig;
}

/** One block per visible field. Fields whose `showIf` does not match are hidden, not validated. */
export const PluginConfigFields: React.FC<IPluginConfigFieldsProps> = ({ config }) => (
  <FieldGroup className="gap-6">
    {config.fields
      .filter(field => isFieldVisible(field, config.draft))
      .map(field => (
        <PluginConfigField
          key={field.key}
          field={field}
          value={config.draft[field.key]}
          errors={config.errors.filter(error => error.key === field.key)}
          disabled={config.saving}
          onChange={value => config.setValue(field.key, value)}
        />
      ))}
  </FieldGroup>
);
