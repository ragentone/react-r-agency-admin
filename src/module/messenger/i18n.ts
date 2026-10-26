import i18n from 'i18next';

/** Translations outside React (toasts from websocket events). */
export const i18nT = (key: string, options?: Record<string, unknown>) =>
  i18n.t(key, { ns: 'messenger', ...options }) as string;
