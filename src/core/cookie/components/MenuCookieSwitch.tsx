import { MenuSettingRow } from '@core/menu/components/widgets/MenuSettingRow.tsx';
import type { IMenuComponentProps } from '@core/menu/types.ts';
import { Cookie } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { useCookieStore } from '../store.ts';

/** Settings drawer: opens the cookie consent dialog. */
export const MenuCookieSwitch = ({ variant, close }: IMenuComponentProps) => {
  const { t } = useTranslation('cookie');

  const open = () => {
    close?.();
    useCookieStore.getState().open();
  };

  return (
    <MenuSettingRow
      variant={variant}
      icon={Cookie}
      label={t('title', 'Cookie-Einstellungen')}
      description={t('actions.manage', 'Einstellungen verwalten')}
      onSelect={open}
      navigates
    />
  );
};
