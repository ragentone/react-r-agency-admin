import { useCallback, useEffect, useState } from 'react';

import { PluginApi } from '../api';
import type {
  IPluginAdoptResult,
  IPluginRemoveResult,
  IPluginUnknownItem,
  IPluginUnknownResult,
} from '../types';

interface IPluginUnknownState {
  loading: boolean;
  error: boolean;
  plugins: IPluginUnknownItem[];
}

const stateOf = (result: IPluginUnknownResult): IPluginUnknownState =>
  result.success
    ? { loading: false, error: false, plugins: result.plugins ?? [] }
    : { loading: false, error: true, plugins: [] };

/**
 * Plugin folders on disk that the registry does not know. `adopt` registers one, `remove` deletes
 * its files. Both reload the list; `onChanged` runs after a successful adopt so the installed list can follow.
 */
export const usePluginUnknown = (onChanged: () => void) => {
  const [state, setState] = useState<IPluginUnknownState>({
    loading: true,
    error: false,
    plugins: [],
  });
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let active = true;
    void PluginApi.unknown().then(result => {
      if (active) setState(stateOf(result));
    });
    return () => {
      active = false;
    };
  }, []);

  const reload = useCallback(() => {
    setState(previous => ({ ...previous, loading: true }));
    return PluginApi.unknown().then(result => setState(stateOf(result)));
  }, []);

  const adopt = useCallback(
    async (pluginId: string): Promise<IPluginAdoptResult> => {
      setBusy(true);
      const result = await PluginApi.adopt(pluginId);
      setBusy(false);
      if (result.success) {
        await reload();
        onChanged();
      }
      return result;
    },
    [reload, onChanged]
  );

  const remove = useCallback(
    async (pluginId: string): Promise<IPluginRemoveResult> => {
      setBusy(true);
      const result = await PluginApi.removeUnknown(pluginId);
      setBusy(false);
      if (result.success) await reload();
      return result;
    },
    [reload]
  );

  return { ...state, busy, reload, adopt, remove };
};
