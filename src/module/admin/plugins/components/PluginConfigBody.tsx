import { Alert, AlertDescription, AlertTitle } from '@ui/shad-cn/components/alert.tsx';
import { Button } from '@ui/shad-cn/components/button.tsx';
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from '@ui/shad-cn/components/empty.tsx';
import { Skeleton } from '@ui/shad-cn/components/skeleton.tsx';
import React from 'react';
import { useTranslation } from 'react-i18next';

import type { PluginConfig } from '../hooks/use-plugin-config';
import { PluginConfigErrors } from './PluginConfigErrors';
import { PluginConfigFields } from './PluginConfigFields';

interface IPluginConfigBodyProps {
  config: PluginConfig;
}

/** Content of the configuration drawer: loading, load error, empty, or the form. */
export const PluginConfigBody: React.FC<IPluginConfigBodyProps> = ({ config }) => {
  const { t } = useTranslation('admin');

  if (config.loading) {
    return (
      <div className="flex flex-col gap-4 px-4 py-4" aria-busy="true">
        <Skeleton className="h-14 w-full" />
        <Skeleton className="h-14 w-full" />
        <Skeleton className="h-14 w-2/3" />
      </div>
    );
  }

  if (config.loadError) {
    return (
      <div className="flex flex-col gap-4 px-4 py-4">
        <Alert variant="destructive">
          <AlertTitle>{t('plugins.config.errors.load')}</AlertTitle>
          <AlertDescription>
            {t(`plugins.config.errors.${config.loadError}`, {
              defaultValue: t('plugins.config.errors.unknown'),
            })}
          </AlertDescription>
        </Alert>
        <Button
          type="button"
          variant="outline"
          size="lg"
          className="self-start"
          onClick={config.retry}
        >
          {t('plugins.config.errors.retry')}
        </Button>
      </div>
    );
  }

  if (config.fields.length === 0) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyTitle>{t('plugins.config.empty.title')}</EmptyTitle>
          <EmptyDescription>{t('plugins.config.empty.description')}</EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <div className="flex flex-col gap-6 px-4 py-4">
      <PluginConfigErrors errors={config.errors} />
      <PluginConfigFields config={config} />
    </div>
  );
};
