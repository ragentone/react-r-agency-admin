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

export type SystemDeployKind = 'runtime' | 'frontend' | 'admin';

/** Deploy button with a confirmation for one release line. Shown on the live server only. */
export const SystemDeployButton: React.FC<{
  kind: SystemDeployKind;
  running: boolean;
  /** Another deploy is running, so this one must wait (button disabled, label unchanged). */
  blocked?: boolean;
  start: () => Promise<{ success: boolean; error?: string }>;
  onStarted: () => void;
}> = ({ kind, running, blocked = false, start, onStarted }) => {
  const { t } = useTranslation('admin');
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  const run = async () => {
    setBusy(true);
    const result = await start();
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
        disabled={running || busy || blocked}
        onClick={() => setOpen(true)}
      >
        {running
          ? t('system.deployments.deploy.running')
          : t(`system.deployments.deploy.${kind}.button`)}
      </Button>
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t(`system.deployments.deploy.${kind}.confirmTitle`)}</AlertDialogTitle>
            <AlertDialogDescription>
              {t(`system.deployments.deploy.${kind}.confirmText`)}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('system.deployments.deploy.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={() => void run()}>
              {t('system.deployments.deploy.confirm')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
