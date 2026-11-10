import { AppDrawer } from '@ui/patterns';
import { Button } from '@ui/shad-cn/components/button.tsx';
import { Item, ItemActions, ItemContent, ItemDescription, ItemTitle } from '@ui/shad-cn/components/item.tsx';
import { Status } from '@ui/shad-cn/components/status.tsx';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { usePluginReleases } from '../hooks/use-plugin-releases';
import type { IPluginRelease } from '../types';

interface IPluginDetailReleasesProps {
  pluginId: string;
}

const formatSize = (bytes: number): string =>
  bytes < 1024 * 1024 ? `${Math.max(1, Math.round(bytes / 1024))} KB` : `${(bytes / (1024 * 1024)).toFixed(1)} MB`;

/** Every release ZIP in the `dist/` folder of a development project. The current version cannot be deleted. */
export const PluginDetailReleases: React.FC<IPluginDetailReleasesProps> = ({ pluginId }) => {
  const { t } = useTranslation('admin');
  const state = usePluginReleases(pluginId);
  const [pending, setPending] = useState<IPluginRelease | null>(null);
  const [busy, setBusy] = useState(false);

  const confirmRemove = async () => {
    if (!pending) return;
    setBusy(true);
    const result = await state.remove(pending.version);
    setBusy(false);
    if (result.success) {
      toast.success(t('plugins.releases.success', { version: pending.version }));
      setPending(null);
    } else {
      toast.error(
        t(`plugins.releases.errors.${result.error ?? 'unknown'}`, { defaultValue: t('plugins.releases.errors.unknown') })
      );
    }
  };

  if (state.loading) return <p className="text-caption text-muted-foreground">{t('plugins.releases.loading')}</p>;
  if (state.error) return <p className="text-caption text-destructive">{t('plugins.releases.loadError')}</p>;
  if (state.releases.length === 0) return <p className="text-caption text-muted-foreground">{t('plugins.releases.empty')}</p>;

  return (
    <section className="flex flex-col gap-2">
      <h2 className="text-body font-bold">{t('plugins.releases.title')}</h2>
      <p className="text-caption text-muted-foreground">{t('plugins.releases.description')}</p>
      {state.releases.map(release => (
        <Item key={release.version} variant="outline" size="sm">
          <ItemContent>
            <ItemTitle className="flex flex-wrap items-center gap-2">
              <Status variant={'info'}>{release.version}</Status>
              {release.current && <Status variant={'success'}>{t('plugins.releases.current')}</Status>}
            </ItemTitle>
            <ItemDescription>
              {`${release.filename} · ${formatSize(release.size)} · ${new Date(release.modifiedAt).toLocaleString()}`}
            </ItemDescription>
          </ItemContent>
          <ItemActions>
            <Button
              variant="ghost"
              size="sm"
              disabled={release.current || busy}
              title={release.current ? t('plugins.releases.currentHint') : undefined}
              onClick={() => setPending(release)}
            >
              {t('plugins.releases.remove')}
            </Button>
          </ItemActions>
        </Item>
      ))}

      <AppDrawer
        open={pending !== null}
        onOpenChange={open => {
          if (!open && !busy) setPending(null);
        }}
        title={t('plugins.releases.removeTitle', { version: pending?.version ?? '' })}
        description={t('plugins.releases.removeDescription')}
        size="auto"
        locked={busy}
      >
        <div className="flex flex-col gap-2 px-4 py-4">
          <Button variant="destructive" size="lg" disabled={busy || !pending} onClick={() => void confirmRemove()}>
            {busy ? t('plugins.releases.busy') : t('plugins.releases.confirm')}
          </Button>
          <Button variant="ghost" size="lg" disabled={busy} onClick={() => setPending(null)}>
            {t('plugins.releases.cancel')}
          </Button>
        </div>
      </AppDrawer>
    </section>
  );
};
