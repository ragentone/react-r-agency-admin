import i18n from '@core/i18n';
import { MenuManager } from '@core/menu';

import { PLUGIN_ICONS } from './plugin.icons';
import { currentLocale } from './plugin.locale';
import type { IPluginMenuEntry, PluginLocale } from './plugin.types';

interface IPluginMenuRecord extends IPluginMenuEntry {
  pluginId: string;
}

const records = new Map<string, IPluginMenuRecord>();
const idOf = (pluginId: string, page: string) => `plugin:${pluginId}:${page}`;

const labelFor = (label: IPluginMenuEntry['label'], locale: PluginLocale): string => {
  if (typeof label === 'string') return label;
  return label[locale] ?? label.en ?? Object.values(label)[0] ?? '';
};

/** Name of an entry: its page, or its id when it has none. */
const keyOf = (entry: IPluginMenuEntry) => entry.page ?? entry.id ?? '';

/** Puts one entry into the main menu, with the label for the current language. */
const publish = (record: IPluginMenuRecord) => {
  MenuManager.register({
    id: idOf(record.pluginId, keyOf(record)),
    label: labelFor(record.label, currentLocale()),
    icon: record.icon ?? PLUGIN_ICONS.Puzzle,
    // A page entry navigates; an entry without page runs its onClick.
    to: record.page ? `/plugin/${record.pluginId}/${record.page}` : undefined,
    onSelect: record.page ? undefined : () => record.onClick?.(),
    audience: record.audience ?? 'all',
    // Any of these roles. The host treats a role check as "logged in" as well.
    roles: record.roles?.length ? record.roles : undefined,
    section: record.section ?? 'plugins',
    sortOrder: record.sortOrder ?? 100,
  });
};

/** Adds or replaces a menu entry of a plugin. */
export const registerPluginMenu = (pluginId: string, entry: IPluginMenuEntry) => {
  const record = { ...entry, pluginId };
  records.set(idOf(pluginId, keyOf(entry)), record);
  publish(record);
};

/** Removes every menu entry of a plugin (deactivated, failed to load, or reloaded). */
export const clearPluginMenu = (pluginId: string) => {
  for (const [key, record] of records) {
    if (record.pluginId !== pluginId) continue;
    MenuManager.unregister(key);
    records.delete(key);
  }
};

// Labels follow the language: publish again when the user switches it.
const menuLanguageListener = (globalThis as { __pluginMenuLanguage?: () => void })
  .__pluginMenuLanguage;
if (menuLanguageListener) i18n.off('languageChanged', menuLanguageListener);
const onLanguageChanged = () => records.forEach(publish);
(globalThis as { __pluginMenuLanguage?: () => void }).__pluginMenuLanguage = onLanguageChanged;
i18n.on('languageChanged', onLanguageChanged);
