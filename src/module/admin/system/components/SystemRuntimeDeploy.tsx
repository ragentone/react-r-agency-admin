import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@ui/shad-cn/components/alert-dialog.tsx';
import { Button } from '@ui/shad-cn/components/button.tsx';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { SystemApi } from '../api';

/** Starts a runtime deploy (origin/main, with DB backup). Confirmed in a dialog first. */
export const SystemRuntimeDeploy: React.FC<{ running: boolean; onStarted: () => void }> = ({
  running,
  onStarted,
}) => {
  const { t } = useTranslation('admin');
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  const start = async () => {
    setBusy(true);
    const result = await SystemApi.runtimeDeploy();
    setBusy(false);
    if (!result.success) {
      toast.error(
        t(
          result.error === 'running'
            ? 'system.deployments.deploy.running'
            : 'system.deployments.deploy.error'
        )
      );
      return;
    }
    toast.success(t('system.deployments.deploy.started'));
    onStarted();
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="rounded-full font-bold"
        disabled={running || busy}
        onClick={() => setOpen(true)}
      >
        {running ? t('system.deployments.deploy.running') : t('system.deployments.deploy.button')}
      </Button>
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('system.deployments.deploy.confirmTitle')}</AlertDialogTitle>
            <AlertDialogDescription>{t('system.deployments.deploy.confirmText')}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('system.deployments.deploy.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={() => void start()}>
              {t('system.deployments.deploy.confirm')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
