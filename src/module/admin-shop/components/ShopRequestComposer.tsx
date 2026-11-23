import { Button } from '@ui/shad-cn/components/button.tsx';
import { Textarea } from '@ui/shad-cn/components/textarea.tsx';
import { Send } from 'lucide-react';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { SHOP_REPLY_MESSAGE_MAX } from '../types/request';

export interface IShopRequestComposerProps {
  /** Sends the text; returns `false` on error (the text stays). */
  onSend: (message: string) => Promise<boolean>;
  sending: boolean;
}

/** Reply field for the footer of a drawer: text field and send button. */
export const ShopRequestComposer: React.FC<IShopRequestComposerProps> = ({ onSend, sending }) => {
  const { t } = useTranslation('admin-shop');
  const [text, setText] = useState('');

  const submit = async () => {
    const message = text.trim();
    if (!message) return;
    if (await onSend(message)) setText('');
    else toast.error(t('crm.thread.error'));
  };

  return (
    <form
      className="flex items-end gap-2"
      onSubmit={event => {
        event.preventDefault();
        void submit();
      }}
    >
      <Textarea
        value={text}
        onChange={event => setText(event.target.value)}
        maxLength={SHOP_REPLY_MESSAGE_MAX}
        rows={1}
        placeholder={t('crm.thread.placeholder')}
        aria-label={t('crm.thread.placeholder')}
        className="max-h-32 min-h-11 flex-1 resize-none border-border/50"
      />
      <Button
        type="submit"
        size="icon-lg"
        disabled={sending || text.trim() === ''}
        aria-label={t('crm.thread.send')}
        title={t('crm.thread.send')}
      >
        <Send className="size-5" aria-hidden="true" />
      </Button>
    </form>
  );
};
