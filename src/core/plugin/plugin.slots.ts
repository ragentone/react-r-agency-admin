import { useSyncExternalStore } from 'react';

import { clearPluginHooks } from './plugin.hooks';
import { clearPluginMenu } from './plugin.menu';
import { clearPluginPages } from './plugin.pages';
import type { PluginSlotComponent, PluginSlotName } from './plugin.types';

interface IPluginSlotEntry {
  pluginId: string;
  component: PluginSlotComponent;
}

/** Registered components per slot. Arrays are replaced on change, never mutated (for useSyncExternalStore). */
let slots: Partial<Record<PluginSlotName, IPluginSlotEntry[]>> = {};
const listeners = new Set<() => void>();

const notify = () => listeners.forEach(listener => listener());

/** Adds or replaces the component of `pluginId` for `slot`. */
export const registerPluginSlot = (
  pluginId: string,
  slot: PluginSlotName,
  component: PluginSlotComponent
) => {
  const current = (slots[slot] ?? []).filter(entry => entry.pluginId !== pluginId);
  slots = { ...slots, [slot]: [...current, { pluginId, component }] };
  notify();
};

/** Removes every component of a plugin (deactivated or failed to load). */
export const unregisterPlugin = (pluginId: string) => {
  const next: Partial<Record<PluginSlotName, IPluginSlotEntry[]>> = {};
  for (const [slot, entries] of Object.entries(slots) as [PluginSlotName, IPluginSlotEntry[]][]) {
    next[slot] = entries.filter(entry => entry.pluginId !== pluginId);
  }
  slots = next;
  clearPluginPages(pluginId);
  clearPluginMenu(pluginId);
  clearPluginHooks(pluginId);
  notify();
};

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

const emptyEntries: IPluginSlotEntry[] = [];
const snapshotOf = (slot: PluginSlotName) => slots[slot] ?? emptyEntries;

/** Current components of one slot; re-renders when a plugin registers or unregisters. */
export const usePluginSlot = (slot: PluginSlotName): IPluginSlotEntry[] =>
  useSyncExternalStore(subscribe, () => snapshotOf(slot));
