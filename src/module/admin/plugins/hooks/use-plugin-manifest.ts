import { useEffect, useState } from 'react';

import { PluginApi } from '../api';

/** Result of parsing `plugin.json`: the value when it is valid JSON, otherwise `valid: false`. */
export type IPluginManifestParsed = { valid: true; value: unknown } | { valid: false };

interface IPluginManifestState {
  loading: boolean;
  error: string | null;
  /** `plugin.json` as it is stored. */
  raw: string;
  parsed: IPluginManifestParsed | null;
}

const parseManifest = (raw: string): IPluginManifestParsed => {
  try {
    return { valid: true, value: JSON.parse(raw) };
  } catch {
    return { valid: false };
  }
};

/** Loads `plugin.json` of the development project, parsed and raw. `retry` loads again. */
export const usePluginManifest = (pluginId: string) => {
  const [attempt, setAttempt] = useState(0);
  const [state, setState] = useState<IPluginManifestState>({ loading: true, error: null, raw: '', parsed: null });

  useEffect(() => {
    let active = true;
    void PluginApi.readFile(pluginId, 'plugin.json').then(result => {
      if (!active) return;
      const raw = result.success ? (result.content ?? '') : '';
      setState({
        loading: false,
        error: result.success ? null : (result.error ?? 'unknown'),
        raw,
        parsed: result.success ? parseManifest(raw) : null,
      });
    });
    return () => {
      active = false;
    };
  }, [pluginId, attempt]);

  const retry = () => {
    setState({ loading: true, error: null, raw: '', parsed: null });
    setAttempt(value => value + 1);
  };

  return { ...state, retry };
};
