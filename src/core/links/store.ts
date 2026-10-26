import { create } from 'zustand';

interface ILinkOpenStore {
  /** Link requested outside of React (`Core.links.open`) – `LinkRouteHost` navigates to it. */
  requested: string | null;
  /** Links menu (right drawer) open. */
  menuOpen: boolean;
  request: (id: string) => void;
  clearRequest: () => void;
  setMenuOpen: (open: boolean) => void;
}

export const useLinkOpenStore = create<ILinkOpenStore>(set => ({
  requested: null,
  menuOpen: false,
  request: id => set({ requested: id }),
  clearRequest: () => set({ requested: null }),
  setMenuOpen: open => set({ menuOpen: open }),
}));

/** Opens / closes the links menu – also outside of React. */
export const openLinksMenu = () => useLinkOpenStore.getState().setMenuOpen(true);
export const closeLinksMenu = () => useLinkOpenStore.getState().setMenuOpen(false);
