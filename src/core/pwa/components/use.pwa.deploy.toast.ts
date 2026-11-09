import { useCallback } from 'react';
import { toast } from 'sonner';

import { PWA_DEPLOY_TOAST_ID } from '../const';

/**
 * A new build went live: the "update on its way" toast goes away. The announcement of a waiting
 * version is `PwaUpdateDrawer` (shown for push, polling and reconnect alike).
 */
export const usePwaDeployToast = () => {
  const onVersion = useCallback(() => toast.dismiss(PWA_DEPLOY_TOAST_ID), []);
  return { onVersion };
};
