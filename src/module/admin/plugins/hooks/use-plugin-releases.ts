import { useCallback, useEffect, useState } from 'react';

import { PluginApi } from '../api';
import type { IPluginRelease, IPluginReleasesResult } from '../types';

interface IPluginReleasesState {
  loading: boolean;
  error: boolean;
  current: string | null;
  releases: IPluginRelease[];
}

const stateOf = (result: IPluginReleasesResult): IPluginReleasesState =>
  result.success
    ? { loading: false, error: false, current: result.current ?? null, releases: result.releases ?? [] }
    : { loading: false, error: true, current: null, releases: [] };

/** Release ZIPs of a development plugin. Loads on mount and again after every delete. */
export const usePluginReleases = (pluginId: string) => {
  const [state, setState] = useState<IPluginReleasesState>({
    loading: true,
    error: false,
    current: null,
    releases: [],
  });

  const load = useCallback(
    () => PluginApi.releases(pluginId).then(result => setState(stateOf(result))),
    [pluginId]
  );

  useEffect(() => {
    void load();
  }, [load]);

  const remove = useCallback(
    async (version: string) => {
      const result = await PluginApi.releaseDelete(pluginId, version);
      if (result.success) await load();
      return result;
    },
    [pluginId, load]
  );

  return { ...state, reload: load, remove };
};
