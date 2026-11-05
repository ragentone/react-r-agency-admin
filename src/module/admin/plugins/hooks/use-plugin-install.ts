import { useCallback, useState } from 'react';

import { PluginApi } from '../api';
import type { IPluginDeployResult } from '../types';

/** Starts `npm install` for one development plugin. `busy` is true while the request runs. */
export const usePluginInstall = () => {
  const [busy, setBusy] = useState(false);

  const install = useCallback(async (pluginId: string): Promise<IPluginDeployResult> => {
    setBusy(true);
    const result = await PluginApi.installDev(pluginId);
    setBusy(false);
    return result;
  }, []);

  return { busy, install };
};
