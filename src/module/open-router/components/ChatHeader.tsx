import { Badge } from '@ui/shad-cn/components/badge';
import { Button } from '@ui/shad-cn/components/button';
import { Sparkles, Trash2 } from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next';

export interface ChatHeaderProps {
  title: string;
  hasMessages: boolean;
  onClear: () => void;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({ title, hasMessages, onClear }) => {
  const { t } = useTranslation('open-router');

  return (
    <div className="flex items-center justify-between px-5 py-3.5 border-b border-border/60 bg-muted/40">
      <div className="flex items-center gap-2.5">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/20">
          <Sparkles className="h-5 w-5" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold tracking-tight text-foreground">{title}</h2>
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0 font-normal">
              openrouter/free
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            {t('subtitle', { defaultValue: 'Echtzeit-Streaming Chatbot' })}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-1.5">
        {hasMessages && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClear}
            className="h-8 px-2.5 text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
            title={t('clearTitle', { defaultValue: 'Chat leeren' })}
          >
            <Trash2 className="h-3.5 w-3.5 mr-1.5" />
            {t('clear', { defaultValue: 'Leeren' })}
          </Button>
        )}
      </div>
    </div>
  );
};
