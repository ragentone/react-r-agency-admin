import { withSudo } from '@core/security';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { AdminCronApi } from '../api';

/** Runs a job now (asks to confirm the identity first) and reports the result as a toast. */
export const useCronRun = (onDone: () => void) => {
  const { t } = useTranslation('admin-cron');
  const [busy, setBusy] = useState(false);

  const run = async (name: string): Promise<boolean> => {
    setBusy(true);
    const result = await withSudo(() => AdminCronApi.run(name));
    setBusy(false);
    if (result.error === 'sudo_required') return false;
    if (!result.success) {
      toast.error(t(`error.${result.error ?? 'unknown'}`, { defaultValue: t('error.unknown') }));
      return false;
    }
    if (result.run?.success) toast.success(t('run.done', { name }));
    else toast.error(t('run.failed', { name }));
    onDone();
    return true;
  };

  return { run, busy };
};
