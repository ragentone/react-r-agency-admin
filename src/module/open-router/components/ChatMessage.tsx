import { cn } from '@ui/lib/utils';
import { Avatar, AvatarFallback } from '@ui/shad-cn/components/avatar';
import { AlertCircle, Bot, Loader2, User } from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { ChatMessageFormatted } from './ChatMessageFormatted';

export interface ChatMessageItem {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  sessionId?: string;
  isStreaming?: boolean;
  error?: string;
}

export interface ChatMessageProps {
  message: ChatMessageItem;
  onAnswerQuestionnaire?: (answerText: string) => void;
  isCurrentSessionLoading?: boolean;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({
  message,
  onAnswerQuestionnaire,
  isCurrentSessionLoading,
}) => {
  const { t } = useTranslation('open-router');
  const isUser = message.role === 'user';
  const isStreaming = message.isStreaming;

  return (
    <div className={cn('flex gap-3 group', isUser ? 'flex-row-reverse' : 'flex-row')}>
      {/* Avatar */}
      <Avatar
        className={cn(
          'h-8 w-8 rounded-xl border flex-shrink-0 flex items-center justify-center shadow-xs',
          isUser
            ? 'bg-primary text-primary-foreground border-primary/30'
            : 'bg-muted/80 text-foreground border-border/80'
        )}
      >
        <AvatarFallback className="bg-transparent text-xs font-semibold">
          {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
        </AvatarFallback>
      </Avatar>

      {/* Message Bubble */}
      <div
        className={cn(
          'flex flex-col space-y-1 max-w-[85%] sm:max-w-[75%]',
          isUser ? 'items-end' : 'items-start'
        )}
      >
        <div className="flex items-center gap-2 px-1 text-[11px] text-muted-foreground">
          <span className="font-medium text-foreground/70">
            {isUser ? t('user', { defaultValue: 'Du' }) : t('assistant', { defaultValue: 'Assistant' })}
          </span>
          <span>•</span>
          <span>
            {message.timestamp.toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
          {isStreaming && (
            <span className="flex items-center gap-1 text-primary text-[10px] animate-pulse">
              <Loader2 className="h-3 w-3 animate-spin" />
              {t('generating', { defaultValue: 'generiert...' })}
            </span>
          )}
        </div>

        <div
          className={cn(
            'px-4 py-3 rounded-2xl text-sm leading-relaxed break-words shadow-sm transition-all overflow-hidden',
            isUser
              ? 'bg-primary text-primary-foreground rounded-tr-xs selection:bg-primary-foreground selection:text-primary whitespace-pre-wrap'
              : message.error
                ? 'bg-destructive/10 border border-destructive/30 text-destructive rounded-tl-xs w-full'
                : 'bg-card border border-border/70 text-card-foreground rounded-tl-xs w-full'
          )}
        >
          {message.content ? (
            <>
              <ChatMessageFormatted
                content={message.content}
                isUser={isUser}
                onAnswerQuestionnaire={onAnswerQuestionnaire}
                disabledQuestionnaire={isStreaming || isCurrentSessionLoading}
              />
              {message.error && (
                <div className="mt-2.5 pt-2 border-t border-destructive/20 flex items-start gap-1.5 text-xs text-destructive">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>{message.error}</span>
                </div>
              )}
            </>
          ) : message.error ? (
            <div className="flex items-start gap-2 text-xs sm:text-sm text-destructive">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="font-semibold block">{t('requestFailed', { defaultValue: 'Anfrage fehlgeschlagen' })}</span>
                <span className="text-xs opacity-90 break-words">{message.error}</span>
              </div>
            </div>
          ) : isStreaming ? (
            <span className="inline-flex items-center gap-1.5 text-muted-foreground italic">
              <span className="h-1.5 w-1.5 rounded-full bg-current animate-bounce" />
              <span className="h-1.5 w-1.5 rounded-full bg-current animate-bounce [animation-delay:0.2s]" />
              <span className="h-1.5 w-1.5 rounded-full bg-current animate-bounce [animation-delay:0.4s]" />
            </span>
          ) : (
            <span className="text-muted-foreground italic text-xs">
              {t('noResponse', { defaultValue: 'Keine Antwort' })}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
