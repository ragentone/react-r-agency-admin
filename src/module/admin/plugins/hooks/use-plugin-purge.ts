import { useCallback, useState } from 'react';

import { PluginApi } from '../api';
import type { IPluginPurgeResult } from '../types';

/** Deletes all stored data of one plugin. `busy` is true while the request runs. */
export const usePluginPurge = () => {
  const [busy, setBusy] = useState(false);

  const purge = useCallback(async (pluginId: string): Promise<IPluginPurgeResult> => {
    setBusy(true);
    const result = await PluginApi.purgeData(pluginId);
    setBusy(false);
    return result;
  }, []);

  return { busy, purge };
};
