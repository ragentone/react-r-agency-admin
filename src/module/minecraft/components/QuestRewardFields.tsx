import { Input } from '@ui/shad-cn/components/input.tsx';
import { Label } from '@ui/shad-cn/components/label.tsx';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@ui/shad-cn/components/select.tsx';
import React from 'react';
import { useTranslation } from 'react-i18next';

import type { IMinecraftQuestItem, IMinecraftQuestReward } from '../types.quest';

const NONE = 'none';

/** Belohnung am Ende der Aufgabe: Item aus der festen Liste und Anzahl (1–64), oder keine. */
export const QuestRewardFields: React.FC<{
  items: IMinecraftQuestItem[];
  reward: IMinecraftQuestReward | null;
  onChange: (reward: IMinecraftQuestReward | null) => void;
}> = ({ items, reward, onChange }) => {
  const { t } = useTranslation('minecraft');
  return (
    <div className="grid grid-cols-[1fr_6rem] gap-3">
      <div className="flex flex-col gap-2">
        <Label>{t('quest.form.reward')}</Label>
        <Select
          value={reward?.item ?? NONE}
          onValueChange={item =>
            onChange(item === NONE ? null : { item, amount: reward?.amount ?? 1 })
          }
        >
          <SelectTrigger aria-label={t('quest.form.reward')}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={NONE}>{t('quest.form.rewardNone')}</SelectItem>
            {items.map(entry => (
              <SelectItem key={entry.item} value={entry.item}>
                {entry.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="mc-quest-amount">{t('quest.form.amount')}</Label>
        <Input
          id="mc-quest-amount"
          type="number"
          inputMode="numeric"
          min={1}
          max={64}
          disabled={!reward}
          value={reward?.amount ?? ''}
          onChange={event => reward && onChange({ ...reward, amount: Number(event.target.value) })}
        />
      </div>
    </div>
  );
};
