import { MenuSettingRow } from '@core/menu/components/widgets/MenuSettingRow.tsx';
import type { IMenuComponentProps } from '@core/menu/types.ts';
import { callNative, isNativeApp } from '@core/native';
import { RefreshCcw } from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next';

/** Settings drawer: reload the app (native shell or browser). */
const NativeControl = ({ variant }: IMenuComponentProps) => {
  const { t } = useTranslation('native');
  const [reload, setReload] = React.useState(false);

  const handleReload = () => {
    setReload(true);
    setTimeout(() => {
      if (isNativeApp()) {
        void callNative('app.reload', null);
      } else {
        window.location.reload();
      }
    }, 250);
  };

  return (
    <MenuSettingRow
      variant={variant}
      icon={RefreshCcw}
      label={t('button.reload')}
      description={t('button.reloadDescription')}
      busy={reload}
      onSelect={handleReload}
    />
  );
};

export { NativeControl };
