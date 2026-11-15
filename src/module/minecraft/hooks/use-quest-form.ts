import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { AdminMinecraftQuestApi } from '../api.quest';
import type { IMinecraftQuest, IMinecraftQuestReward, IMinecraftQuestStep } from '../types.quest';

const SIGNAL = /^[a-z0-9_]{0,32}$/;

/** Formular einer Aufgabe (neu oder bearbeiten): Zustand, Prüfung, Speichern. */
export function useQuestForm(serverId: string, quest: IMinecraftQuest | null, onSaved: () => void) {
  const { t } = useTranslation('minecraft');
  const [title, setTitle] = useState(quest?.title ?? '');
  const [intro, setIntro] = useState(quest?.intro ?? '');
  const [steps, setSteps] = useState<IMinecraftQuestStep[]>(
    quest?.steps ?? [{ text: '', signal: '' }]
  );
  const [reward, setReward] = useState<IMinecraftQuestReward | null>(quest?.reward ?? null);
  const [busy, setBusy] = useState(false);

  const valid =
    title.trim().length > 0 &&
    steps.every(step => step.text.trim().length > 0 && SIGNAL.test(step.signal)) &&
    (!reward || (Number.isInteger(reward.amount) && reward.amount >= 1 && reward.amount <= 64));

  const save = async (): Promise<boolean> => {
    setBusy(true);
    const result = await AdminMinecraftQuestApi.save(serverId, quest?.id ?? null, {
      title,
      intro,
      steps,
      reward,
    });
    setBusy(false);
    if (!result.success) {
      toast.error(
        t(`quest.error.${result.error ?? 'unknown'}`, { defaultValue: t('action.error.unknown') })
      );
      return false;
    }
    toast.success(t('quest.saved'));
    onSaved();
    return true;
  };

  return {
    title,
    setTitle,
    intro,
    setIntro,
    steps,
    setSteps,
    reward,
    setReward,
    busy,
    valid,
    save,
  };
}
