import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@ui/shad-cn/components/alert-dialog.tsx';
import { Button } from '@ui/shad-cn/components/button.tsx';
import { Skeleton } from '@ui/shad-cn/components/skeleton.tsx';
import { Textarea } from '@ui/shad-cn/components/textarea.tsx';
import { ToggleGroup, ToggleGroupItem } from '@ui/shad-cn/components/toggle-group.tsx';
import { Ban } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { AuthApi } from '../api';
import { useErrorText } from '../hooks/use.error.text';
import type { IAuthBan } from '../types';
import { formatDate } from '../utils/format';
import {} from './ui';

const DURATIONS = ['1', '7', '30', 'forever'] as const;
type Duration = (typeof DURATIONS)[number];

/** Admin: ban a user (1/7/30 days or permanently, with reason) or lift the ban. */
export const AdminBanPanel: React.FC<{ userId: string; disabled?: boolean }> = ({
  userId,
  disabled,
}) => {
  const { t, i18n } = useTranslation('security');
  const errorText = useErrorText();
  const [ban, setBan] = useState<IAuthBan | null>(null);
  const [duration, setDuration] = useState<Duration>('7');
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);
  const [confirm, setConfirm] = useState(false);

  // Remounted per user (`key`) → fresh state; only the ban state is loaded here.
  useEffect(() => {
    void AuthApi.adminBanInfo(userId).then(result => setBan(result.ban ?? null));
  }, [userId]);

  const apply = async () => {
    setConfirm(false);
    setBusy(true);
    const until =
      duration === 'forever'
        ? null
        : new Date(Date.now() + Number(duration) * 86_400_000).toISOString();
    const result = await AuthApi.adminBan(userId, until, reason.trim() || null);
    setBusy(false);
    if (!result.success) {
      toast.error(errorText(result));
      return;
    }
    setBan(result.ban ?? null);
    toast.success(t('ban.done'));
  };

  const lift = async () => {
    setBusy(true);
    const result = await AuthApi.adminUnban(userId);
    setBusy(false);
    if (!result.success) {
      toast.error(errorText(result));
      return;
    }
    setBan(result.ban ?? null);
    toast.success(t('ban.lifted'));
  };

  const permanent = ban?.bannedUntil ? new Date(ban.bannedUntil).getUTCFullYear() >= 9000 : false;

  return (
    <section aria-labelledby="admin-ban-title" className="flex flex-col gap-3">
      <h3 id="admin-ban-title" className="flex items-center gap-2 text-title font-bold">
        <Ban aria-hidden="true" className="size-5" strokeWidth={1.75} />
        {t('ban.title')}
      </h3>
      {!ban && <Skeleton className="h-24 w-full rounded-2xl" />}
      {ban?.banned && (
        <div className="flex flex-col gap-3 rounded-2xl border border-foreground p-4">
          <p className="text-body font-bold">
            {permanent
              ? t('ban.permanent')
              : t('ban.until', {
                  date: ban.bannedUntil ? formatDate(ban.bannedUntil, i18n.language) : '',
                })}
          </p>
          {ban.banReason && (
            <p className="text-body leading-5 text-muted-foreground">{ban.banReason}</p>
          )}
          <Button
            variant="outline"
            pill
            className="h-11 font-bold"
            onClick={lift}
            isLoading={busy}
            disabled={disabled}
          >
            {t('ban.lift')}
          </Button>
        </div>
      )}
      {ban && !ban.banned && (
        <div className="flex flex-col gap-3">
          <p className="text-body leading-5 text-muted-foreground">{t('ban.text')}</p>
          <ToggleGroup
            type="single"
            value={duration}
            onValueChange={value => value && setDuration(value as Duration)}
            className="grid grid-cols-4 gap-2"
            aria-label={t('ban.duration')}
          >
            {DURATIONS.map(value => (
              <ToggleGroupItem
                key={value}
                value={value}
                className="h-11 rounded-full border border-border/60 font-bold data-[state=on]:border-foreground data-[state=on]:bg-foreground data-[state=on]:text-background"
              >
                {t(`ban.d${value}`)}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
          <Textarea
            value={reason}
            onChange={event => setReason(event.target.value)}
            maxLength={500}
            placeholder={t('ban.reason')}
            aria-label={t('ban.reason')}
            className="min-h-20 rounded-2xl text-[16px]"
          />
          <Button
            variant="destructive"
            pill
            className="h-12 font-bold"
            onClick={() => setConfirm(true)}
            isLoading={busy}
            disabled={disabled}
          >
            {t('ban.action')}
          </Button>
        </div>
      )}

      <AlertDialog open={confirm} onOpenChange={setConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('ban.confirmTitle')}</AlertDialogTitle>
            <AlertDialogDescription>{t('ban.confirmText')}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={apply}>{t('ban.action')}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
};
