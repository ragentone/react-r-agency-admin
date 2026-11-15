import { AppDialog } from '@ui/components';
import { Badge } from '@ui/shad-cn/components/badge.tsx';
import { Button } from '@ui/shad-cn/components/button.tsx';
import { Skeleton } from '@ui/shad-cn/components/skeleton.tsx';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { AdminMinecraftQuestApi } from '../api.quest';
import { useQuestProgress } from '../hooks/use-quest-progress';
import type { IMinecraftQuest } from '../types.quest';

/** Fortschritt der Spieler; bei aktiver Aufgabe lässt sich der Schritt eines Online-Spielers abhaken. */
export const QuestProgressDialog: React.FC<{
  quest: IMinecraftQuest;
  onChanged: () => void;
  onClose: () => void;
}> = ({ quest, onChanged, onClose }) => {
  const { t } = useTranslation('minecraft');
  const { progress, reload } = useQuestProgress(quest.id);
  const [pending, setPending] = useState<string | null>(null);

  const advance = async (xuid: string, gamertag: string) => {
    setPending(xuid);
    const result = await AdminMinecraftQuestApi.advance(quest.id, gamertag);
    setPending(null);
    if (!result.success) {
      toast.error(
        t(`quest.error.${result.error ?? 'unknown'}`, { defaultValue: t('action.error.unknown') })
      );
      return;
    }
    toast.success(t('quest.progress.advanced', { name: gamertag }));
    await reload();
    onChanged();
  };

  return (
    <AppDialog
      open
      onOpenChange={open => !open && onClose()}
      title={t('quest.progress.title', { title: quest.title })}
      description={t('quest.progress.text')}
      size="md"
      bodyClassName="flex flex-col p-4"
      footer={
        <Button variant="outline" onClick={onClose}>
          {t('bds.close')}
        </Button>
      }
    >
      {!progress && <Skeleton className="h-24 w-full" aria-label={t('quest.loading')} />}
      {progress?.length === 0 && (
        <p className="py-6 text-center text-caption text-muted-foreground">
          {t('quest.progress.empty')}
        </p>
      )}
      {progress?.map(entry => (
        <div
          key={entry.xuid}
          className="flex items-center justify-between gap-3 border-b border-border/50 py-3 last:border-b-0"
        >
          <div className="min-w-0">
            <p className="flex items-center gap-2 truncate font-bold">
              <span
                role="img"
                aria-label={entry.online ? t('playerList.online') : t('playerList.offline')}
                className={`size-2 shrink-0 rounded-full ${entry.online ? 'bg-success' : 'bg-muted-foreground/30'}`}
              />
              <span className="truncate">
                {entry.alias ?? entry.gamertag ?? t('quest.progress.unknown')}
              </span>
            </p>
            <p className="truncate text-caption text-muted-foreground">
              {entry.doneAt
                ? t('quest.progress.doneAt', { date: new Date(entry.doneAt).toLocaleString() })
                : t('quest.progress.step', {
                    current: entry.step + 1,
                    total: quest.steps.length,
                  })}
            </p>
          </div>
          {entry.doneAt ? (
            <Badge>{t('quest.progress.done')}</Badge>
          ) : (
            quest.status === 'active' &&
            entry.online &&
            entry.gamertag && (
              <Button
                variant="outline"
                size="sm"
                isLoading={pending === entry.xuid}
                disabled={pending !== null}
                onClick={() => void advance(entry.xuid, entry.gamertag as string)}
              >
                {t('quest.progress.advance')}
              </Button>
            )
          )}
        </div>
      ))}
    </AppDialog>
  );
};
