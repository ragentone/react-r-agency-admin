import { withSudo } from '@core/security';
import { AppDrawer } from '@ui/patterns/drawer';
import { Button } from '@ui/shad-cn/components/button.tsx';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { AdminMonitorApi } from '../../api';
import type { IMonitorProcess } from '../../types';
import { formatBytes } from '../../utils';

type Signal = 'SIGTERM' | 'SIGKILL';

/** Details of a process and the two ways to stop it (asks to confirm the identity first). */
export const MonitorKillDrawer: React.FC<{
  process: IMonitorProcess | null;
  onClose: () => void;
}> = ({ process, onClose }) => {
  const { t } = useTranslation('admin-monitor');
  const [busy, setBusy] = useState<Signal | null>(null);

  const stop = async (signal: Signal) => {
    if (!process) return;
    setBusy(signal);
    const result = await withSudo(() => AdminMonitorApi.kill(process.pid, signal));
    setBusy(null);
    if (result.success) {
      toast.success(t('kill.done', { name: process.name }));
      onClose();
    } else if (result.error !== 'sudo_required') {
      toast.error(
        t(`kill.error.${result.error ?? 'unknown'}`, { defaultValue: t('kill.error.unknown') })
      );
    }
  };

  return (
    <AppDrawer
      open={process !== null}
      onOpenChange={open => !open && onClose()}
      title={process?.name ?? ''}
      description={t('kill.description')}
      size="auto"
      locked={busy !== null}
      footer={
        <div className="flex flex-col gap-2">
          <Button
            variant="outline"
            size="xl"
            fullWidth
            isLoading={busy === 'SIGTERM'}
            disabled={busy !== null}
            onClick={() => void stop('SIGTERM')}
          >
            {t('kill.terminate')}
          </Button>
          <Button
            variant="destructive"
            size="xl"
            fullWidth
            isLoading={busy === 'SIGKILL'}
            disabled={busy !== null}
            onClick={() => void stop('SIGKILL')}
          >
            {t('kill.force')}
          </Button>
        </div>
      }
    >
      {process && (
        <dl className="flex flex-col gap-3 p-4 text-body">
          <div>
            <dt className="text-caption text-muted-foreground">{t('kill.pid')}</dt>
            <dd className="tabular-nums">{process.pid}</dd>
          </div>
          <div>
            <dt className="text-caption text-muted-foreground">{t('kill.usage')}</dt>
            <dd className="tabular-nums">
              {process.cpu.toFixed(1)} % CPU · {formatBytes(process.mem)}
            </dd>
          </div>
          <div>
            <dt className="text-caption text-muted-foreground">{t('kill.command')}</dt>
            <dd className="break-all font-mono text-caption">{process.command}</dd>
          </div>
          <p className="text-caption text-muted-foreground">{t('kill.hint')}</p>
        </dl>
      )}
    </AppDrawer>
  );
};
