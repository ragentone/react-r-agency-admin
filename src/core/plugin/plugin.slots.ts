import { useSyncExternalStore } from 'react';

import { clearPluginEvents } from './plugin.events';
import { clearPluginLive } from './plugin.live';
import { clearPluginHooks } from './plugin.hooks';
import { clearPluginMenu } from './plugin.menu';
import { clearPluginPages } from './plugin.pages';
import type { PluginSlotComponent, PluginSlotName } from './plugin.types';

interface IPluginSlotEntry {
  pluginId: string;
  component: PluginSlotComponent;
  sortOrder: number;
  disabled: boolean;
}

/** Used when a plugin registers a slot without `sortOrder`. */
export const DEFAULT_SLOT_SORT_ORDER = 100;

/** Lower sortOrder first; equal values keep a stable order by plugin id. */
const compareSlotEntries = (a: IPluginSlotEntry, b: IPluginSlotEntry) =>
  a.sortOrder - b.sortOrder || a.pluginId.localeCompare(b.pluginId);

/** Registered components per slot. Arrays are replaced on change, never mutated (for useSyncExternalStore). */
let slots: Partial<Record<PluginSlotName, IPluginSlotEntry[]>> = {};
const listeners = new Set<() => void>();

const notify = () => listeners.forEach(listener => listener());

/** Adds or replaces the component of `pluginId` for `slot`. Entries stay sorted by `sortOrder`. */
export const registerPluginSlot = (
  pluginId: string,
  slot: PluginSlotName,
  component: PluginSlotComponent,
  options: { sortOrder: number; disabled: boolean } = { sortOrder: DEFAULT_SLOT_SORT_ORDER, disabled: false }
) => {
  const current = (slots[slot] ?? []).filter(entry => entry.pluginId !== pluginId);
  const entry = { pluginId, component, sortOrder: options.sortOrder, disabled: options.disabled };
  const next = [...current, entry].sort(compareSlotEntries);
  slots = { ...slots, [slot]: next };
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
  clearPluginEvents(pluginId);
  clearPluginLive(pluginId);
  notify();
};

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

const emptyEntries: IPluginSlotEntry[] = [];
const snapshotOf = (slot: PluginSlotName) => {
  const entries = slots[slot] ?? emptyEntries;
  // Disabled components stay registered but are not rendered.
  return entries.some(entry => entry.disabled) ? entries.filter(entry => !entry.disabled) : entries;
};

/** Current components of one slot; re-renders when a plugin registers or unregisters. */
export const usePluginSlot = (slot: PluginSlotName): IPluginSlotEntry[] =>
  useSyncExternalStore(subscribe, () => snapshotOf(slot));
