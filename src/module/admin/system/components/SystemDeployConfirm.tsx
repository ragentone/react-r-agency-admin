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
import React from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import type { IStatsResult } from '../../stats/api';
import type { SystemDeployKind } from './SystemDeployButton';

/** Confirmation of a deploy, opened from the actions menu of a line. Starts the deploy on confirm. */
export const SystemDeployConfirm: React.FC<{
  kind: SystemDeployKind;
  start: () => Promise<IStatsResult>;
  onStarted: () => void;
  onClose: () => void;
}> = ({ kind, start, onStarted, onClose }) => {
  const { t } = useTranslation('admin');

  const run = async () => {
    onClose();
    const result = await start();
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
    <AlertDialog open onOpenChange={open => !open && onClose()}>
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
  );
};
