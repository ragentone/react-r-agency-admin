import type { IPluginMenuEntry } from './plugin.types';

/**
 * The admin has no menu system yet. Plugin menu entries are accepted and ignored, so plugins
 * still register without errors.
 */
export const registerPluginMenu = (pluginId: string, entry: IPluginMenuEntry) => {
  console.warn(`[plugin:${pluginId}] menu entries are not shown in the admin yet (${entry.page})`);
};

export const clearPluginMenu = (_pluginId: string) => undefined;
