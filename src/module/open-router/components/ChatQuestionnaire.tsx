import { Button } from '@ui/shad-cn/components/button';
import {
  Questionnaire,
  QuestionnaireActions,
  QuestionnaireChoice,
  QuestionnaireChoiceDescription,
  QuestionnaireChoices,
  QuestionnaireDescription,
  QuestionnaireInput,
  QuestionnaireItem,
  QuestionnaireNext,
  QuestionnairePrevious,
  QuestionnaireProgress,
  QuestionnaireTitle,
} from '@ui/shad-cn/components/questionnaire';
import { CheckCircle2, Send } from 'lucide-react';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import type { ChatQuestionnaireData } from './questionnaire.types';

export interface ChatQuestionnaireProps {
  data: ChatQuestionnaireData;
  onSubmitAnswers?: (formattedAnswer: string) => void;
  disabled?: boolean;
}

export const ChatQuestionnaire: React.FC<ChatQuestionnaireProps> = ({
  data,
  onSubmitAnswers,
  disabled = false,
}) => {
  const { t } = useTranslation('open-router');
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [submitted, setSubmitted] = useState(false);
  const [submittedSummary, setSubmittedSummary] = useState<string>('');

  const handleRadioChange = (itemId: string, value: string) => {
    setAnswers(prev => ({
      ...prev,
      [itemId]: value,
    }));
  };

  const handleCheckboxChange = (itemId: string, value: string, checked: boolean) => {
    setAnswers(prev => {
      const current = Array.isArray(prev[itemId]) ? (prev[itemId] as string[]) : [];
      let updated: string[];
      if (checked) {
        updated = [...current, value];
      } else {
        updated = current.filter(v => v !== value);
      }
      return {
        ...prev,
        [itemId]: updated,
      };
    });
  };

  const handleTextChange = (itemId: string, value: string) => {
    setAnswers(prev => ({
      ...prev,
      [itemId]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (submitted || disabled) return;

    // Collect answers from state and fallback to FormData if necessary
    const form = e.currentTarget as HTMLFormElement;
    const formData = new FormData(form);
    const combinedAnswers: Record<string, string | string[]> = { ...answers };

    for (const [key, val] of formData.entries()) {
      const strVal = String(val).trim();
      if (!strVal) continue;
      const existing = combinedAnswers[key];
      if (existing !== undefined) {
        if (Array.isArray(existing)) {
          if (!existing.includes(strVal)) {
            combinedAnswers[key] = [...existing, strVal];
          }
        }
      } else {
        combinedAnswers[key] = strVal;
      }
    }

    // Build human-friendly response string for the chat
    const summaryLines: string[] = [];

    data.items.forEach(item => {
      const ans = combinedAnswers[item.id] ?? answers[item.id];
      if (!ans) return;

      let labelText = '';
      if (Array.isArray(ans)) {
        if (ans.length === 0) return;
        const labels = ans.map(val => {
          const match = item.choices?.find(c => c.value === val);
          return match?.label || val;
        });
        labelText = labels.join(', ');
      } else {
        const match = item.choices?.find(c => c.value === ans);
        labelText = match?.label || ans;
      }

      if (labelText) {
        summaryLines.push(`${item.title}: ${labelText}`);
      }
    });

    const formattedMessage =
      summaryLines.length > 0
        ? summaryLines.join('\n')
        : Object.entries(combinedAnswers)
            .filter(([, v]) => (Array.isArray(v) ? v.length > 0 : Boolean(v)))
            .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`)
            .join('\n');

    if (!formattedMessage) {
      return;
    }

    setSubmitted(true);
    setSubmittedSummary(formattedMessage);

    if (onSubmitAnswers) {
      onSubmitAnswers(formattedMessage);
    }
  };

  if (submitted) {
    return (
      <div className="my-2 rounded-xl border border-primary/30 bg-primary/5 p-4 text-sm text-foreground">
        <div className="flex items-center gap-2 font-medium text-primary mb-2">
          <CheckCircle2 className="h-4 w-4" />
          <span>{t('answersSubmitted', { defaultValue: 'Antworten übermittelt' })}</span>
        </div>
        <div className="whitespace-pre-wrap text-xs text-muted-foreground bg-background/50 rounded-lg p-2.5 border border-border/50">
          {submittedSummary}
        </div>
      </div>
    );
  }

  // Multi-step questionnaire or single question
  const isMultiStep = data.items.length > 1;

  return (
    <div className="my-3 w-full rounded-xl border border-border/80 bg-background/80 backdrop-blur-xs p-4 shadow-xs">
      {data.title && (
        <div className="mb-3">
          <h4 className="text-sm font-semibold text-foreground">{data.title}</h4>
          {data.description && (
            <p className="text-xs text-muted-foreground mt-0.5">{data.description}</p>
          )}
        </div>
      )}

      <Questionnaire onSubmit={handleSubmit} className="gap-5">
        {isMultiStep && <QuestionnaireProgress className="self-end text-xs" />}

        {data.items.map(item => {
          const itemAnswer = answers[item.id];

          return (
            <QuestionnaireItem
              key={item.id}
              name={item.id}
              multiple={item.type === 'checkbox'}
              className="gap-3"
            >
              <QuestionnaireTitle className="text-sm font-medium text-foreground">
                {item.title}
              </QuestionnaireTitle>

              {item.description && (
                <QuestionnaireDescription className="text-xs text-muted-foreground">
                  {item.description}
                </QuestionnaireDescription>
              )}

              {item.type === 'text' ? (
                <QuestionnaireInput
                  placeholder={
                    item.placeholder || t('yourAnswer', { defaultValue: 'Deine Antwort...' })
                  }
                  value={(itemAnswer as string) || ''}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    handleTextChange(item.id, e.target.value)
                  }
                  disabled={disabled}
                  className="text-sm"
                />
              ) : (
                <QuestionnaireChoices className="gap-2">
                  {item.choices?.map(choice => {
                    const isChecked =
                      item.type === 'checkbox'
                        ? Array.isArray(itemAnswer) && itemAnswer.includes(choice.value)
                        : itemAnswer === choice.value;

                    return (
                      <QuestionnaireChoice
                        key={choice.value}
                        value={choice.value}
                        checked={isChecked}
                        onChange={e => {
                          if (item.type === 'checkbox') {
                            handleCheckboxChange(item.id, choice.value, e.target.checked);
                          } else {
                            handleRadioChange(item.id, choice.value);
                          }
                        }}
                        data-type={item.type === 'checkbox' ? 'checkbox' : 'radio'}
                        data-checked={isChecked ? true : undefined}
                        data-shortcut={choice.shortcut ? true : undefined}
                        disabled={disabled}
                        className="py-2 px-3 text-xs sm:text-sm"
                      >
                        <span className="font-medium text-foreground">{choice.label}</span>
                        {choice.description && (
                          <QuestionnaireChoiceDescription className="text-[11px] text-muted-foreground">
                            {choice.description}
                          </QuestionnaireChoiceDescription>
                        )}
                      </QuestionnaireChoice>
                    );
                  })}
                </QuestionnaireChoices>
              )}
            </QuestionnaireItem>
          );
        })}

        <QuestionnaireActions className="mt-2">
          {isMultiStep && <QuestionnairePrevious size="sm" />}
          {isMultiStep && <QuestionnaireNext size="sm" />}
          <Button
            type="submit"
            size="sm"
            disabled={disabled}
            className="flex items-center gap-1.5 ml-auto"
          >
            <Send className="h-3.5 w-3.5" />
            <span>{data.submitLabel || t('submit', { defaultValue: 'Absenden' })}</span>
          </Button>
        </QuestionnaireActions>
      </Questionnaire>
    </div>
  );
};
