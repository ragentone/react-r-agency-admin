import { LayoutGrid } from 'lucide-react';

import type { IMenuComponentEntry, IMenuEntry, IMenuManager, IMenuSectionConfig } from './types.ts';

const entries = new Map<string, IMenuEntry>();
const components = new Map<string, IMenuComponentEntry>();
const sections: Record<string, IMenuSectionConfig> = {
  main: { label: 'menu:sections.main', sortOrder: 0 },
  // Apps: one trigger in the menu, the apps open in a bottom drawer.
  apps: {
    label: 'menu:sections.apps',
    description: 'menu:apps.description',
    icon: LayoutGrid,
    display: 'drawer',
    sortOrder: 10,
  },
  account: { label: 'menu:sections.account', sortOrder: 100 },
};
const listeners = new Set<() => void>();
let version = 0;
let hideCount = 0;
let sorted: IMenuEntry[] = [];
let sortedComponents: IMenuComponentEntry[] = [];

const changed = () => {
  version += 1;
  sorted = [...entries.values()].sort(
    (a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0) || a.id.localeCompare(b.id)
  );
  sortedComponents = [...components.values()].sort(
    (a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0) || a.id.localeCompare(b.id)
  );
  listeners.forEach(listener => listener());
};

/**
 * Registry of the main menu. Apps register their entries from `app.tsx`:
 *
 * ```ts
 * Core.menu.register({ id: 'chat', label: 'chat:menu.label', icon: Video, to: '/chat' });
 * Core.menu.registerComponent({ id: 'locale', component: MenuLocaleSwitch, placement: 'settings' });
 * ```
 */
const MenuManager: IMenuManager = {
  register(entry) {
    entries.set(entry.id, entry);
    changed();
    return () => {
      if (entries.get(entry.id) === entry) {
        MenuManager.unregister(entry.id);
      }
    };
  },
  unregister(id) {
    if (entries.delete(id)) {
      changed();
    }
  },
  registerComponent(entry) {
    components.set(entry.id, entry);
    changed();
    return () => {
      if (components.get(entry.id) === entry) {
        MenuManager.unregisterComponent(entry.id);
      }
    };
  },
  unregisterComponent(id) {
    if (components.delete(id)) {
      changed();
    }
  },
  getComponents: () => sortedComponents,
  registerSection(id, config) {
    sections[id] = config;
    changed();
  },
  getEntries: () => sorted,
  getSections: () => sections,
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

export { MenuManager };
