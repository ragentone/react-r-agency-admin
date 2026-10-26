import { MenuSettingRow } from '@core/menu/components/widgets/MenuSettingRow.tsx';
import type { IMenuComponentProps } from '@core/menu/types.ts';
import { Switch } from '@ui/shad-cn/components/switch.tsx';
import { Volume2, VolumeX } from 'lucide-react';
import { useId } from 'react';
import { useTranslation } from 'react-i18next';

import { playNotifySound, useNotifySoundStore } from '../sound';

/** Settings drawer: notification sound on / off switch. */
export const NotifySoundSettingsSwitch = ({ variant }: IMenuComponentProps) => {
  const { t } = useTranslation('notify');
  const id = useId();
  const soundEnabled = useNotifySoundStore(state => state.soundEnabled);
  const setSoundEnabled = useNotifySoundStore(state => state.setSoundEnabled);

  const toggle = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    if (next) {
      playNotifySound();
    }
  };

  return (
    <MenuSettingRow
      variant={variant}
      icon={soundEnabled ? Volume2 : VolumeX}
      label={t('settings.soundLabel')}
      valueLabel={soundEnabled ? t('settings.on') : t('settings.off')}
      onCycle={toggle}
      controlId={id}
      control={
        <Switch
          id={id}
          checked={soundEnabled}
          onCheckedChange={toggle}
          aria-label={t('settings.soundLabel')}
        />
      }
    />
  );
};
