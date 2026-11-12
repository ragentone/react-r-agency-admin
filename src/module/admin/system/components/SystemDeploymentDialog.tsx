import { AppDrawer } from '@ui/patterns';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import type { ISystemRelease, SystemDeployApp } from '../types';
import { SystemReleasePlan } from './SystemReleasePlan';

/** Drawer with the deployment configuration (next version, what is new, required) of one line. */
export const SystemDeploymentDialog: React.FC<{
  app: SystemDeployApp;
  release: ISystemRelease;
  onClose: () => void;
  onSaved: () => void;
}> = ({ app, release, onClose, onSaved }) => {
  const { t } = useTranslation('admin');
  const scope = t(`system.deployments.scope.${app}`);
  // Mounted closed, opened after the first frame, so the slide-in animation runs.
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setOpen(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <AppDrawer
      open={open}
      onOpenChange={setOpen}
      onOpenChangeComplete={done => !done && onClose()}
      title={t('system.deployments.dialog.title', { scope })}
      description={t('system.deployments.dialog.description')}
      size="full"
      autoHeight={true}
    >
      <SystemReleasePlan
        app={app}
        release={release}
        onSaved={() => {
          onSaved();
          setOpen(false);
        }}
      />
    </AppDrawer>
  );
};
