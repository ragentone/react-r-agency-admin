import { useCallback, useState } from 'react';

import { PluginApi } from '../api';
import type { IPluginUploadResult } from '../types';

/** Uploads a plugin ZIP. `onUploaded` runs after a successful install (e.g. to reload the list). */
export const usePluginUpload = (onUploaded: () => void) => {
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<IPluginUploadResult | null>(null);

  const upload = useCallback(
    async (file: File) => {
      setBusy(true);
      setResult(null);
      const response = await PluginApi.upload(file);
      setResult(response);
      setBusy(false);
      if (response.success) onUploaded();
      return response;
    },
    [onUploaded]
  );

  const reset = useCallback(() => setResult(null), []);

  return { busy, result, upload, reset };
};
