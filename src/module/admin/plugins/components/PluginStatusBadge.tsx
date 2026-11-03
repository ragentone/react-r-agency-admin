import { Status, StatusIndicator, StatusLabel } from '@ui/shad-cn/components/status.tsx';
import React from 'react';
import { useTranslation } from 'react-i18next';

import type { PluginStatus } from '../types';

/** Color only says the state: active is green, draft is orange, the rest stays neutral. */
const TONE: Record<PluginStatus, 'success' | 'warning' | 'info' | 'default'> = {
  active: 'success',
  installed: 'info',
  inactive: 'default',
  draft: 'warning',
};

interface IPluginStatusBadgeProps {
  status: PluginStatus;
}

/** Status of a plugin as a small pill with its label. */
export const PluginStatusBadge: React.FC<IPluginStatusBadgeProps> = ({ status }) => {
  const { t } = useTranslation('admin');
  return (
    <Status variant={TONE[status]}>
      <StatusIndicator />
      <StatusLabel>{t(`plugins.status.${status}`)}</StatusLabel>
    </Status>
  );
};
