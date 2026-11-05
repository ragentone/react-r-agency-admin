import { useEffect, useState } from 'react';

import { PluginApi } from '../api';
import type { IPluginTableDefinition } from '../types';

interface IPluginTablesState {
  loading: boolean;
  error: string | null;
  tables: IPluginTableDefinition[];
}

/** Loads the table definitions a plugin declares in its backend. `retry` loads again. */
export const usePluginTables = (pluginId: string) => {
  const [attempt, setAttempt] = useState(0);
  const [state, setState] = useState<IPluginTablesState>({ loading: true, error: null, tables: [] });

  useEffect(() => {
    let active = true;
    void PluginApi.tables(pluginId).then(result => {
      if (!active) return;
      setState({
        loading: false,
        error: result.success ? null : (result.error ?? 'unknown'),
        tables: result.tables ?? [],
      });
    });
    return () => {
      active = false;
    };
  }, [pluginId, attempt]);

  const retry = () => {
    setState({ loading: true, error: null, tables: [] });
    setAttempt(value => value + 1);
  };

  return { ...state, retry };
};
