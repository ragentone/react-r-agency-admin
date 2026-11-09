import type { IResolvedMenuEntry } from '../hooks';
import type { IMenuContext, MenuComponentVariant } from '../types.ts';
import { MenuGroup } from './MenuGroup.tsx';
import { MenuGroupDrawer } from './MenuGroupDrawer.tsx';
import { MenuItemAction } from './MenuParts.tsx';
import { MenuRailGroup } from './MenuRailGroup.tsx';
import { menuSideRowClass, MenuSideRowContent, MenuSideTooltip } from './MenuSideRow.tsx';
import { useMenuText } from './use.menu.text.ts';

interface IProps {
  item: IResolvedMenuEntry;
  ctx: IMenuContext;
  variant: MenuComponentVariant;
}

/** One entry of the desktop navigation: link, collapsible group, rail popover or panel trigger. */
export const MenuSidebarItem = ({ item, ctx, variant }: IProps) => {
  const text = useMenuText();
  const label = text(item.entry.label);

  if (item.children?.length && item.entry.display === 'drawer') {
    return <MenuGroupDrawer item={item} />;
  }
  if (item.children?.length) {
    // Expanded sidebar: collapsible list – icon rail: popover with the children.
    return variant === 'sidebar' ? (
      <MenuGroup item={item} ctx={ctx} variant={'sidebar'} />
    ) : (
      <MenuRailGroup item={item} ctx={ctx} />
    );
  }

  return (
    <MenuSideTooltip label={label}>
      <span className={'flex'}>
        <MenuItemAction
          item={item}
          ctx={ctx}
          label={label}
          className={menuSideRowClass(item.active)}
        >
          <MenuSideRowContent item={item} label={label} />
        </MenuItemAction>
      </span>
    </MenuSideTooltip>
  );
};
