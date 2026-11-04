import { useEffect, useState } from 'react';

import { PluginApi } from '../api';
import type { IPluginConfigField } from '../types';

interface IPluginConfigFieldsState {
  loading: boolean;
  error: string | null;
  fields: IPluginConfigField[];
}

/** Loads the configuration fields a plugin declares (schema only, no values). `retry` loads again. */
export const usePluginConfigFields = (pluginId: string) => {
  const [attempt, setAttempt] = useState(0);
  const [state, setState] = useState<IPluginConfigFieldsState>({ loading: true, error: null, fields: [] });

  useEffect(() => {
    let active = true;
    void PluginApi.configGet(pluginId).then(result => {
      if (!active) return;
      setState({
        loading: false,
        error: result.success ? null : (result.error ?? 'unknown'),
        fields: result.fields ?? [],
      });
    });
    return () => {
      active = false;
    };
  }, [pluginId, attempt]);

  const retry = () => {
    setState({ loading: true, error: null, fields: [] });
    setAttempt(value => value + 1);
  };

  return { ...state, retry };
};
