import { Alert, AlertDescription, AlertTitle } from '@ui/shad-cn/components/alert.tsx';
import React from 'react';
import { useTranslation } from 'react-i18next';

import type { IPluginConfigError } from '../types';

interface IPluginConfigErrorsProps {
  errors: IPluginConfigError[];
}

/** Problems that belong to the whole form (`key` empty). Field problems are shown at their field. */
export const PluginConfigErrors: React.FC<IPluginConfigErrorsProps> = ({ errors }) => {
  const { t } = useTranslation('admin');
  const formErrors = errors.filter(error => error.key === '');
  if (formErrors.length === 0) return null;

  return (
    <Alert variant="destructive">
      <AlertTitle>{t('plugins.config.errors.formTitle')}</AlertTitle>
      <AlertDescription>
        {formErrors.map(error => (
          <p key={error.code}>
            {t(`plugins.config.errors.${error.code}`, {
              defaultValue: t('plugins.config.errors.unknown'),
            })}
          </p>
        ))}
      </AlertDescription>
    </Alert>
  );
};
