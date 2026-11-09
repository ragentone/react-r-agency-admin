import { AppDrawer } from '@ui/patterns';
import { useTranslation } from 'react-i18next';

import { MENU_SETTINGS_DRAWER_SIDE } from '../const.ts';
import { useMenu } from '../hooks';
import { MenuComponentSlot } from './MenuComponentSlot.tsx';

interface IProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Settings bottom drawer (swipe down / back / overlay closes it).
 * Renders all menu components registered with `placement: 'settings'` (language, theme …).
 */
const MenuSettingsDrawer = ({ open, onOpenChange }: IProps) => {
  const { t } = useTranslation('menu');
  const { settings, ctx } = useMenu();
  const close = () => onOpenChange(false);

  return (
    <AppDrawer
      open={open}
      onOpenChange={onOpenChange}
      title={t('settings.quick')}
      description={t('settings.description')}
      closeLabel={t('settings.close')}
      direction={MENU_SETTINGS_DRAWER_SIDE}
      size={'auto'}
      bodyClassName={'px-1 pt-2'}
    >
      <ul className={'flex flex-col'}>
        {settings.map(entry => (
          <li key={entry.id}>
            <MenuComponentSlot entry={entry} variant={'drawer'} ctx={ctx} close={close} />
          </li>
        ))}
      </ul>
    </AppDrawer>
  );
};

export { MenuSettingsDrawer };
