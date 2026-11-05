import { cn } from '@ui/lib';
import { Tooltip, TooltipContent, TooltipTrigger } from '@ui/shad-cn/components/tooltip.tsx';
import { LayoutGrid } from 'lucide-react';

import { type IResolvedMenuEntry, type IResolvedMenuSection } from '../hooks';
import { openMenuSection, useMenuSheetOpen } from '../store.ts';
import type { MenuComponentVariant } from '../types.ts';
import { MenuItemBadge, MenuItemIcon } from './MenuParts.tsx';
import { useMenuText } from './use.menu.text.ts';

/** Entries of a section as flat tiles: groups contribute their (navigating) parent + children. */
export const tilesOf = (section: IResolvedMenuSection): IResolvedMenuEntry[] =>
  section.items.flatMap(item =>
    item.children?.length
      ? [
          ...(item.href || item.entry.onSelect ? [{ ...item, children: undefined }] : []),
          ...item.children,
        ]
      : [item]
  );

/** Synthetic entry for the section trigger (icon, active state, summed badges). */
export const triggerItemOf = (section: IResolvedMenuSection): IResolvedMenuEntry => {
  const tiles = tilesOf(section);
  return {
    entry: {
      id: `section:${section.id}`,
      label: section.config.label,
      description: section.config.description,
      icon: section.config.icon ?? LayoutGrid,
    },
    active: tiles.some(tile => tile.active),
    children: tiles,
  };
};

/** Section with `display: 'drawer'` in the desktop sidebar / icon rail: opens the bottom drawer. */
export const MenuSectionTrigger = ({
  section,
  variant,
}: {
  section: IResolvedMenuSection;
  variant: MenuComponentVariant;
}) => {
  const text = useMenuText();
  const isOpen = useMenuSheetOpen('section', section.id);
  const item = triggerItemOf(section);
  const label = text(section.config.label);
  const onClick = () => openMenuSection(section.id);

  if (variant === 'rail') {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type={'button'}
            onClick={onClick}
            aria-haspopup={'dialog'}
            aria-expanded={isOpen}
            aria-label={label}
            className={cn(
              'group relative flex w-full items-center justify-center rounded-full p-3 outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring/50',
              item.active || isOpen
                ? 'bg-foreground/8 text-foreground'
                : 'text-muted-foreground hover:bg-foreground/6 hover:text-foreground'
            )}
          >
            <span className={'relative flex'}>
              <MenuItemIcon item={item} />
              <MenuItemBadge
                item={item}
                variant={'dot'}
                className={'absolute -right-1.5 -top-1.5'}
              />
            </span>
          </button>
        </TooltipTrigger>
        <TooltipContent side={'right'} sideOffset={6}>
          {label}
        </TooltipContent>
      </Tooltip>
    );
  }

  return (
    <button
      type={'button'}
      onClick={onClick}
      aria-haspopup={'dialog'}
      aria-expanded={isOpen}
      className={cn(
        'flex h-12 w-full items-center gap-4 rounded-full px-4 text-left outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring/50',
        item.active || isOpen
          ? 'bg-foreground/[0.07] text-foreground'
          : 'text-muted-foreground hover:bg-foreground/6 hover:text-foreground'
      )}
    >
      <MenuItemIcon item={item} />
      <span
        className={cn(
          'min-w-0 flex-1 truncate text-title',
          item.active ? 'font-bold' : 'font-medium'
        )}
      >
        {label}
      </span>
      <MenuItemBadge item={item} />
    </button>
  );
};
