import { MenuSettingRow } from '@core/menu/components/widgets/MenuSettingRow.tsx';
import type { IMenuComponentProps } from '@core/menu/types.ts';
import { Switch } from '@ui/shad-cn/components/switch.tsx';
import { Bell, BellOff } from 'lucide-react';
import { useId } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { usePushStore } from '../push';

/** Settings drawer: push notifications on / off for this device. */
export const PushSettingsSwitch = ({ variant }: IMenuComponentProps) => {
  const { t } = useTranslation('push');
  const id = useId();
  const status = usePushStore(state => state.status);
  const busy = usePushStore(state => state.busy);

  if (status === 'unknown' || status === 'unsupported' || status === 'disabled') return null;

  const on = status === 'on';
  const denied = status === 'denied';
  const toggle = async () => {
    if (denied) return void toast.info(t('settings.deniedHint'));
    if (on) return void (await usePushStore.getState().disable());
    const result = await usePushStore.getState().enable();
    if (result === 'on') toast.success(t('result.on'));
    else if (result === 'denied') toast.error(t('result.denied'));
    else if (result !== 'default') toast.error(t('result.failed'));
  };

  return (
    <MenuSettingRow
      variant={variant}
      icon={on ? Bell : BellOff}
      label={t('settings.label')}
      valueLabel={denied ? t('settings.denied') : on ? t('settings.on') : t('settings.off')}
      onCycle={() => void toggle()}
      controlId={id}
      control={
        <Switch
          id={id}
          checked={on}
          disabled={busy}
          onCheckedChange={() => void toggle()}
          aria-label={t('settings.label')}
          title={denied ? t('settings.deniedHint') : undefined}
        />
      }
    />
  );
};
