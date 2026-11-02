import { useCallback, useState } from 'react';

import { PluginApi } from '../api';
import type { IPluginCreateResult } from '../types';

/** Creates a development template. `busy` is true while the request runs. */
export const usePluginCreate = (onCreated: () => void) => {
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<IPluginCreateResult | null>(null);

  const create = useCallback(
    async (input: { name: string; slots: string[] }) => {
      setBusy(true);
      setResult(null);
      const response = await PluginApi.createDraft(input);
      setResult(response);
      setBusy(false);
      if (response.success) onCreated();
      return response;
    },
    [onCreated]
  );

  const reset = useCallback(() => setResult(null), []);

  return { busy, result, create, reset };
};
