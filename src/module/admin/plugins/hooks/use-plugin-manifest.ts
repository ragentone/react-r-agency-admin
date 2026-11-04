import { useEffect, useState } from 'react';

import { PluginApi } from '../api';

interface IPluginManifestState {
  loading: boolean;
  error: string | null;
  /** plugin.json, formatted as JSON with two-space indent. Raw text when it is not valid JSON. */
  text: string;
}

/** Pretty-prints JSON; invalid JSON is shown as it is. */
const formatJson = (raw: string): string => {
  try {
    return JSON.stringify(JSON.parse(raw), null, 2);
  } catch {
    return raw;
  }
};

/** Loads `plugin.json` of the development project. `retry` loads again. */
export const usePluginManifest = (pluginId: string) => {
  const [attempt, setAttempt] = useState(0);
  const [state, setState] = useState<IPluginManifestState>({ loading: true, error: null, text: '' });

  useEffect(() => {
    let active = true;
    void PluginApi.readFile(pluginId, 'plugin.json').then(result => {
      if (!active) return;
      setState({
        loading: false,
        error: result.success ? null : (result.error ?? 'unknown'),
        text: result.success ? formatJson(result.content ?? '') : '',
      });
    });
    return () => {
      active = false;
    };
  }, [pluginId, attempt]);

  const retry = () => {
    setState({ loading: true, error: null, text: '' });
    setAttempt(value => value + 1);
  };

  return { ...state, retry };
};
