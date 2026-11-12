import { AppDialog } from '@ui/components';
import React from 'react';
import { useTranslation } from 'react-i18next';

import type { ISystemRelease, SystemDeployApp } from '../types';
import { SystemReleasePlan } from './SystemReleasePlan';

/** Dialog with the deployment configuration (next version, what is new, required) of one line. */
export const SystemDeploymentDialog: React.FC<{
  app: SystemDeployApp;
  release: ISystemRelease;
  onClose: () => void;
  onSaved: () => void;
}> = ({ app, release, onClose, onSaved }) => {
  const { t } = useTranslation('admin');
  const scope = t(`system.deployments.scope.${app}`);
  return (
    <AppDialog
      open
      onOpenChange={open => !open && onClose()}
      title={t('system.deployments.dialog.title', { scope })}
      description={t('system.deployments.dialog.description')}
      size="md"
    >
      <SystemReleasePlan
        app={app}
        release={release}
        onSaved={() => {
          onSaved();
          onClose();
        }}
      />
    </AppDialog>
  );
};
