import { Bot } from 'lucide-react';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

export interface ChatEmptyStateProps {
  onSelectSuggestion: (text: string) => void;
}

export const ChatEmptyState: React.FC<ChatEmptyStateProps> = ({ onSelectSuggestion }) => {
  const { t } = useTranslation('open-router');

  const suggestions = useMemo(
    () => [
      t('empty.suggestions.reactHooks', {
        defaultValue: 'Erkläre mir React Hooks kurz & knackig',
      }),
      t('empty.suggestions.codingPoem', {
        defaultValue: 'Schreibe ein kurzes Gedicht über Coding',
      }),
      t('empty.suggestions.tailwindBenefits', {
        defaultValue: 'Was sind die Vorteile von Tailwind CSS?',
      }),
      t('empty.suggestions.restApi', {
        defaultValue: 'Hilf mir beim Entwerfen einer REST API',
      }),
    ],
    [t]
  );

  return (
    <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-4 my-auto min-h-[300px]">
      <div className="h-16 w-16 rounded-2xl bg-gradient-to-tr from-primary/20 via-primary/10 to-transparent flex items-center justify-center text-primary shadow-inner">
        <Bot className="h-8 w-8" />
      </div>
      <div className="max-w-sm space-y-1.5">
        <h3 className="text-base font-medium text-foreground">
          {t('empty.title', { defaultValue: 'Wie kann ich dir heute helfen?' })}
        </h3>
        <p className="text-xs text-muted-foreground leading-relaxed">
          {t('empty.description', {
            defaultValue:
              'Stelle Fragen, lasse dir Code erklären oder starte ein beliebiges Gespräch über OpenRouter.',
          })}
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 w-full max-w-md">
        {suggestions.map((promptText, i) => (
          <button
            key={i}
            type="button"
            onClick={() => onSelectSuggestion(promptText)}
            className="p-2.5 text-left text-xs bg-muted/40 hover:bg-muted/80 border border-border/40 hover:border-border rounded-xl transition-all duration-150 text-foreground/80 hover:text-foreground cursor-pointer"
          >
            "{promptText}"
          </button>
        ))}
      </div>
    </div>
  );
};
