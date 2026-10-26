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

import { MENU_DRAWER_SIDE } from '../const.ts';
import { useMenu } from '../hooks';
import { useMenuSectionDrawerStore } from '../store.ts';
import { MenuComponentSlot } from './MenuComponentSlot.tsx';
import { MenuGroup } from './MenuGroup.tsx';
import { MenuGroupDrawer } from './MenuGroupDrawer.tsx';
import { MenuItemAction, MenuItemBadge, MenuItemIcon } from './MenuParts.tsx';
import { MenuSectionTrigger } from './MenuSectionDrawer.tsx';
import { useMenuText } from './use.menu.text.ts';

interface IProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/** Mobile main menu: drawer sliding in from the left (swipe left / back / overlay closes it). */
const MenuDrawer = ({ open, onOpenChange }: IProps) => {
  const { t } = useTranslation('menu');
  const text = useMenuText();
  const { sections, footer, ctx } = useMenu();
  const close = () => onOpenChange(false);

  // Rows of a section: `display: 'drawer'` sections only show their trigger.
  const rowsOf = (section: (typeof sections)[number]) =>
    section.config.display === 'drawer' ? 1 : section.nodes.length;
  // Running index over all sections → staggered entrance.
  const offsets = sections.reduce<number[]>(
    (acc, _section, i) => [...acc, i === 0 ? 0 : acc[i - 1] + rowsOf(sections[i - 1])],
    []
  );

  return (
    <Drawer open={open} onOpenChange={next => onOpenChange(next)} swipeDirection={MENU_DRAWER_SIDE}>
      <DrawerContent
        // Switching to the bottom drawer (apps, user): don't move the focus back to the dock trigger.
        finalFocus={() => !useMenuSectionDrawerStore.getState().target}
        className={
          'data-[swipe-axis=x]:[--drawer-content-width:min(86vw,22rem)] [--drawer-inset:0px] rounded-none rounded-r-3xl border-0 border-r border-border/50 bg-background'
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
                {t('label')}
              </DrawerTitle>
              <DrawerDescription className={'sr-only'}>{t('description')}</DrawerDescription>
            </div>
            <button
              type={'button'}
              aria-label={t('close')}
              onClick={close}
              className={
                'flex size-10 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-foreground/[0.06] hover:text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring/50'
              }
            >
              <X className={'size-5'} />
            </button>
          </div>

          <nav
            aria-label={t('label')}
            className={'min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 pb-3'}
          >
            {sections.map((section, sectionIndex) =>
              section.config.display === 'drawer' ? (
                // Only the trigger – the entries open in the bottom drawer (main menu closes).
                <section
                  key={section.id}
                  aria-label={text(section.config.label)}
                  className={cn(sectionIndex > 0 && 'mt-2 border-t border-border/50 pt-2')}
                >
                  <motion.div
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{
                      delay: 0.08 + Math.min(offsets[sectionIndex], 12) * 0.03,
                      duration: 0.25,
                      ease: 'easeOut',
                    }}
                  >
                    <MenuSectionTrigger section={section} variant={'drawer'} onBeforeOpen={close} />
                  </motion.div>
                </section>
              ) : (
                <section
                  key={section.id}
                  className={cn(sectionIndex > 0 && 'mt-2 border-t border-border/50 pt-2')}
                >
                  <h3
                    className={
                      'px-3 pt-3 pb-1 text-micro font-semibold uppercase tracking-wider text-muted-foreground'
                    }
                  >
                    {text(section.config.label)}
                  </h3>
                  <ul className={'flex flex-col gap-0.5'}>
                    {section.nodes.map((node, i) => {
                      const delay = Math.min(offsets[sectionIndex] + i, 12) * 0.03;
                      const motionProps = {
                        initial: { opacity: 0, x: -16 },
                        animate: { opacity: 1, x: 0 },
                        transition: {
                          delay: 0.08 + delay,
                          duration: 0.25,
                          ease: 'easeOut' as const,
                        },
                      };
                      if (node.type === 'component') {
                        return (
                          <motion.li key={`c:${node.id}`} {...motionProps}>
                            <MenuComponentSlot
                              entry={node.component}
                              variant={'drawer'}
                              ctx={ctx}
                              close={close}
                            />
                          </motion.li>
                        );
                      }
                      const item = node.item;
                      const label = text(item.entry.label);
                      if (item.children?.length && item.entry.display === 'drawer') {
                        return (
                          <motion.li key={item.entry.id} {...motionProps}>
                            <MenuGroupDrawer item={item} variant={'drawer'} onBeforeOpen={close} />
                          </motion.li>
                        );
                      }
                      if (item.children?.length) {
                        return (
                          <motion.li key={item.entry.id} {...motionProps}>
                            <MenuGroup
                              item={item}
                              ctx={ctx}
                              variant={'drawer'}
                              onAfterSelect={close}
                            />
                          </motion.li>
                        );
                      }
                      return (
                        <motion.li key={item.entry.id} {...motionProps}>
                          <MenuItemAction
                            item={item}
                            ctx={ctx}
                            label={label}
                            onAfterSelect={close}
                            className={cn(
                              'relative flex w-full items-center gap-4 rounded-2xl px-3 py-2.5 text-left outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring/50 [-webkit-tap-highlight-color:transparent]',
                              item.active
                                ? 'bg-foreground/[0.07] text-foreground'
                                : 'text-foreground/90 active:bg-foreground/[0.06]'
                            )}
                          >
                            <MenuItemIcon item={item} />
                            <span className={'flex min-w-0 flex-1 flex-col'}>
                              <span
                                className={cn(
                                  'truncate text-title',
                                  item.active ? 'font-bold' : 'font-medium'
                                )}
                              >
                                {label}
                              </span>
                              {item.entry.description && (
                                <span className={'truncate text-caption text-muted-foreground'}>
                                  {text(item.entry.description)}
                                </span>
                              )}
                            </span>
                            <MenuItemBadge item={item} />
                            {item.entry.trailing}
                            {item.active && (
                              <span className={'size-1.5 shrink-0 rounded-full bg-foreground'} />
                            )}
                          </MenuItemAction>
                        </motion.li>
                      );
                    })}
                  </ul>
                </section>
              )
            )}
          </nav>

          {footer.length > 0 && (
            <div className={'shrink-0 border-t border-border/50 px-3 py-2'}>
              <h3 className={'sr-only'}>{t('settings.title')}</h3>
              <div className={'flex flex-col gap-0.5'}>
                {footer.map(entry => (
                  <MenuComponentSlot
                    key={entry.id}
                    entry={entry}
                    variant={'drawer'}
                    ctx={ctx}
                    close={close}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export { MenuDrawer };
