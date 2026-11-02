import { useCallback, useState } from 'react';

import { PluginApi } from '../api';
import type { IPluginStatusResult } from '../types';

/** Activates or deactivates one plugin. `pending` holds the id of the plugin being switched. */
export const usePluginStatus = (onChanged: () => void) => {
  const [pending, setPending] = useState<string | null>(null);

  const setStatus = useCallback(
    async (pluginId: string, active: boolean): Promise<IPluginStatusResult> => {
      setPending(pluginId);
      const result = await PluginApi.setStatus(pluginId, active ? 'active' : 'inactive');
      setPending(null);
      if (result.success) onChanged();
      return result;
    },
    [onChanged]
  );

  return { pending, setStatus };
};
