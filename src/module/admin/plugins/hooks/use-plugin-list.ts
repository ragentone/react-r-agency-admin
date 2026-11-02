import { useCallback, useEffect, useState } from 'react';

import { PluginApi } from '../api';
import type { IPluginListItem, IPluginListResult } from '../types';

interface IPluginListState {
  loading: boolean;
  error: boolean;
  plugins: IPluginListItem[];
}

const stateOf = (result: IPluginListResult): IPluginListState =>
  result.success
    ? { loading: false, error: false, plugins: result.plugins ?? [] }
    : { loading: false, error: true, plugins: [] };

/** Loads the installed plugins on mount; `reload` shows the loading state and fetches again. */
export const usePluginList = () => {
  const [state, setState] = useState<IPluginListState>({
    loading: true,
    error: false,
    plugins: [],
  });

  useEffect(() => {
    let active = true;
    void PluginApi.list().then(result => {
      if (active) setState(stateOf(result));
    });
    return () => {
      active = false;
    };
  }, []);

  const reload = useCallback(() => {
    setState(previous => ({ ...previous, loading: true }));
    return PluginApi.list().then(result => setState(stateOf(result)));
  }, []);

  return { ...state, reload };
};
