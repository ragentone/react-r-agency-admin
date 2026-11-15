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
import { Plus, Trash2 } from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { QUEST_SIGNALS } from '../quest-signals';
import { type IMinecraftQuestStep, QUEST_MAX_STEPS } from '../types.quest';

const NONE = 'none';

/** Schritte einer Aufgabe: Signal per Auswahl, Text kommt daraus. Nur bei „nur per Admin“ tippen. */
export const QuestStepsEditor: React.FC<{
  steps: IMinecraftQuestStep[];
  onChange: (steps: IMinecraftQuestStep[]) => void;
}> = ({ steps, onChange }) => {
  const { t } = useTranslation('minecraft');
  const patch = (index: number, change: Partial<IMinecraftQuestStep>) =>
    onChange(steps.map((step, i) => (i === index ? { ...step, ...change } : step)));

  const pick = (index: number, value: string) =>
    patch(
      index,
      value === NONE ? { signal: '' } : { signal: value, text: t(`quest.signal.${value}`) }
    );

  return (
    <div className="flex flex-col gap-3">
      {steps.map((step, index) => (
        <div key={index} className="flex flex-col gap-2 rounded-xl border border-border/50 p-3">
          <div className="flex items-center justify-between gap-2">
            <Label>{t('quest.form.step', { number: index + 1 })}</Label>
            <Button
              variant="ghost"
              size="icon-md"
              disabled={steps.length === 1}
              aria-label={t('quest.form.stepRemove', { number: index + 1 })}
              onClick={() => onChange(steps.filter((_, i) => i !== index))}
            >
              <Trash2 />
            </Button>
          </div>
          <Select value={step.signal || NONE} onValueChange={value => pick(index, value)}>
            <SelectTrigger aria-label={t('quest.form.signal', { number: index + 1 })}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent className={'max-h-80'}>
              {QUEST_SIGNALS.map(signal => (
                <SelectItem key={signal} value={signal}>
                  {t(`quest.signal.${signal}`)}
                </SelectItem>
              ))}
              <SelectItem value={NONE}>{t('quest.signal.none')}</SelectItem>
            </SelectContent>
          </Select>
          {!step.signal && (
            <Input
              value={step.text}
              maxLength={80}
              aria-label={t('quest.form.step', { number: index + 1 })}
              placeholder={t('quest.form.stepPlaceholder')}
              onChange={event => patch(index, { text: event.target.value })}
            />
          )}
        </div>
      ))}
      <p className="text-caption text-muted-foreground">{t('quest.form.signalHint')}</p>
      <Button
        variant="outline"
        disabled={steps.length >= QUEST_MAX_STEPS}
        onClick={() => onChange([...steps, { text: '', signal: '' }])}
      >
        <Plus />
        {t('quest.form.stepAdd')}
      </Button>
    </div>
  );
};
