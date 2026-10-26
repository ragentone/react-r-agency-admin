import { MenuSettingRow } from '@core/menu/components/widgets/MenuSettingRow.tsx';
import type { IMenuComponentProps } from '@core/menu/types.ts';
import { Button } from '@ui/shad-cn/components/button.tsx';
import { RefreshCw } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { usePwa } from './use.pwa.ts';

/**
 * Settings drawer entry "New version" – only while a new service worker is waiting.
 * The update is started here (no automatic drawer / toast anymore).
 */
export const PwaSettingsUpdate = ({ variant }: IMenuComponentProps) => {
  const { t } = useTranslation('pwa');
  const { needRefresh, update, version, available } = usePwa();
  const [updating, setUpdating] = useState(false);

  if (!needRefresh) return null;

  const to = available?.version ?? null;
  const text = to
    ? version
      ? t('update.settingsVersion', { from: version, to })
      : t('update.settingsVersionNew', { to })
    : t('update.settingsText');

  const onUpdate = () => {
    if (updating) return;
    setUpdating(true);
    // The page reloads once the new worker is active.
    void update();
  };

  return (
    <div role={'status'} aria-live={'polite'} data-slot={'pwa-settings-update'}>
      <MenuSettingRow
        variant={variant}
        icon={RefreshCw}
        label={variant === 'rail' ? t('update.title') : t('update.settingsTitle')}
        description={updating ? t('update.updating') : text}
        valueLabel={updating ? t('update.updating') : undefined}
        busy={updating}
        attention
        highlight
        onCycle={onUpdate}
        control={
          <Button size={'sm'} onClick={onUpdate} disabled={updating}>
            {t('update.action')}
          </Button>
        }
      />
    </div>
  );
};
