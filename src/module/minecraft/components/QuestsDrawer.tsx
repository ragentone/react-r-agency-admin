import { AppDrawer } from '@ui/patterns';
import { Button } from '@ui/shad-cn/components/button.tsx';
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@ui/shad-cn/components/empty.tsx';
import { Plus, ScrollText } from 'lucide-react';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { AdminMinecraftQuestApi } from '../api.quest';
import { useQuests } from '../hooks/use-quests';
import type { IMinecraftQuest } from '../types.quest';
import { QuestDeleteDialog } from './QuestDeleteDialog';
import { QuestFormDialog } from './QuestFormDialog';
import { QuestProgressDialog } from './QuestProgressDialog';
import { QuestRow } from './QuestRow';
import { QuestRowMenu } from './QuestRowMenu';

/** Aufgaben eines Servers: Liste, Anlegen, Aktivieren/Beenden, Fortschritt, Löschen. */
export const QuestsDrawer: React.FC<{
  server: { id: string; name: string };
  open: boolean;
  onOpenChange: (open: boolean) => void;
}> = ({ server, open, onOpenChange }) => {
  const { t } = useTranslation('minecraft');
  const { quests, items, reload } = useQuests(server.id, open);
  const [form, setForm] = useState<IMinecraftQuest | 'new' | null>(null);
  const [progressId, setProgressId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<IMinecraftQuest | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const watched = quests?.find(quest => quest.id === progressId) ?? null;

  const toggle = async (quest: IMinecraftQuest) => {
    const next = quest.status === 'active' ? 'ended' : 'active';
    setBusy(quest.id);
    const result = await AdminMinecraftQuestApi.setStatus(quest.id, next);
    setBusy(null);
    if (!result.success) {
      toast.error(t('action.error.unknown'));
      return;
    }
    toast.success(t(next === 'active' ? 'quest.activated' : 'quest.ended'));
    await reload();
  };

  return (
    <AppDrawer
      open={open}
      onOpenChange={onOpenChange}
      locked={form !== null}
      title={t('quest.title', { name: server.name })}
      description={t('quest.text')}
      action={
        <Button
          variant="ghost"
          size="icon-md"
          aria-label={t('quest.form.createTitle')}
          onClick={() => setForm('new')}
        >
          <Plus />
        </Button>
      }
      contentProps={{ className: 'max-w-3xl' }}
    >
      {form && (
        <QuestFormDialog
          serverId={server.id}
          quest={form === 'new' ? null : form}
          items={items}
          onSaved={() => void reload()}
          onClose={() => setForm(null)}
        />
      )}
      {watched && (
        <QuestProgressDialog
          quest={watched}
          onChanged={() => void reload()}
          onClose={() => setProgressId(null)}
        />
      )}
      {deleting && (
        <QuestDeleteDialog
          quest={deleting}
          onDone={() => void reload()}
          onClose={() => setDeleting(null)}
        />
      )}
      {quests?.length === 0 && (
        <Empty className="px-4 py-12">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <ScrollText />
            </EmptyMedia>
            <EmptyTitle>{t('quest.empty')}</EmptyTitle>
            <EmptyDescription>{t('quest.emptyText')}</EmptyDescription>
          </EmptyHeader>
          <Button onClick={() => setForm('new')}>{t('quest.form.createTitle')}</Button>
        </Empty>
      )}
      {quests?.map(quest => (
        <QuestRow key={quest.id} quest={quest} onOpen={() => setProgressId(quest.id)}>
          <QuestRowMenu
            active={quest.status === 'active'}
            busy={busy === quest.id}
            onProgress={() => setProgressId(quest.id)}
            onToggle={() => void toggle(quest)}
            onEdit={() => setForm(quest)}
            onDelete={() => setDeleting(quest)}
          />
        </QuestRow>
      ))}
    </AppDrawer>
  );
};
