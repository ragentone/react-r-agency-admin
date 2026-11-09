import { AppBrand } from '@core/layout/components/AppBrand.tsx';
import { PluginSlot } from '@core/plugin/PluginSlot.tsx';
import { cn } from '@ui/lib';
import { Tooltip, TooltipContent, TooltipTrigger } from '@ui/shad-cn/components/tooltip.tsx';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

import { useMenu, useMenuMinWidth } from '../hooks';
import type { MenuComponentVariant } from '../types.ts';
import { MenuComponentSlot } from './MenuComponentSlot.tsx';
import { MenuGroup, MenuRailGroup } from './MenuGroup.tsx';
import { MenuGroupDrawer } from './MenuGroupDrawer.tsx';
import { MenuItemAction, MenuItemBadge, MenuItemIcon } from './MenuParts.tsx';
import { MenuSectionTrigger } from './MenuSectionDrawer.tsx';
import { useMenuText } from './use.menu.text.ts';

const noop = () => undefined;

/**
 * Desktop navigation (from `md`): icon rail, expanded with labels and sections from `xl`.
 */
const MenuSidebar = ({ className }: { className?: string }) => {
  const { t } = useTranslation('menu');
  const text = useMenuText();
  const { sections, footer, ctx, hidden, items } = useMenu();
  const variant: MenuComponentVariant = useMenuMinWidth(1280) ? 'sidebar' : 'rail';

  if (hidden || items.length === 0) return null;

  return (
    <nav
      aria-label={t('label')}
      className={cn(
        'relative z-10 hidden h-full w-19 shrink-0 flex-col border-r border-border/50 bg-background md:flex xl:w-80',
        className
      )}
    >
      {/* Brand (replaces the old header on desktop). */}
      <AppBrand
        className={'justify-center px-3 pt-3 pb-1 xl:justify-start xl:px-4'}
        textClassName={'hidden xl:flex'}
      />
      <div className={'flex grow flex-col gap-1 overflow-y-auto overflow-x-hidden px-3 py-3'}>
        <PluginSlot name={'menu_before.widget'} scope={'admin'} className={'flex flex-col gap-1'} />
        {sections.map((section, sectionIndex) => (
          <div key={section.id} className={'flex flex-col gap-1'}>
            {sectionIndex > 0 && <div className={'mx-auto my-2 h-px w-8 bg-border xl:mx-0 xl:w-full xl:bg-border/50'} />}
            {section.config.display === 'drawer' ? (
              // Only the trigger – the entries open in the bottom drawer.
              <MenuSectionTrigger section={section} variant={variant} />
            ) : (
              <>
                {section.nodes.map(node => {
                  if (node.type === 'component') {
                    return (
                      <MenuComponentSlot
                        key={`c:${node.id}`}
                        entry={node.component}
                        variant={variant}
                        ctx={ctx}
                        close={noop}
                      />
                    );
                  }
                  const item = node.item;
                  const label = text(item.entry.label);
                  if (item.children?.length && item.entry.display === 'drawer') {
                    // Bottom drawer instead of an expanded list / popover.
                    return <MenuGroupDrawer key={item.entry.id} item={item} variant={variant} />;
                  }
                  if (item.children?.length) {
                    // Expanded sidebar: collapsible list – icon rail: popover with the children.
                    return variant === 'sidebar' ? (
                      <MenuGroup key={item.entry.id} item={item} ctx={ctx} variant={'sidebar'} />
                    ) : (
                      <MenuRailGroup key={item.entry.id} item={item} ctx={ctx} />
                    );
                  }
                  return (
                    <Tooltip key={item.entry.id}>
                      <TooltipTrigger asChild>
                        <span className={'flex'}>
                          <MenuItemAction
                            item={item}
                            ctx={ctx}
                            label={label}
                            className={cn(
                              'group relative flex h-12 w-full items-center justify-center gap-4 rounded-full p-3 outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring/50 xl:justify-start xl:px-4',
                              item.active
                                ? 'text-foreground'
                                : 'text-muted-foreground hover:bg-foreground/6 hover:text-foreground'
                            )}
                          >
                            {item.active && (
                              <motion.span
                                layoutId={'main-menu-side-active'}
                                transition={{ type: 'spring', stiffness: 480, damping: 38 }}
                                className={'absolute inset-0 rounded-full bg-foreground/8'}
                              />
                            )}
                            <span className={'relative flex'}>
                              <MenuItemIcon item={item} />
                              <MenuItemBadge
                                item={item}
                                variant={'dot'}
                                className={'absolute -right-1.5 -top-1.5 xl:hidden'}
                              />
                            </span>
                            <span
                              className={cn(
                                'relative hidden min-w-0 flex-1 truncate text-title xl:block',
                                item.active ? 'font-bold' : 'font-medium'
                              )}
                            >
                              {label}
                            </span>
                            <MenuItemBadge
                              item={item}
                              className={'relative hidden xl:inline-flex'}
                            />
                          </MenuItemAction>
                        </span>
                      </TooltipTrigger>
                      <TooltipContent side={'right'} sideOffset={6} className={'xl:hidden'}>
                        {label}
                      </TooltipContent>
                    </Tooltip>
                  );
                })}
              </>
            )}
          </div>
        ))}
        <PluginSlot name={'menu_after.widget'} scope={'admin'} className={'flex flex-col gap-1'} />
      </div>
      {footer.length > 0 && (
        <div className={'flex flex-col gap-1 border-t border-border/50 px-3 py-2'}>
          {footer.map(entry => (
            <MenuComponentSlot
              key={entry.id}
              entry={entry}
              variant={variant}
              ctx={ctx}
              close={noop}
            />
          ))}
        </div>
      )}
    </nav>
  );
};

export { MenuSidebar };
