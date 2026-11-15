import { AppDialog } from '@ui/components';
import { Button } from '@ui/shad-cn/components/button.tsx';
import { Input } from '@ui/shad-cn/components/input.tsx';
import { Label } from '@ui/shad-cn/components/label.tsx';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@ui/shad-cn/components/select.tsx';
import { Textarea } from '@ui/shad-cn/components/textarea.tsx';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { useQuestForm } from '../hooks/use-quest-form';
import type { IMinecraftQuest, IMinecraftQuestItem, MinecraftQuestLang } from '../types.quest';
import { QuestRewardFields } from './QuestRewardFields';
import { QuestStepsEditor } from './QuestStepsEditor';

/** Sprachen beim Namen genannt, damit man sie auch in einer fremden Admin-Sprache erkennt. */
const LANGS: Array<[MinecraftQuestLang, string]> = [
  ['de', 'Deutsch'],
  ['en', 'English'],
  ['ru', 'Русский'],
];

/** Aufgabe anlegen oder bearbeiten: Titel, Geschichte, Schritte, Belohnung. */
export const QuestFormDialog: React.FC<{
  serverId: string;
  quest: IMinecraftQuest | null;
  items: IMinecraftQuestItem[];
  onSaved: () => void;
  onClose: () => void;
}> = ({ serverId, quest, items, onSaved, onClose }) => {
  const { t } = useTranslation('minecraft');
  const form = useQuestForm(serverId, quest, onSaved);

  return (
    <AppDialog
      open
      onOpenChange={open => !open && onClose()}
      title={t(quest ? 'quest.form.editTitle' : 'quest.form.createTitle')}
      description={t('quest.form.text')}
      size="md"
      bodyClassName="flex flex-col gap-4 p-4"
      footer={
        <>
          <Button variant="outline" disabled={form.busy} onClick={onClose}>
            {t('form.cancel')}
          </Button>
          <Button
            isLoading={form.busy}
            disabled={!form.valid}
            onClick={() => void form.save().then(saved => saved && onClose())}
          >
            {t('quest.form.save')}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-2">
        <Label htmlFor="mc-quest-title">{t('quest.form.title')}</Label>
        <Input
          id="mc-quest-title"
          value={form.title}
          maxLength={40}
          placeholder={t('quest.form.titlePlaceholder')}
          onChange={event => form.setTitle(event.target.value)}
        />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="mc-quest-intro">{t('quest.form.intro')}</Label>
        <Textarea
          id="mc-quest-intro"
          rows={2}
          value={form.intro}
          maxLength={80}
          placeholder={t('quest.form.introPlaceholder')}
          onChange={event => form.setIntro(event.target.value)}
        />
        <p className="text-caption text-muted-foreground">{t('quest.form.introHint')}</p>
      </div>
      <div className="flex flex-col gap-2">
        <Label>{t('quest.form.lang')}</Label>
        <Select value={form.lang} onValueChange={value => form.setLang(value as MinecraftQuestLang)}>
          <SelectTrigger aria-label={t('quest.form.lang')}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {LANGS.map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-caption text-muted-foreground">{t('quest.form.langHint')}</p>
      </div>
      <QuestStepsEditor steps={form.steps} onChange={form.setSteps} />
      <QuestRewardFields items={items} reward={form.reward} onChange={form.setReward} />
    </AppDialog>
  );
};
