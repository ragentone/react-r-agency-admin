import { create } from 'zustand';

interface IProfileDrawerStore {
  /** Profile shown in the global profile drawer (null = closed). */
  userId: string | null;
  open: (userId: string) => void;
  close: () => void;
}

/**
 * Profile as bottom sheet – no routing: the URL path stays, browser/Android back closes
 * the drawer (`@ui/lib/back-close`). Alternative to the profile page (`useProfileRoute`),
 * e.g. for quick looks from lists. Also opened by `?profile-id=<id>` (ProfileDrawerHost).
 * Choose per call site with `useProfileOpen('route' | 'drawer')`.
 */
export const useProfileDrawerStore = create<IProfileDrawerStore>(set => ({
  userId: null,
  open: userId => set({ userId }),
  close: () => set({ userId: null }),
}));

/** Opens the profile drawer – also usable outside of React (handlers, stores …). */
export const openProfileDrawer = (userId: string) => useProfileDrawerStore.getState().open(userId);
export const closeProfileDrawer = () => useProfileDrawerStore.getState().close();

export const useProfileDrawer = () => ({
  openProfileId: useProfileDrawerStore(state => state.userId),
  openProfile: openProfileDrawer,
  closeProfile: closeProfileDrawer,
});
