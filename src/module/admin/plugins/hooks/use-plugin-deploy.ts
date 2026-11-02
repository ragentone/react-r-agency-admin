import { useCallback, useState } from 'react';

import { PluginApi } from '../api';
import type { IPluginDeployResult } from '../types';
import type { PluginBump } from '../version';

/** Builds and activates one development plugin. `busy` is true while the request runs. */
export const usePluginDeploy = (onDeployed: () => void) => {
  const [busy, setBusy] = useState(false);

  const deploy = useCallback(
    async (pluginId: string, bump: PluginBump): Promise<IPluginDeployResult> => {
      setBusy(true);
      const result = await PluginApi.deployDev(pluginId, bump);
      setBusy(false);
      if (result.success) onDeployed();
      return result;
    },
    [onDeployed]
  );

  return { busy, deploy };
};
