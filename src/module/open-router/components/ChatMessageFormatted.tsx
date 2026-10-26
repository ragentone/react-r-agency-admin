import {
  CodeBlock,
  CodeBlockActions,
  CodeBlockContent,
  CodeBlockCopyButton,
  CodeBlockHeader,
  CodeBlockTitle,
} from '@ui/shad-cn/components/code-block';
import { Code2 } from 'lucide-react';
import React, { useMemo } from 'react';

import { ChatQuestionnaire } from './ChatQuestionnaire';
import { MarkdownRenderer } from './MarkdownRenderer';
import { parseMessageContent } from './utils';

export interface ChatMessageFormattedProps {
  content: string;
  isUser: boolean;
  onAnswerQuestionnaire?: (answerText: string) => void;
  disabledQuestionnaire?: boolean;
}

export const ChatMessageFormatted: React.FC<ChatMessageFormattedProps> = ({
  content,
  isUser,
  onAnswerQuestionnaire,
  disabledQuestionnaire = false,
}) => {
  const parts = useMemo(() => parseMessageContent(content), [content]);

  if (isUser) {
    return <span className="whitespace-pre-wrap break-words">{content}</span>;
  }

  return (
    <div className="space-y-3 w-full">
      {parts.map((part, index) => {
        if (part.type === 'text') {
          return <MarkdownRenderer key={index} content={part.text} />;
        }

        if (part.type === 'questionnaire') {
          return (
            <ChatQuestionnaire
              key={index}
              data={part.data}
              onSubmitAnswers={onAnswerQuestionnaire}
              disabled={disabledQuestionnaire}
            />
          );
        }

        return (
          <CodeBlock
            key={index}
            variant="default"
            size="sm"
            className="my-2 border border-border/80 bg-muted/70 text-foreground"
          >
            <CodeBlockHeader className="border-b border-border/50 bg-muted/40 py-2 px-3">
              <CodeBlockTitle className="flex items-center gap-1.5 text-xs font-mono lowercase text-muted-foreground">
                <Code2 className="h-3.5 w-3.5 text-primary" />
                <span>{part.language || 'code'}</span>
              </CodeBlockTitle>
              <CodeBlockActions>
                <CodeBlockCopyButton
                  value={part.code}
                  variant="ghost"
                  size="icon-xs"
                  className="h-7 w-7 text-muted-foreground hover:text-foreground hover:bg-muted/80"
                />
              </CodeBlockActions>
            </CodeBlockHeader>
            <CodeBlockContent
              wrap
              lineNumbers
              className="py-3 px-3.5 text-xs font-mono leading-normal bg-background/50"
            >
              {part.code}
            </CodeBlockContent>
          </CodeBlock>
        );
      })}
    </div>
  );
};
