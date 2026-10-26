import type { ChatQuestionnaireData, ChatQuestionnaireItem } from './questionnaire.types';

export interface CodePart {
  type: 'code';
  language: string;
  code: string;
}

export interface QuestionnairePart {
  type: 'questionnaire';
  data: ChatQuestionnaireData;
  rawText: string;
}

export interface TextPart {
  type: 'text';
  text: string;
}

export type MessagePart = CodePart | QuestionnairePart | TextPart;

// Try to parse a string as a questionnaire JSON or structure
export function parseQuestionnaireJson(content: string): ChatQuestionnaireData | null {
  try {
    const parsed = JSON.parse(content.trim());
    if (parsed && typeof parsed === 'object') {
      // Direct questionnaire structure: { items: [...] } or { questions: [...] }
      const rawItems = parsed.items || parsed.questions;
      if (Array.isArray(rawItems) && rawItems.length > 0) {
        const items: ChatQuestionnaireItem[] = rawItems.map((item, idx) => {
          const id = item.id || `q-${idx + 1}`;
          const title = item.title || item.question || item.text || `Frage ${idx + 1}`;
          const description = item.description || item.subtext;
          const choices = Array.isArray(item.choices || item.options)
            ? (item.choices || item.options).map((choice: any, cIdx: number) => {
                if (typeof choice === 'string') {
                  return {
                    value: choice,
                    label: choice,
                  };
                }
                return {
                  value: choice.value || choice.id || String(choice.label || `opt-${cIdx + 1}`),
                  label: choice.label || choice.text || choice.value || '',
                  description: choice.description,
                  shortcut: choice.shortcut,
                };
              })
            : undefined;

          const type = item.type === 'checkbox' || item.type === 'multiple'
            ? 'checkbox'
            : item.type === 'text' || (!choices && item.type !== 'radio')
              ? 'text'
              : 'radio';

          return {
            id,
            title,
            description,
            type,
            placeholder: item.placeholder,
            choices,
            required: item.required ?? true,
          };
        });

        return {
          title: parsed.title,
          description: parsed.description,
          submitLabel: parsed.submitLabel,
          items,
        };
      }
    }
  } catch {
    // Not valid JSON
  }
  return null;
}

export function parseMessageContent(content: string): MessagePart[] {
  if (!content) return [];

  const parts: MessagePart[] = [];
  // Regex to match code blocks, including unclosed code blocks during streaming
  const regex = /```([a-zA-Z0-9_-]*)\n?([\s\S]*?)(?:```|$)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(content)) !== null) {
    if (match.index > lastIndex) {
      parts.push({
        type: 'text',
        text: content.slice(lastIndex, match.index),
      });
    }

    if (match[0].startsWith('```')) {
      const language = (match[1]?.trim() || 'text').toLowerCase();
      const code = (match[2] || '').replace(/\n$/, '');

      if (language === 'questionnaire' || language === 'questions' || language === 'quiz') {
        const questionnaireData = parseQuestionnaireJson(code);
        if (questionnaireData) {
          parts.push({
            type: 'questionnaire',
            data: questionnaireData,
            rawText: code,
          });
        } else {
          parts.push({
            type: 'code',
            language,
            code,
          });
        }
      } else if (language === 'json') {
        const questionnaireData = parseQuestionnaireJson(code);
        if (questionnaireData && (questionnaireData.items.length > 0)) {
          parts.push({
            type: 'questionnaire',
            data: questionnaireData,
            rawText: code,
          });
        } else {
          parts.push({
            type: 'code',
            language,
            code,
          });
        }
      } else {
        parts.push({
          type: 'code',
          language,
          code,
        });
      }
    }

    lastIndex = regex.lastIndex;
    if (lastIndex === content.length || match[0].length === 0) break;
  }

  if (lastIndex < content.length) {
    parts.push({
      type: 'text',
      text: content.slice(lastIndex),
    });
  }

  return parts;
}
