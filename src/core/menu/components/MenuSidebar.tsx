import { AppBrand } from '@core/layout/components/AppBrand.tsx';
import { PluginSlot } from '@core/plugin/PluginSlot.tsx';
import { cn } from '@ui/lib';
import { useTranslation } from 'react-i18next';

import { useMenu, useMenuMinWidth } from '../hooks';
import type { MenuComponentVariant } from '../types.ts';
import { MenuComponentSlot } from './MenuComponentSlot.tsx';
import { MenuSectionTrigger } from './MenuSectionDrawer.tsx';
import { MenuUserInfo } from './MenuUserInfo.tsx';
import { MenuSidebarItem } from './MenuSidebarItem.tsx';

const noop = () => undefined;

/**
 * Desktop navigation (from `md`): icon rail, expanded with labels and sections from `xl`.
 */
const MenuSidebar = ({ className }: { className?: string }) => {
  const { t } = useTranslation('menu');
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
      <MenuUserInfo ctx={ctx} textClassName={'hidden xl:flex'} />
      <div className={'flex grow flex-col gap-1 overflow-x-hidden overflow-y-auto px-3 py-3'}>
        <PluginSlot name={'menu_before.widget'} scope={'admin'} className={'flex flex-col gap-1'} />
        {sections.map((section, sectionIndex) => (
          <div key={section.id} className={'flex flex-col gap-1'}>
            {sectionIndex > 0 && (
              <div aria-hidden className={'mx-auto my-2 w-8 border-t border-border/50 xl:w-full'} />
            )}
            {section.config.display === 'drawer' ? (
              // Only the trigger – the entries open in the bottom drawer.
              <MenuSectionTrigger section={section} />
            ) : (
              section.nodes.map(node =>
                node.type === 'component' ? (
                  <MenuComponentSlot
                    key={`c:${node.id}`}
                    entry={node.component}
                    variant={variant}
                    ctx={ctx}
                    close={noop}
                  />
                ) : (
                  <MenuSidebarItem key={node.id} item={node.item} ctx={ctx} variant={variant} />
                )
              )
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
