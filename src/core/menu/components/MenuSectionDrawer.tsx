import { LayoutGrid } from 'lucide-react';

import { type IResolvedMenuEntry, type IResolvedMenuSection } from '../hooks';
import { openMenuSection, useMenuSheetOpen } from '../store.ts';
import { MenuSideButton } from './MenuSideRow.tsx';
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
export const MenuSectionTrigger = ({ section }: { section: IResolvedMenuSection }) => {
  const text = useMenuText();
  const open = useMenuSheetOpen('section', section.id);

  return (
    <MenuSideButton
      item={triggerItemOf(section)}
      label={text(section.config.label)}
      open={open}
      onClick={() => openMenuSection(section.id)}
    />
  );
};
