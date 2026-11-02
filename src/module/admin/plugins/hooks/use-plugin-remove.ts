import { useCallback, useState } from 'react';

import { PluginApi } from '../api';
import type { IPluginRemoveResult } from '../types';

/** Deletes one inactive plugin. `busy` is true while the request runs. */
export const usePluginRemove = (onChanged: () => void) => {
  const [busy, setBusy] = useState(false);

  const remove = useCallback(
    async (pluginId: string): Promise<IPluginRemoveResult> => {
      setBusy(true);
      const result = await PluginApi.remove(pluginId);
      setBusy(false);
      if (result.success) onChanged();
      return result;
    },
    [onChanged]
  );

  return { busy, remove };
};
