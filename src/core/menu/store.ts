import { create } from 'zustand';

/** What the bottom drawer shows: a section (`display: 'drawer'`) or a group entry. */
export interface IMenuSheetTarget {
  type: 'section' | 'group';
  id: string;
}

interface IMenuSectionDrawerStore {
  /** Content of the bottom drawer, `null` = closed. */
  target: IMenuSheetTarget | null;
  open: (target: IMenuSheetTarget) => void;
  close: () => void;
}

export const useMenuSectionDrawerStore = create<IMenuSectionDrawerStore>(set => ({
  target: null,
  open: target => set({ target }),
  close: () => set({ target: null }),
}));

/** `true` while the bottom drawer shows the given section / group. */
export const useMenuSheetOpen = (type: IMenuSheetTarget['type'], id: string) =>
  useMenuSectionDrawerStore(state => state.target?.type === type && state.target.id === id);

/** Opens the bottom drawer of a section (e.g. `'apps'`) – also outside of React. */
export const openMenuSection = (id: string) =>
  useMenuSectionDrawerStore.getState().open({ type: 'section', id });
/** Opens the bottom drawer of a group entry with `display: 'drawer'` (e.g. `'user'`). */
export const openMenuGroup = (id: string) =>
  useMenuSectionDrawerStore.getState().open({ type: 'group', id });
export const closeMenuSection = () => useMenuSectionDrawerStore.getState().close();
