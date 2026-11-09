import { cn } from '@ui/lib';
import { Tooltip, TooltipContent, TooltipTrigger } from '@ui/shad-cn/components/tooltip.tsx';
import type { ReactElement, ReactNode } from 'react';

import type { IResolvedMenuEntry } from '../hooks';
import { MenuItemBadge, MenuItemIcon } from './MenuParts.tsx';

/**
 * The one row of the desktop navigation: icon button in the rail (md–xl), icon + label from `xl`.
 * Active = bold label + heavier icon (no background, like X); `highlighted` = its panel is open.
 */
export const menuSideRowClass = (active: boolean, highlighted = false) =>
  cn(
    'group relative flex h-12 w-full items-center justify-center gap-4 rounded-full px-3 text-left text-foreground outline-none transition-colors',
    'hover:bg-foreground/6 focus-visible:ring-2 focus-visible:ring-ring/50 xl:justify-start xl:px-4',
    highlighted && 'bg-foreground/6',
    active ? 'font-bold' : 'font-medium'
  );

interface IMenuSideRowContentProps {
  item: IResolvedMenuEntry;
  label: string;
  /** Right of the badge, expanded sidebar only (e.g. a chevron). */
  trailing?: ReactNode;
}

/** Icon, label (from `xl`) and badge (dot on the icon in the rail, pill at the end from `xl`). */
export const MenuSideRowContent = ({ item, label, trailing }: IMenuSideRowContentProps) => (
  <>
    <MenuItemIcon item={item} />
    <span className={'hidden min-w-0 flex-1 truncate text-title xl:block'}>{label}</span>
    <MenuItemBadge
      item={item}
      variant={'dot'}
      className={'absolute top-1.5 right-2.5 xl:static xl:h-5 xl:min-w-5 xl:px-1.5'}
    />
    {trailing}
  </>
);

/** Label tooltip for the icon rail (hidden from `xl`, where the label is visible). */
export const MenuSideTooltip = ({ label, children }: { label: string; children: ReactElement }) => (
  <Tooltip>
    <TooltipTrigger asChild>{children}</TooltipTrigger>
    <TooltipContent side={'right'} sideOffset={6} className={'xl:hidden'}>
      {label}
    </TooltipContent>
  </Tooltip>
);

interface IMenuSideButtonProps extends IMenuSideRowContentProps {
  /** The panel opened by this row is visible. */
  open: boolean;
  onClick: () => void;
}

/** Desktop row that opens a panel (apps, games, user group). */
export const MenuSideButton = ({ item, label, trailing, open, onClick }: IMenuSideButtonProps) => (
  <MenuSideTooltip label={label}>
    <button
      type={'button'}
      onClick={onClick}
      aria-haspopup={'dialog'}
      aria-expanded={open}
      aria-label={label}
      className={menuSideRowClass(item.active, open)}
    >
      <MenuSideRowContent item={item} label={label} trailing={trailing} />
    </button>
  </MenuSideTooltip>
);
