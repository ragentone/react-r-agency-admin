import { AppDialog } from '@ui/components';
import { Button } from '@ui/shad-cn/components/button.tsx';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { AdminMinecraftQuestApi } from '../api.quest';
import type { IMinecraftQuest } from '../types.quest';

/** Bestätigung: Aufgabe samt Fortschritt aller Spieler löschen. */
export const QuestDeleteDialog: React.FC<{
  quest: IMinecraftQuest;
  onDone: () => void;
  onClose: () => void;
}> = ({ quest, onDone, onClose }) => {
  const { t } = useTranslation('minecraft');
  const [busy, setBusy] = useState(false);

  const confirm = async () => {
    setBusy(true);
    const result = await AdminMinecraftQuestApi.remove(quest.id);
    setBusy(false);
    if (!result.success) {
      toast.error(t('action.error.unknown'));
      return;
    }
    toast.success(t('quest.deleteDone'));
    onDone();
    onClose();
  };

  return (
    <AppDialog
      open
      onOpenChange={open => !open && onClose()}
      title={t('quest.deleteTitle')}
      description={t('quest.deleteText', { title: quest.title })}
      size="sm"
      bodyClassName="p-4"
      footer={
        <>
          <Button variant="outline" disabled={busy} onClick={onClose}>
            {t('form.cancel')}
          </Button>
          <Button variant="destructive" isLoading={busy} onClick={() => void confirm()}>
            {t('action.delete')}
          </Button>
        </>
      }
    >
      <p className="text-caption text-muted-foreground">
        {t('quest.summary', {
          steps: quest.steps.length,
          players: quest.players,
          finished: quest.finished,
        })}
      </p>
    </AppDialog>
  );
};
