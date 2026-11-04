import { useAuthTokenStore } from '@core/auth/auth.token.store.tsx';
import { Link } from '@tanstack/react-router';
import { getMeshClient } from 'r-agency-mesh-client-v1/release';
import * as React from 'react';
import { toast as sonnerToast } from 'sonner';

import { usePluginConfirmStore } from './plugin.confirm';
import { openPluginDrawer } from './plugin.drawer';
import { usePluginForm } from './plugin.form';
import { addPluginHook } from './plugin.hooks';
import { PLUGIN_ICONS } from './plugin.icons';
import { usePluginLocale } from './plugin.locale';
import { usePluginUser } from './plugin.user';
import { registerPluginMenu } from './plugin.menu';
import { navigatePlugin } from './plugin.navigate';
import { registerPluginPage } from './plugin.pages';
import { registerPluginSlot } from './plugin.slots';
import type {
  IPluginApi,
  IPluginCallResult,
  IPluginHookOptions,
  IPluginMenuEntry,
  PluginConfigPrimitive,
  PluginHookName,
  PluginLinkComponent,
  PluginSlotName,
} from './plugin.types';
import type { IPluginToastOptions } from './plugin.types';
import { PLUGIN_HOOK_NAMES } from './plugin.types';

type AnyHandler = (event: never) => void | Promise<void>;
import { pluginUi } from './plugin.ui';

// Same router link as the app uses. The type is narrowed for plugins (only `to`, `className`, `children`).
const PluginLink = Link as unknown as PluginLinkComponent;

/** `POST <endpoint>/plugin/<id>/<action>` with the current user's token. Never throws. */
export const callPluginAction = async <T = unknown>(
  pluginId: string,
  action: string,
  body: Record<string, unknown> = {}
): Promise<IPluginCallResult<T>> => {
  const endpoint = String(import.meta.env.VITE_MESH_SERVER_ENDPOINT ?? '').replace(/\/+$/, '');
  const url = `${endpoint}/plugin/${encodeURIComponent(pluginId)}/${encodeURIComponent(action)}`;
  const token = useAuthTokenStore.getState().token;
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        ...(token ? { 'x-auth-token': token } : {}),
        ...(getMeshClient().deviceId() ? { 'x-device-id': getMeshClient().deviceId() as string } : {}),
      },
      body: JSON.stringify(body),
    });
    // The server answers `{ ok, id, action, result }` on success. `data` is the handler's return value.
    const payload = (await response.json().catch(() => null)) as
      | { result?: T; error?: string; errors?: Record<string, string> }
      | null;
    return {
      ok: response.ok,
      status: response.status,
      data: response.ok ? (payload?.result ?? null) : null,
      error: response.ok ? null : (payload?.error ?? String(response.status)),
      errors: response.ok ? null : (payload?.errors ?? null),
    };
  } catch {
    return { ok: false, status: 0, data: null, error: 'network' };
  }
};

/**
 * The API a plugin gets in `register()`. `allowedSlots` comes from the manifest:
 * a plugin may only register components for slots it declared.
 */
export const createPluginApi = (
  pluginId: string,
  allowedSlots: PluginSlotName[],
  assetBaseUrl: string,
  allowedPages: string[],
  allowedIntervene: string[],
  publicConfig: Record<string, PluginConfigPrimitive> = {}
): IPluginApi => ({
  React,
  config: {
    get: () => ({ ...publicConfig }),
  },
  ui: pluginUi,
  useLocale: usePluginLocale,
  useUser: usePluginUser,
  navigate: (to, options) => navigatePlugin(pluginId, to, options),
  icons: PLUGIN_ICONS,
  useForm: usePluginForm,
  toast: (message: string, options?: IPluginToastOptions) => {
    const type = options?.type ?? 'info';
    const show = {
      success: sonnerToast.success,
      error: sonnerToast.error,
      info: sonnerToast.info,
      warning: sonnerToast.warning,
    }[type];
    show(message, { description: options?.description });
  },
  confirm: options => usePluginConfirmStore.getState().ask(options),
  openDrawer: (component, options) => openPluginDrawer(pluginId, component, options),
  on: ((name: PluginHookName, handler: AnyHandler, options?: IPluginHookOptions) => {
    if (!(PLUGIN_HOOK_NAMES as readonly string[]).includes(name)) {
      console.warn(`[plugin:${pluginId}] unknown hook "${name}"`);
      return () => undefined;
    }
    if (name === 'router.beforeNavigate' && !allowedIntervene.includes(name)) {
      console.warn(`[plugin:${pluginId}] hook "${name}" needs "intervene" in plugin.json`);
      return () => undefined;
    }
    return addPluginHook(pluginId, name, handler, options);
  }) as IPluginApi['on'],
  registerMenuEntry: (entry: IPluginMenuEntry) => {
    // A menu entry only makes sense for a page the user may open.
    if (!allowedPages.includes(entry.page)) return;
    registerPluginMenu(pluginId, entry);
  },
  Link: PluginLink,
  call: (action, body) => callPluginAction(pluginId, action, body),
  assetUrl: path =>
    assetBaseUrl +
    path
      .split('/')
      .filter(part => part !== '' && part !== '.' && part !== '..')
      .map(encodeURIComponent)
      .join('/'),
  registerSlot: (slot, component) => {
    if (!allowedSlots.includes(slot)) {
      throw new Error(`plugin ${pluginId}: slot "${slot}" not declared in manifest`);
    }
    registerPluginSlot(pluginId, slot, component);
  },
  registerPage: (path, component, options) => {
    // Pages the user may not open are not in `allowedPages`. They are skipped, not an error.
    if (!allowedPages.includes(path)) return;
    registerPluginPage(pluginId, path, component, options);
  },
});
