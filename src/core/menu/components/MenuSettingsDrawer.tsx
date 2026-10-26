import { cn } from '@ui/lib';
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerTitle,
} from '@ui/shad-cn/components/drawer.tsx';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { MENU_SETTINGS_DRAWER_SIDE } from '../const.ts';
import { useMenu } from '../hooks';
import { MenuComponentSlot } from './MenuComponentSlot.tsx';

interface IProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Settings drawer sliding in from the right (swipe right / back / overlay closes it).
 * Renders all menu components registered with `placement: 'settings'` (language, theme …).
 */
const MenuSettingsDrawer = ({ open, onOpenChange }: IProps) => {
  const { t } = useTranslation('menu');
  const { settings, ctx } = useMenu();
  const close = () => onOpenChange(false);

  return (
    <Drawer
      open={open}
      onOpenChange={next => onOpenChange(next)}
      swipeDirection={MENU_SETTINGS_DRAWER_SIDE}
    >
      <DrawerContent
        className={
          'data-[swipe-axis=x]:[--drawer-content-width:min(86vw,22rem)] [--drawer-inset:0px] rounded-none rounded-l-3xl border-0 border-l border-border/50 bg-background'
        }
      >
        <div
          className={
            'flex h-full min-h-0 flex-col pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]'
          }
        >
          <div className={'flex items-center justify-between gap-2 py-3 pr-3 pl-6'}>
            <div className={'min-w-0 flex-1'}>
              <DrawerTitle className={'truncate text-title font-bold tracking-tight'}>
                {t('settings.quick')}
              </DrawerTitle>
              <DrawerDescription className={'truncate text-caption text-muted-foreground'}>
                {t('settings.description')}
              </DrawerDescription>
            </div>
            <button
              type={'button'}
              aria-label={t('settings.close')}
              onClick={close}
              className={
                'flex size-10 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-foreground/[0.06] hover:text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring/50'
              }
            >
              <X className={'size-5'} />
            </button>
          </div>

          <div
            className={cn(
              'min-h-0 flex-1 overflow-y-auto overscroll-contain border-t border-border/50 px-3 py-3'
            )}
          >
            <ul className={'flex flex-col gap-1'}>
              {settings.map((entry, i) => (
                <motion.li
                  key={entry.id}
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{
                    delay: 0.08 + Math.min(i, 12) * 0.03,
                    duration: 0.25,
                    ease: 'easeOut',
                  }}
                >
                  <MenuComponentSlot entry={entry} variant={'drawer'} ctx={ctx} close={close} />
                </motion.li>
              ))}
            </ul>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export { MenuSettingsDrawer };
