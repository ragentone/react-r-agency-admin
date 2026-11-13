import { AppDialog } from '@ui/components';
import { Button } from '@ui/shad-cn/components/button.tsx';
import { Skeleton } from '@ui/shad-cn/components/skeleton.tsx';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { useBds } from '../hooks/use-bds';

const mb = (bytes: number) => (bytes / 1024 / 1024).toFixed(1);
const progressText = (p: { received: number; total: number | null }) =>
  p.total ? `${mb(p.received)} / ${mb(p.total)} MB` : `${mb(p.received)} MB`;

/** BDS (Bedrock Dedicated Server) installieren/aktualisieren, nur im nativen Modus nötig. */
export const BdsDialog: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { t } = useTranslation('minecraft');
  const { status, failed, starting, startError, install } = useBds();
  const working = status?.phase === 'downloading' || status?.phase === 'installing';
  const upToDate = !!status?.installed && !!status.latest && status.version === status.latest;
  const code = startError ?? (status?.phase === 'error' ? status.error : null);
  const label = status?.installed ? 'bds.update' : 'bds.install';

  return (
    <AppDialog
      open
      onOpenChange={open => !open && onClose()}
      title={t('bds.title')}
      description={t('bds.text')}
      size="sm"
      bodyClassName="flex flex-col gap-3 p-4"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            {t('bds.close')}
          </Button>
          <Button
            isLoading={starting || working}
            disabled={!status?.native || upToDate || !status?.latest}
            onClick={() => void install()}
          >
            {t(upToDate ? 'bds.current' : label)}
          </Button>
        </>
      }
    >
      {!status && !failed && <Skeleton className="h-20 w-full" aria-label={t('bds.loading')} />}
      {failed && !status && (
        <p role="alert" className="text-caption text-destructive">
          {t('bds.loadError')}
        </p>
      )}
      {status && !status.native && (
        <p className="text-caption text-muted-foreground">{t('bds.docker')}</p>
      )}
      {status?.native && (
        <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-body">
          <dt className="text-muted-foreground">{t('bds.installed')}</dt>
          <dd>{status.installed ? (status.version ?? t('bds.unknownVersion')) : t('bds.none')}</dd>
          <dt className="text-muted-foreground">{t('bds.latest')}</dt>
          <dd>{status.latest ?? t('bds.latestUnknown')}</dd>
        </dl>
      )}
      {working && (
        <p role="status" className="text-caption text-muted-foreground">
          {t(`bds.phase.${status?.phase}`)}
          {status?.phase === 'downloading' &&
            status.progress &&
            ` ${progressText(status.progress)}`}
        </p>
      )}
      {status?.phase === 'done' && !code && (
        <p role="status" className="text-caption">
          {t('bds.done')}
        </p>
      )}
      {code && (
        <p role="alert" className="text-caption text-destructive">
          {t(`bds.error.${code}`, { defaultValue: t('action.error.unknown') })}
        </p>
      )}
    </AppDialog>
  );
};
