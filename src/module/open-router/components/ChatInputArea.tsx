import { Button } from '@ui/shad-cn/components/button';
import { Textarea } from '@ui/shad-cn/components/textarea';
import { Loader2, Send } from 'lucide-react';
import React, { forwardRef } from 'react';
import { useTranslation } from 'react-i18next';

export interface ChatInputAreaProps {
  input: string;
  onInputChange: (val: string) => void;
  onSend: () => void;
  loading: boolean;
  placeholder?: string;
}

export const ChatInputArea = forwardRef<HTMLTextAreaElement, ChatInputAreaProps>(
  ({ input, onInputChange, onSend, loading, placeholder }, ref) => {
    const { t } = useTranslation('open-router');
    const inputPlaceholder =
      placeholder ?? t('placeholder', { defaultValue: 'Frage etwas oder schreibe eine Nachricht...' });

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        onSend();
      }
    };

    return (
      <div className="p-3 sm:p-4 border-t border-border/60 bg-muted/20">
        <div className="relative flex flex-col rounded-xl border border-border/80 bg-background shadow-xs focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary/80 transition-all">
          <Textarea
            ref={ref}
            value={input}
            onChange={e => onInputChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={inputPlaceholder}
            rows={1}
            className="w-full resize-none min-h-[48px] max-h-36 p-3 text-sm bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground/70"
          />

          <div className="flex items-center justify-between px-3 py-2 border-t border-border/40 bg-muted/10">
            <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
              <span className="hidden sm:inline">
                <kbd className="px-1.5 py-0.5 text-[10px] font-mono rounded bg-muted border border-border">
                  Enter
                </kbd>{' '}
                {t('enterToSend', { defaultValue: 'senden' })}
              </span>
              <span className="hidden sm:inline">•</span>
              <span className="hidden sm:inline">
                <kbd className="px-1.5 py-0.5 text-[10px] font-mono rounded bg-muted border border-border">
                  Shift+Enter
                </kbd>{' '}
                {t('shiftEnterForNewLine', { defaultValue: 'Zeilenumbruch' })}
              </span>
            </div>

            <Button
              size="sm"
              onClick={onSend}
              disabled={!input.trim() || loading}
              className="h-8 px-3 rounded-lg gap-1.5 shadow-sm text-xs font-medium cursor-pointer disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>{t('sending', { defaultValue: 'Sendet...' })}</span>
                </>
              ) : (
                <>
                  <span>{t('send', { defaultValue: 'Senden' })}</span>
                  <Send className="h-3.5 w-3.5" />
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    );
  }
);

ChatInputArea.displayName = 'ChatInputArea';
