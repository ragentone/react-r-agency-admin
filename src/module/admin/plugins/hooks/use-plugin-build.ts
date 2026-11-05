import { useCallback, useState } from 'react';

import { PluginApi } from '../api';
import type { IPluginDeployResult } from '../types';

/** Runs `npm run build` for one development plugin. `busy` is true while the request runs. */
export const usePluginBuild = () => {
  const [busy, setBusy] = useState(false);

  const build = useCallback(async (pluginId: string, reinstall = false): Promise<IPluginDeployResult> => {
    setBusy(true);
    const result = await PluginApi.buildDev(pluginId, reinstall);
    setBusy(false);
    return result;
  }, []);

  return { busy, build };
};
