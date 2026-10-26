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
import { Badge } from '@ui/shad-cn/components/badge.tsx';
import { Button } from '@ui/shad-cn/components/button.tsx';
import { Skeleton } from '@ui/shad-cn/components/skeleton.tsx';
import { Laptop, LogOut, Monitor, RefreshCw, Smartphone, Tablet } from 'lucide-react';
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { AuthApi } from '../api';
import { useErrorText } from '../hooks/use.error.text';
import { useOnOpen } from '../hooks/use.on.open';
import type { AuthPlatform, IAuthSession } from '../types';
import { PLATFORM_LABEL, relativeTime } from '../utils/format';
import { BigButton, ErrorNote, InfoBox, SecurityDrawer } from './ui';

const ICON: Record<AuthPlatform, typeof Smartphone> = {
  iphone: Smartphone,
  android: Smartphone,
  ipad: Tablet,
  android_tablet: Tablet,
  mac: Laptop,
  chromeos: Laptop,
  windows: Monitor,
  linux: Monitor,
  unknown: Monitor,
};

/** All signed-in devices of the account – sign out single devices or all others. */
export const SessionsDrawer: React.FC<{
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onChanged?: () => void;
}> = ({ open, onOpenChange, onChanged }) => {
  const { t, i18n } = useTranslation('security');
  const errorText = useErrorText();
  const [sessions, setSessions] = useState<IAuthSession[] | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [confirmAll, setConfirmAll] = useState(false);

  const load = useCallback(async () => {
    const result = await AuthApi.sessions();
    setError(result.success ? null : errorText(result));
    if (result.success) setSessions(result.sessions ?? []);
  }, [errorText]);

  useOnOpen(open, () => {
    setSessions(null);
    setError(null);
  });

  useEffect(() => {
    if (!open) return;
    let active = true;
    void AuthApi.sessions().then(result => {
      if (!active) return;
      setError(result.success ? null : errorText(result));
      if (result.success) setSessions(result.sessions ?? []);
    });
    return () => {
      active = false;
    };
  }, [open, errorText]);

  const revoke = async (session: IAuthSession) => {
    setBusyId(session.id);
    const result = await AuthApi.sessionRevoke(session.id);
    setBusyId(null);
    if (!result.success) {
      toast.error(errorText(result));
      return;
    }
    setSessions(result.sessions ?? []);
    onChanged?.();
    toast.success(t('sessions.revoked', { device: deviceName(session) }));
  };

  const revokeOthers = async () => {
    setConfirmAll(false);
    setBusyId('all');
    const result = await AuthApi.sessionRevokeOthers();
    setBusyId(null);
    if (!result.success) {
      toast.error(errorText(result));
      return;
    }
    setSessions(result.sessions ?? []);
    onChanged?.();
    toast.success(t('sessions.revokedOthers', { count: result.count ?? 0 }));
  };

  const deviceName = (session: IAuthSession) =>
    [PLATFORM_LABEL[session.platform] || t('sessions.unknownDevice'), session.browser]
      .filter(Boolean)
      .join(' · ');

  const others = (sessions ?? []).filter(session => !session.current);

  return (
    <SecurityDrawer
      open={open}
      onOpenChange={onOpenChange}
      title={t('sessions.title')}
      description={t('sessions.description')}
      locked={busyId === 'all'}
      action={
        <Button
          variant="ghost"
          size="icon-lg"
          pill
          onClick={() => {
            setSessions(null);
            void load();
          }}
          aria-label={t('common.refresh')}
          title={t('common.refresh')}
        >
          <RefreshCw />
        </Button>
      }
      footer={
        others.length > 0 ? (
          <BigButton
            variant="outline"
            onClick={() => setConfirmAll(true)}
            isLoading={busyId === 'all'}
            disabled={Boolean(busyId)}
          >
            <LogOut />
            {t('sessions.revokeOthers', { count: others.length })}
          </BigButton>
        ) : undefined
      }
    >
      <p className="px-4 pt-4 pb-2 text-body leading-5 text-muted-foreground">
        {t('sessions.text')}
      </p>

      <ErrorNote message={error} className="px-4 py-2" />

      {!sessions && !error && (
        <div className="flex flex-col">
          {[0, 1, 2].map(index => (
            <div
              key={index}
              className="flex items-center gap-4 border-b border-border/50 px-4 py-4"
            >
              <Skeleton className="size-11 rounded-full" />
              <div className="flex flex-1 flex-col gap-2">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-3 w-56" />
              </div>
            </div>
          ))}
        </div>
      )}

      {sessions && (
        <ul className="flex flex-col" aria-label={t('sessions.title')}>
          {sessions.map(session => {
            const Icon = ICON[session.platform] ?? Monitor;
            const meta = [
              session.current
                ? null
                : session.online
                  ? t('sessions.online')
                  : t('sessions.active', {
                      time: relativeTime(session.lastActiveAt, i18n.language),
                    }),
              t(`methods.${session.method}`, { defaultValue: '' }) || null,
              session.ip,
            ].filter(Boolean);
            return (
              <li
                key={session.id}
                className="flex items-center gap-4 border-b border-border/50 px-4 py-3.5"
              >
                <span className="relative grid size-11 shrink-0 place-items-center rounded-full border border-border/60">
                  <Icon aria-hidden="true" className="size-5" strokeWidth={1.75} />
                  {session.online && (
                    <span
                      aria-hidden="true"
                      className="absolute right-0 bottom-0 size-3 rounded-full border-2 border-background bg-foreground"
                    />
                  )}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-body leading-5 font-bold break-words text-foreground">
                      {deviceName(session)}
                    </span>
                    {session.standalone && (
                      <Badge variant="outline" className="rounded-full">
                        {t('sessions.app')}
                      </Badge>
                    )}
                    {session.current && (
                      <Badge className="rounded-full bg-foreground text-background">
                        {t('sessions.current')}
                      </Badge>
                    )}
                  </div>
                  {meta.length > 0 && (
                    <p className="mt-0.5 text-caption leading-4 break-words text-muted-foreground">
                      {meta.join(' · ')}
                    </p>
                  )}
                  <p className="mt-0.5 text-caption leading-4 text-muted-foreground">
                    {t('sessions.since', {
                      date: new Date(session.createdAt).toLocaleDateString(i18n.language, {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      }),
                    })}
                  </p>
                </div>
                {!session.current && (
                  <Button
                    variant="outline"
                    pill
                    size="lg"
                    className="h-10 shrink-0 px-4 font-bold"
                    onClick={() => revoke(session)}
                    isLoading={busyId === session.id}
                    disabled={Boolean(busyId)}
                    aria-label={t('sessions.revokeLabel', { device: deviceName(session) })}
                  >
                    {t('sessions.revoke')}
                  </Button>
                )}
              </li>
            );
          })}
        </ul>
      )}

      {sessions && others.length === 0 && (
        <p className="px-4 py-4 text-body leading-5 text-muted-foreground">
          {t('sessions.onlyThis')}
        </p>
      )}

      <InfoBox className="m-4">{t('sessions.hint')}</InfoBox>

      <AlertDialog open={confirmAll} onOpenChange={setConfirmAll}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('sessions.confirmTitle')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('sessions.confirmText', { count: others.length })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={revokeOthers}>
              {t('sessions.confirmAction')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </SecurityDrawer>
  );
};
