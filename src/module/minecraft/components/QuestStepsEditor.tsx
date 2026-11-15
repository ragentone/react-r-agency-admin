import { Button } from '@ui/shad-cn/components/button.tsx';
import { Input } from '@ui/shad-cn/components/input.tsx';
import { Label } from '@ui/shad-cn/components/label.tsx';
import { Plus, Trash2 } from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { type IMinecraftQuestStep, QUEST_MAX_STEPS } from '../types.quest';

/** Schritte einer Aufgabe: Text für den Spieler und optionales Signal des Behavior Packs. */
export const QuestStepsEditor: React.FC<{
  steps: IMinecraftQuestStep[];
  onChange: (steps: IMinecraftQuestStep[]) => void;
}> = ({ steps, onChange }) => {
  const { t } = useTranslation('minecraft');
  const patch = (index: number, change: Partial<IMinecraftQuestStep>) =>
    onChange(steps.map((step, i) => (i === index ? { ...step, ...change } : step)));

  return (
    <div className="flex flex-col gap-3">
      {steps.map((step, index) => (
        <div key={index} className="flex flex-col gap-2 rounded-xl border border-border/50 p-3">
          <div className="flex items-center justify-between gap-2">
            <Label htmlFor={`mc-quest-step-${index}`}>
              {t('quest.form.step', { number: index + 1 })}
            </Label>
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
          <Input
            id={`mc-quest-step-${index}`}
            value={step.text}
            maxLength={80}
            placeholder={t('quest.form.stepPlaceholder')}
            onChange={event => patch(index, { text: event.target.value })}
          />
          <Input
            value={step.signal}
            maxLength={32}
            autoCapitalize="none"
            aria-label={t('quest.form.signal', { number: index + 1 })}
            placeholder={t('quest.form.signalPlaceholder')}
            onChange={event =>
              patch(index, { signal: event.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '') })
            }
          />
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
