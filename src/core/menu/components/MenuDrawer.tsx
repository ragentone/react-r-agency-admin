import { AppBrand } from '@core/layout/components/AppBrand.tsx';
import { MenuComponentSlot } from '@core/menu';
import { MenuGroup } from '@core/menu';
import { MenuItemBadge, MenuItemIcon } from '@core/menu';
import { tilesOf, triggerItemOf } from '@core/menu';
import { useMenuText } from '@core/menu';
import { AppDrawer } from '@ui/patterns';
import { ChevronRight } from 'lucide-react';
import type { CSSProperties } from 'react';
import { useTranslation } from 'react-i18next';

import { MENU_DRAWER_SIDE } from '../const.ts';
import { type IResolvedMenuEntry, type IResolvedMenuSection, useMenu } from '../hooks';
import { openMenuGroup, openMenuSection } from '../store.ts';
import { MenuRow, menuRowClass } from './MenuRow.tsx';

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

  const visibleSections = sections.filter(
    section => section.config.display !== 'drawer' || tilesOf(section).length > 0
  );

  const renderGroup = (item: IResolvedMenuEntry) =>
    item.entry.display === 'drawer' ? (
      <button
        type={'button'}
        aria-haspopup={'dialog'}
        onClick={() => {
          close();
          openMenuGroup(item.entry.id);
        }}
        className={menuRowClass(item.active)}
      >
        <MenuItemIcon item={item} />
        <span className={'min-w-0 flex-1 truncate'}>{text(item.entry.label)}</span>
        <MenuItemBadge item={item} />
        <ChevronRight className={'size-4 shrink-0 text-muted-foreground'} aria-hidden />
      </button>
    ) : (
      <MenuGroup item={item} ctx={ctx} variant={'drawer'} onAfterSelect={close} />
    );

  const renderSectionRow = (section: IResolvedMenuSection) => {
    const item = triggerItemOf(section);
    const count = tilesOf(section).length;

    return (
      <button
        type={'button'}
        aria-haspopup={'dialog'}
        onClick={() => {
          close();
          openMenuSection(section.id);
        }}
        className={menuRowClass(item.active)}
      >
        <MenuItemIcon item={item} />
        <span className={'min-w-0 flex-1 truncate'}>{text(section.config.label)}</span>
        <MenuItemBadge item={item} />
        {count > 0 && (
          <span className={'shrink-0 text-caption tabular-nums text-muted-foreground'}>{count}</span>
        )}
        <ChevronRight className={'size-4 shrink-0 text-muted-foreground'} aria-hidden />
      </button>
    );
  };

  const renderNodes = (section: IResolvedMenuSection) => (
    <ul className={'flex flex-col'}>
      {section.nodes.map(node => (
        <li key={node.type === 'component' ? `c:${node.id}` : node.id}>
          {node.type === 'component' ? (
            <MenuComponentSlot entry={node.component} variant={'drawer'} ctx={ctx} close={close} />
          ) : node.item.children?.length ? (
            renderGroup(node.item)
          ) : (
            <MenuRow item={node.item} ctx={ctx} onAfterSelect={close} />
          )}
        </li>
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
              <MenuComponentSlot key={entry.id} entry={entry} variant={'drawer'} ctx={ctx} close={close} />
            ))}
          </div>
        ) : undefined
      }
    >
      <div className={'min-h-0 flex-1 overflow-y-auto overscroll-contain pb-[max(1.5rem,env(safe-area-inset-bottom))]'}>
        <AppBrand className={'px-4 pt-4 pb-3'} />
        {visibleSections.map(section =>
          section.config.display === 'drawer' ? (
            <div key={section.id} className={'flex flex-col'}>
              {renderSectionRow(section)}
            </div>
          ) : (
            <section key={section.id} aria-label={text(section.config.label)}>
              {renderNodes(section)}
            </section>
          )
        )}
      </div>
    </AppDrawer>
  );
};

export { MenuDrawer };
