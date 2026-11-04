import { AppFormDrawer } from '@ui/patterns';
import { Alert, AlertDescription, AlertTitle } from '@ui/shad-cn/components/alert.tsx';
import { Input } from '@ui/shad-cn/components/input.tsx';
import { Label } from '@ui/shad-cn/components/label.tsx';
import React, { useId, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { usePluginCreate } from '../hooks/use-plugin-create';
import type { PluginScope } from '../types';
import { PluginScopeCheckboxes } from './PluginScopeCheckboxes';

interface IPluginCreateDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (pluginId: string) => void;
}

const ERROR_KEYS = ['invalid_manifest', 'exists', 'not_authorized'] as const;
const DEFAULT_SCOPE: PluginScope[] = ['frontend'];

/** Form for a new development plugin: name and the scope it runs in. The id is derived from the name. */
export const PluginCreateDrawer: React.FC<IPluginCreateDrawerProps> = ({
  open,
  onOpenChange,
  onCreated,
}) => {
  const { t } = useTranslation('admin');
  const nameId = useId();
  const [name, setName] = useState('');
  const [scope, setScope] = useState<PluginScope[]>(DEFAULT_SCOPE);
  const { busy, result, create, reset } = usePluginCreate(() => undefined);

  const valid = name.trim().length > 0 && scope.length > 0;

  const close = (next: boolean) => {
    if (busy) return;
    if (!next) {
      setName('');
      setScope(DEFAULT_SCOPE);
      reset();
    }
    onOpenChange(next);
  };

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!valid) return;
    const response = await create({ name: name.trim(), scope });
    if (response.success) {
      onCreated(response.plugin?.pluginId ?? '');
      close(false);
    }
  };

  const errorKey =
    result?.error && (ERROR_KEYS as readonly string[]).includes(result.error)
      ? result.error
      : 'unknown';

  return (
    <AppFormDrawer
      open={open}
      onOpenChange={close}
      title={t('plugins.create.title')}
      description={t('plugins.create.description')}
      onSubmit={submit}
      submitLabel={busy ? t('plugins.create.busy') : t('plugins.create.submit')}
      submitDisabled={!valid}
      busy={busy}
      locked={busy}
    >
      <div className="flex flex-col gap-4 px-4 py-3">
        <p className="text-caption text-muted-foreground">{t('plugins.create.description')}</p>
        <div className="flex flex-col gap-2">
          <Label htmlFor={nameId}>{t('plugins.create.nameLabel')}</Label>
          <Input
            id={nameId}
            value={name}
            disabled={busy}
            onChange={event => setName(event.target.value)}
            className="h-12 text-base"
          />
          <p className="text-caption text-muted-foreground">{t('plugins.create.idHint')}</p>
        </div>
        <div className="flex flex-col gap-2">
          <Label>{t('plugins.create.scope.label')}</Label>
          <PluginScopeCheckboxes value={scope} onChange={setScope} disabled={busy} />
          <p className="text-caption text-muted-foreground">{t('plugins.create.scope.hint')}</p>
        </div>
        {result && !result.success && (
          <Alert variant="destructive">
            <AlertTitle>{t(`plugins.create.errors.${errorKey}`)}</AlertTitle>
            {result.errors && result.errors.length > 0 && (
              <AlertDescription>
                <ul className="list-disc pl-4">
                  {result.errors.map(message => (
                    <li key={message}>{message}</li>
                  ))}
                </ul>
              </AlertDescription>
            )}
          </Alert>
        )}
      </div>
    </AppFormDrawer>
  );
};
