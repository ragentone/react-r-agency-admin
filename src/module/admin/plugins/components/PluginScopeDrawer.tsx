import { AppFormDrawer } from '@ui/patterns';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import type { IPluginListItem, PluginScope } from '../types';
import { PluginScopeCheckboxes } from './PluginScopeCheckboxes';

interface IPluginScopeDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  plugin: IPluginListItem;
  onSave: (scope: PluginScope[]) => Promise<boolean>;
}

/** Changes where a plugin runs. Closes after a successful save. */
export const PluginScopeDrawer: React.FC<IPluginScopeDrawerProps> = ({ open, onOpenChange, plugin, onSave }) => {
  const { t } = useTranslation('admin');
  const [scope, setScope] = useState<PluginScope[]>(plugin.scope);
  const [busy, setBusy] = useState(false);

  // Start from the stored scope every time the drawer opens.
  useEffect(() => {
    if (open) setScope(plugin.scope);
  }, [open, plugin.scope]);

  const changed =
    scope.length > 0 &&
    (scope.length !== plugin.scope.length || scope.some(item => !plugin.scope.includes(item)));

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!changed) return;
    setBusy(true);
    const ok = await onSave(scope);
    setBusy(false);
    if (ok) onOpenChange(false);
  };

  return (
    <AppFormDrawer
      autoHeight={true}
      open={open}
      onOpenChange={next => {
        if (!busy) onOpenChange(next);
      }}
      title={t('plugins.scope.drawerTitle')}
      description={t('plugins.scope.description')}
      onSubmit={submit}
      submitLabel={busy ? t('plugins.scope.busy') : t('plugins.scope.submit')}
      submitDisabled={!changed}
      busy={busy}
      locked={busy}
    >
      <div className="flex flex-col gap-4 px-4 py-3">
        <PluginScopeCheckboxes value={scope} onChange={setScope} disabled={busy} />
        <p className="text-caption text-muted-foreground">{t('plugins.create.scope.hint')}</p>
      </div>
    </AppFormDrawer>
  );
};
