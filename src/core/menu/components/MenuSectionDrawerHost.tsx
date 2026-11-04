import { cn } from '@ui/lib';
import { AppDrawer } from '@ui/patterns';
import { useIsMobile } from '@ui/shad-cn/hooks/use-mobile.tsx';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { type IResolvedMenuEntry, type IResolvedMenuSection, useMenu } from '../hooks';
import { useMenuSectionDrawerStore } from '../store.ts';
import type { IMenuContext } from '../types.ts';
import { MenuComponentSlot } from './MenuComponentSlot.tsx';
import { MenuGroupDrawerList } from './MenuGroupDrawer.tsx';
import { MenuItemAction, MenuItemBadge, MenuItemIcon } from './MenuParts.tsx';
import { MenuRow } from './MenuRow.tsx';
import { tilesOf } from './MenuSectionDrawer.tsx';
import { useMenuText } from './use.menu.text.ts';

/** Content of the bottom drawer: a section (grid) or a group entry. */
type SheetContent =
  { type: 'section'; section: IResolvedMenuSection } | { type: 'group'; item: IResolvedMenuEntry };

/** App-launcher tile: big icon on a soft square, name below, black when active. */
const AppTile = ({
  tile,
  ctx,
  close,
}: {
  tile: IResolvedMenuEntry;
  ctx: IMenuContext;
  close: () => void;
}) => {
  const text = useMenuText();
  const label = text(tile.entry.label);

  return (
    <MenuItemAction
      item={tile}
      ctx={ctx}
      label={label}
      onAfterSelect={close}
      className={cn(
        'group flex flex-col items-center gap-2 rounded-2xl p-2 text-center outline-none transition-transform active:scale-[0.96] focus-visible:ring-2 focus-visible:ring-ring/50 [-webkit-tap-highlight-color:transparent]'
      )}
    >
      <span
        className={cn(
          'relative flex size-16 items-center justify-center rounded-2xl transition-colors',
          tile.active
            ? 'bg-foreground text-background'
            : 'bg-foreground/[0.06] text-foreground group-hover:bg-foreground/[0.1]'
        )}
      >
        <MenuItemIcon item={tile} className={'size-7'} />
        <MenuItemBadge item={tile} variant={'dot'} className={'absolute -right-1.5 -top-1.5'} />
      </span>
      <span
        className={cn(
          'w-full truncate text-caption',
          tile.active ? 'font-bold text-foreground' : 'font-medium text-foreground/90'
        )}
      >
        {label}
      </span>
    </MenuItemAction>
  );
};

/** Bottom drawer for sections and groups with `display: 'drawer'` (desktop sidebar, mobile menu, dock avatar). */
export const MenuSectionDrawerHost = () => {
  const { t } = useTranslation('menu');
  const text = useMenuText();
  const target = useMenuSectionDrawerStore(state => state.target);
  const close = useMenuSectionDrawerStore(state => state.close);
  const { sections, items, ctx } = useMenu();
  const isMobile = useIsMobile();

  const resolved = useMemo<SheetContent | null>(() => {
    if (!target) return null;
    if (target.type === 'section') {
      const section = sections.find(s => s.id === target.id);
      return section ? { type: 'section', section } : null;
    }
    const item = items.find(i => i.entry.id === target.id);
    return item?.children?.length ? { type: 'group', item } : null;
  }, [target, sections, items]);

  // Keep the last content while the drawer animates out.
  const [shown, setShown] = useState<SheetContent | null>(null);
  if (resolved && resolved !== shown) setShown(resolved);
  const current = resolved ?? shown;

  const configLabel =
    current?.type === 'section'
      ? current.section.config.label
      : current?.type === 'group'
        ? current.item.entry.label
        : '';
  const label = text(configLabel);
  const tiles = current?.type === 'section' ? tilesOf(current.section) : [];
  const components =
    current?.type === 'section'
      ? current.section.nodes.flatMap(node => (node.type === 'component' ? [node.component] : []))
      : [];

  return (
    <AppDrawer
      open={Boolean(resolved)}
      onOpenChange={next => {
        if (!next) close();
      }}
      title={label}
      size={'auto'}
      action={
        tiles.length > 0 ? (
          <span className={'pr-1 text-caption tabular-nums text-muted-foreground'}>
            {tiles.length}
          </span>
        ) : undefined
      }
      bodyClassName={'px-0 pt-0'}
    >
      {current?.type === 'group' && (
        <MenuGroupDrawerList item={current.item} ctx={ctx} close={close} />
      )}
      {current?.type === 'section' && tiles.length === 0 && components.length === 0 && (
        <p className={'px-4 py-8 text-center text-body text-muted-foreground'}>{t('apps.empty')}</p>
      )}
      {tiles.length > 0 && isMobile && (
        <ul className={'flex flex-col'}>
          {tiles.map(tile => (
            <li key={tile.entry.id}>
              <MenuRow item={tile} ctx={ctx} onAfterSelect={close} />
            </li>
          ))}
        </ul>
      )}
      {tiles.length > 0 && !isMobile && (
        <ul className={'grid grid-cols-3 gap-1 px-3 py-4 sm:grid-cols-4'}>
          {tiles.map(tile => (
            <li key={tile.entry.id}>
              <AppTile tile={tile} ctx={ctx} close={close} />
            </li>
          ))}
        </ul>
      )}
      {components.map(entry => (
        <MenuComponentSlot
          key={entry.id}
          entry={entry}
          variant={'drawer'}
          ctx={ctx}
          close={close}
        />
      ))}
    </AppDrawer>
  );
};
