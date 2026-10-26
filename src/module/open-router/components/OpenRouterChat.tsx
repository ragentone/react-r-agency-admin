import type { IOpenRouterMessage } from '@module/open-router/types.ts';
import { cn } from '@ui/lib/utils';
import { Button } from '@ui/shad-cn/components/button';
import { ArrowDown } from 'lucide-react';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useOpenRouter } from '../hooks';
import { ChatEmptyState } from './ChatEmptyState';
import { ChatHeader } from './ChatHeader';
import { ChatInputArea } from './ChatInputArea';
import { ChatMessage, type ChatMessageItem } from './ChatMessage';

export interface OpenRouterChatProps {
  className?: string;
  title?: string;
  initialPrompt?: string;
  systemPrompt?: string;
  placeholder?: string;
}

export const OpenRouterChat: React.FC<OpenRouterChatProps> = ({
  className,
  title,
  systemPrompt,
  placeholder,
}) => {
  const { t } = useTranslation('open-router');
  const chatTitle = title ?? t('title', { defaultValue: 'KI-Assistent' });
  const defaultSystemPrompt =
    systemPrompt ??
    t('systemPrompt', { defaultValue: 'Du bist ein hilfsbereiter und präziser KI-Assistent.' });

  const { request, loading, sessions } = useOpenRouter();
  const [history, setHistory] = useState<ChatMessageItem[]>([]);
  const [input, setInput] = useState('');
  const [isAtBottom, setIsAtBottom] = useState(true);

  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isAtBottomRef = useRef(true);

  // Combine completed history and active streaming sessions into display messages
  const displayMessages = useMemo(() => {
    return history.map(item => {
      if (item.sessionId && sessions[item.sessionId]) {
        const session = sessions[item.sessionId];
        const streamingContent = session.deltas.map(d => d.content || '').join('');
        return {
          ...item,
          content: streamingContent || item.content,
          isStreaming: !session.end,
          error: session.error,
        };
      }
      return {
        ...item,
        isStreaming: false,
      };
    });
  }, [history, sessions]);

  const scrollToBottom = useCallback((behavior: ScrollBehavior = 'auto') => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({
      top: el.scrollHeight,
      behavior,
    });
    setIsAtBottom(true);
    isAtBottomRef.current = true;
  }, []);

  // Monitor scroll position to detect if user has scrolled away from bottom
  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;

    const threshold = 60; // px
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    const atBottom = distanceFromBottom <= threshold;

    setIsAtBottom(atBottom);
    isAtBottomRef.current = atBottom;
  }, []);

  // When displayMessages updates (e.g. new tokens streamed):
  // Only scroll down automatically if the user was already at the bottom.
  useEffect(() => {
    if (isAtBottomRef.current && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [displayMessages]);

  const sendMessage = useCallback(
    (textToSend: string) => {
      const trimmed = textToSend.trim();
      if (!trimmed || loading) return;

      const userMessage: ChatMessageItem = {
        id: 'user-' + Date.now(),
        role: 'user',
        content: trimmed,
        timestamp: new Date(),
      };

      // Prepare message history for OpenRouter, resolving any streaming content from current sessions
      const snapshotHistory = history.map(item => {
        if (item.sessionId && sessions[item.sessionId]) {
          const session = sessions[item.sessionId];
          const streamingContent = session.deltas.map(d => d.content || '').join('');
          if (streamingContent) {
            return {
              ...item,
              content: streamingContent,
            };
          }
        }
        return item;
      });

      const nextHistory = [...snapshotHistory, userMessage];
      setHistory(nextHistory);
      setInput('');

      // Force scroll to bottom when user sends a message
      setTimeout(() => {
        scrollToBottom('smooth');
      }, 10);

      const apiMessages: IOpenRouterMessage[] = [];
      if (defaultSystemPrompt) {
        apiMessages.push({ role: 'system', content: defaultSystemPrompt });
      }

      nextHistory.forEach(msg => {
        if (msg.content) {
          apiMessages.push({
            role: msg.role,
            content: msg.content,
          });
        }
      });

      request({
        messages: apiMessages,
        onResponse: res => {
          if (res.id) {
            const assistantMessage: ChatMessageItem = {
              id: res.id,
              role: 'assistant',
              content: '',
              timestamp: new Date(),
              sessionId: res.id,
            };
            setHistory(prev => [...prev, assistantMessage]);
          }
        },
      });
    },
    [defaultSystemPrompt, history, loading, request, scrollToBottom, sessions]
  );

  const handleSend = () => {
    sendMessage(input);
  };

  const handleAnswerQuestionnaire = (answerText: string) => {
    sendMessage(answerText);
  };

  const handleClear = () => {
    setHistory([]);
  };

  const handleSelectSuggestion = (text: string) => {
    setInput(text);
    textareaRef.current?.focus();
  };

  return (
    <div
      className={cn(
        'flex flex-col h-[650px] w-full max-w-4xl mx-auto rounded-2xl border border-border/80 bg-background/95 shadow-xl backdrop-blur-md overflow-hidden transition-all duration-200 relative',
        className
      )}
    >
      <ChatHeader
        title={chatTitle}
        hasMessages={displayMessages.length > 0}
        onClear={handleClear}
      />

      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 scrollbar-thin scrollbar-thumb-muted-foreground/20 hover:scrollbar-thumb-muted-foreground/30 overscroll-contain"
      >
        {displayMessages.length === 0 ? (
          <ChatEmptyState onSelectSuggestion={handleSelectSuggestion} />
        ) : (
          displayMessages.map(message => (
            <ChatMessage
              key={message.id}
              message={message}
              onAnswerQuestionnaire={handleAnswerQuestionnaire}
              isCurrentSessionLoading={loading}
            />
          ))
        )}
      </div>

      {/* Floating scroll to bottom button when scrolled up */}
      {!isAtBottom && displayMessages.length > 0 && (
        <div className="absolute bottom-24 right-6 z-10 transition-all duration-200 animate-in fade-in slide-in-from-bottom-2">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => scrollToBottom('smooth')}
            className="rounded-full shadow-lg border border-border bg-background/90 hover:bg-background backdrop-blur-sm gap-1.5 text-xs h-8 px-3"
          >
            <ArrowDown className="h-3.5 w-3.5" />
            <span>{t('scrollToBottom', { defaultValue: 'Nach unten' })}</span>
          </Button>
        </div>
      )}

      <ChatInputArea
        ref={textareaRef}
        input={input}
        onInputChange={setInput}
        onSend={handleSend}
        loading={loading}
        placeholder={placeholder}
      />
    </div>
  );
};
