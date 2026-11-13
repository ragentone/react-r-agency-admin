import { RoleGate } from '@core/auth/roles/RoleGate.tsx';
import { AdminNoAccess } from '@module/admin/components';
import { RoutePage } from '@router/components';
import { Button } from '@ui/shad-cn/components/button.tsx';
import { Plus, Upload } from 'lucide-react';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { ADMIN_ROLES } from '../const';
import { useAdminAccess } from '../hooks';
import { PluginArea } from '../plugins/components/PluginArea';

/** `/admin/plugins`: installed plugins and plugin ZIP upload (own chunk). */
export const PageAdminPlugins: React.FC = () => {
  const { t } = useTranslation('admin');
  const [uploadOpen, setUploadOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const admin = useAdminAccess();

  return (
    <RoutePage
      width={680}
      scrollable={true}
      classes={{ scroll: 'p-0' }}
      header={{
        title: t('plugins.title'),
        // Buttons only for admins: the dialogs they open live in the area that non-admins never see.
        actions: admin ? (
          <>
            <Button
              variant="outline"
              size="icon-lg"
              aria-label={t('plugins.actions.upload')}
              onClick={() => setUploadOpen(true)}
            >
              <Upload className="size-5" />
            </Button>
            <Button
              size="icon-lg"
              aria-label={t('plugins.actions.create')}
              onClick={() => setCreateOpen(true)}
            >
              <Plus className="size-5" />
            </Button>
          </>
        ) : undefined,
      }}
    >
      <RoleGate roles={ADMIN_ROLES} fallback={<AdminNoAccess />}>
        <PluginArea
          uploadOpen={uploadOpen}
          setUploadOpen={setUploadOpen}
          createOpen={createOpen}
          setCreateOpen={setCreateOpen}
        />
      </RoleGate>
    </RoutePage>
  );
};
