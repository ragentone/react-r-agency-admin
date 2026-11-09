import { MenuSettingRow } from '@core/menu/components/widgets/MenuSettingRow.tsx';
import type { IMenuComponentProps } from '@core/menu/types.ts';
import { MonitorDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { usePwa } from './use.pwa.ts';

/** Settings entry "Install app" – only while installing is possible. */
export const PwaMenuInstall = ({ variant, close }: IMenuComponentProps) => {
  const { t } = useTranslation('pwa');
  const { canInstall, iosInstallable, openInstallSheet } = usePwa();
  if (!canInstall && !iosInstallable) return null;

  const onSelect = () => {
    close();
    // Let the menu close first (back-button history), then open the sheet.
    window.setTimeout(openInstallSheet, variant === 'drawer' ? 320 : 0);
  };

  return (
    <MenuSettingRow
      variant={variant}
      icon={MonitorDown}
      label={t('install.menu')}
      onSelect={onSelect}
      navigates
    />
  );
};
