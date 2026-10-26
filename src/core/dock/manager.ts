import type { IDockEntry, IDockManager, IDockMenuItem } from './types.ts';

const entries = new Map<string, IDockEntry>();
const menuItems = new Map<string, IDockMenuItem>();
const listeners = new Set<() => void>();
let version = 0;
let hideCount = 0;
let sorted: IDockEntry[] = [];
let sortedMenu: IDockMenuItem[] = [];

const changed = () => {
  version += 1;
  sorted = [...entries.values()].sort(
    (a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0) || a.id.localeCompare(b.id)
  );
  sortedMenu = [...menuItems.values()].sort(
    (a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0) || a.id.localeCompare(b.id)
  );
  listeners.forEach(listener => listener());
};

/**
 * Registry of the floating mobile bar (below `md`). Static entries from `core.tsx` / `app.tsx`:
 *
 * ```ts
 * Core.dock.register({ id: 'menu', component: MenuDockButton, align: 'left' });
 * ```
 *
 * Page-specific buttons while a component is mounted: `useDockButton({ … })`.
 *
 * Dropdown menu (left in the dock):
 *
 * ```ts
 * Core.dock.registerMenuItem({ id: 'files', label: 'file-share:menu.label', icon: FolderDown, to: '/files' });
 * Core.dock.registerMenuItem({ id: 'admin', label: 'Admin', roles: 'admin:user', to: '/admin' });
 * Core.dock.registerMenuItem({ id: 'compose', label: 'Neu', visibility: 'authenticated',
 *   emit: 'timeline::compose' });
 * Core.dock.registerMenuItem({ id: 'help', label: 'Hilfe', onClick: () => Core.links.open('help') });
 * ```
 */
const DockManager: IDockManager = {
  register(entry) {
    entries.set(entry.id, entry);
    changed();
    return () => {
      if (entries.get(entry.id) === entry) {
        DockManager.unregister(entry.id);
      }
    };
  },
  unregister(id) {
    if (entries.delete(id)) {
      changed();
    }
  },
  getEntries: () => sorted,
  registerMenuItem(item) {
    menuItems.set(item.id, item);
    changed();
    return () => {
      if (menuItems.get(item.id) === item) DockManager.unregisterMenuItem(item.id);
    };
  },
  unregisterMenuItem(id) {
    if (menuItems.delete(id)) changed();
  },
  getMenuItems: () => sortedMenu,
  hide() {
    hideCount += 1;
    changed();
    let released = false;
    return () => {
      if (released) return;
      released = true;
      hideCount = Math.max(0, hideCount - 1);
      changed();
    };
  },
  isHidden: () => hideCount > 0,
  subscribe(listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  getVersion: () => version,
};

export { DockManager };
