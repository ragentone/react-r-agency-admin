import { useAuth } from '@core/auth/components/use.auth.ts';
import { CoreVariables } from '@core/core.variables.ts';
import { useRouter } from '@tanstack/react-router';
import { Checkbox } from '@ui/shad-cn/components/checkbox.tsx';
import { CalendarClock, Trash2 } from 'lucide-react';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { AuthApi } from '../api';
import { useErrorText } from '../hooks/use.error.text';
import { useOnOpen } from '../hooks/use.on.open';
import { withSudo } from '../sudo';
import { downloadJson, formatDate } from '../utils/format';
import { BigButton, ErrorNote, InfoBox, SecurityDrawer } from './ui';

/** Account deletion with 30 days to change your mind (signing in again offers to cancel). */
export const DeleteDrawer: React.FC<{ open: boolean; onOpenChange: (open: boolean) => void }> = ({
  open,
  onOpenChange,
}) => {
  const { t, i18n } = useTranslation('security');
  const errorText = useErrorText();
  const { destroy } = useAuth();
  const router = useRouter();
  const [confirmed, setConfirmed] = useState(false);
  const [busy, setBusy] = useState<'delete' | 'export' | null>(null);
  const [error, setError] = useState<string | null>(null);

  useOnOpen(open, () => {
    setConfirmed(false);
    setError(null);
  });

  const exportFirst = async () => {
    setBusy('export');
    const result = await withSudo(() => AuthApi.exportData());
    setBusy(null);
    if (result.error === 'sudo_required') return;
    if (!result.success) {
      toast.error(errorText(result));
      return;
    }
    downloadJson(result.data, `account-export-${new Date().toISOString().slice(0, 10)}.json`);
  };

  const remove = async () => {
    setBusy('delete');
    setError(null);
    const result = await withSudo(() => AuthApi.deleteRequest());
    setBusy(null);
    if (result.error === 'sudo_required') return;
    if (!result.success) {
      setError(errorText(result));
      return;
    }
    toast.success(
      t('delete.scheduled', {
        date: result.deleteAt ? formatDate(result.deleteAt, i18n.language) : '',
      })
    );
    onOpenChange(false);
    // The server signed out every device – this one too.
    destroy();
    void router.navigate({ to: CoreVariables.routePathAuth, replace: true });
  };

  return (
    <SecurityDrawer
      open={open}
      onOpenChange={onOpenChange}
      title={t('delete.title')}
      description={t('delete.description')}
      locked={Boolean(busy)}
      footer={
        <BigButton
          variant="destructive"
          onClick={remove}
          disabled={!confirmed || Boolean(busy)}
          isLoading={busy === 'delete'}
        >
          <Trash2 />
          {t('delete.action')}
        </BigButton>
      }
    >
      <div className="flex flex-col gap-4 p-4">
        <InfoBox icon={CalendarClock}>{t('delete.text', { days: 30 })}</InfoBox>
        <p className="text-body leading-5 text-muted-foreground">{t('delete.exportHint')}</p>
        <BigButton
          variant="outline"
          onClick={exportFirst}
          isLoading={busy === 'export'}
          disabled={Boolean(busy)}
        >
          {t('data.export')}
        </BigButton>
        <label
          htmlFor="security-delete-confirm"
          className="flex cursor-pointer items-start gap-3 rounded-2xl border border-border/60 p-4 select-none"
        >
          <Checkbox
            id="security-delete-confirm"
            checked={confirmed}
            onCheckedChange={value => setConfirmed(value === true)}
            className="mt-0.5"
          />
          <span className="text-body leading-5 font-medium">{t('delete.confirm')}</span>
        </label>
        <ErrorNote message={error} />
      </div>
    </SecurityDrawer>
  );
};
