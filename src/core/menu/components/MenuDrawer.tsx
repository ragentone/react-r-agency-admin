import { AppBrand } from '@core/layout/components/AppBrand.tsx';
import { PluginSlot } from '@core/plugin/PluginSlot.tsx';
import { cn } from '@ui/lib';
import { AppDrawer } from '@ui/patterns';
import type { CSSProperties } from 'react';
import { useTranslation } from 'react-i18next';

import { MENU_DRAWER_SIDE } from '../const.ts';
import { type IResolvedMenuSection, type MenuNode, useMenu } from '../hooks';
import { openMenuGroup, openMenuSection } from '../store.ts';
import { MenuComponentSlot } from './MenuComponentSlot.tsx';
import { MenuGroup } from './MenuGroup.tsx';
import { MenuOpenRow, MenuRow } from './MenuRow.tsx';
import { tilesOf, triggerItemOf } from './MenuSectionDrawer.tsx';
import { useMenuText } from './use.menu.text.ts';

/** Width of the mobile menu panel; square on the left (screen edge), rounded on the right. */
const MENU_PANEL_CLASS = 'w-[min(86vw,22rem)] max-w-none rounded-l-none';
/** Full screen height, no inset around the panel (the default drawer keeps a gap at top and bottom). */
const MENU_PANEL_STYLE = {
  '--drawer-height': '100dvh',
  '--drawer-content-max-height': '100dvh',
  '--drawer-inset': '0px',
} as CSSProperties;

interface IProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Mobile main menu: one panel from the left, no nested panels. Apps and games (`display: 'drawer'`)
 * are flat rows that open the section panel; the user group is one row that opens its panel too.
 */
const MenuDrawer = ({ open, onOpenChange }: IProps) => {
  const { t } = useTranslation('menu');
  const text = useMenuText();
  const { sections, footer, ctx } = useMenu();
  const close = () => onOpenChange(false);
  /** Closes the menu, then opens a section / group panel. */
  const openPanel = (openTarget: () => void) => () => {
    close();
    openTarget();
  };

  const visibleSections = sections.filter(
    section => section.config.display !== 'drawer' || tilesOf(section).length > 0
  );

  const renderNode = (node: MenuNode) => {
    if (node.type === 'component') {
      return (
        <MenuComponentSlot entry={node.component} variant={'drawer'} ctx={ctx} close={close} />
      );
    }
    const item = node.item;
    if (!item.children?.length) return <MenuRow item={item} ctx={ctx} onAfterSelect={close} />;
    return item.entry.display === 'drawer' ? (
      <MenuOpenRow
        item={item}
        label={item.entry.label}
        onClick={openPanel(() => openMenuGroup(item.entry.id))}
      />
    ) : (
      <MenuGroup item={item} ctx={ctx} variant={'drawer'} onAfterSelect={close} />
    );
  };

  const renderSection = (section: IResolvedMenuSection) =>
    section.config.display === 'drawer' ? (
      <MenuOpenRow
        item={triggerItemOf(section)}
        label={section.config.label}
        onClick={openPanel(() => openMenuSection(section.id))}
      />
    ) : (
      <ul className={'flex flex-col'}>
        {section.nodes.map(node => (
          <li key={node.type === 'component' ? `c:${node.id}` : node.id}>{renderNode(node)}</li>
        ))}
      </ul>
    );

  return (
    <AppDrawer
      open={open}
      onOpenChange={onOpenChange}
      title={t('label')}
      description={t('description')}
      closeLabel={t('close')}
      hideHeader
      showSwipeHandle={false}
      direction={MENU_DRAWER_SIDE}
      contentProps={{ className: MENU_PANEL_CLASS, style: MENU_PANEL_STYLE }}
      footer={
        footer.length > 0 ? (
          <div className={'flex flex-col'}>
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
        ) : undefined
      }
    >
      <nav
        aria-label={t('label')}
        className={
          'min-h-0 flex-1 overflow-y-auto overscroll-contain pb-[max(1.5rem,env(safe-area-inset-bottom))]'
        }
      >
        <AppBrand className={'px-4 pt-4 pb-3'} />
        <PluginSlot
          name={'menu_before.widget'}
          scope={'admin'}
          className={'border-b border-border/50 px-4 py-3'}
        />
        {visibleSections.map((section, sectionIndex) => (
          <section
            key={section.id}
            aria-label={text(section.config.label)}
            className={cn(sectionIndex > 0 && 'mt-2 border-t border-border/50 pt-2')}
          >
            {renderSection(section)}
          </section>
        ))}
        <PluginSlot
          name={'menu_after.widget'}
          scope={'admin'}
          className={'border-t border-border/50 px-4 py-3'}
        />
      </nav>
    </AppDrawer>
  );
};

export { MenuDrawer };
