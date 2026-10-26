import { cn } from '@ui/lib/utils.ts';
import { MessageCircle } from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { MESSENGER_LAYER_DELAY_MS } from '../const.ts';
import { isMessengerActive } from '../feature.ts';
import { openMessenger } from '../store.ts';
import type { IMessengerUser } from '../types.ts';

/** Opens the chat with a user (profile header, …). */
export const MessengerButton: React.FC<{
  user: IMessengerUser;
  /** Close the surrounding drawer first (e.g. profile) – the messenger opens after it. */
  onBeforeOpen?: () => void;
  className?: string;
}> = ({ user, onBeforeOpen, className }) => {
  const { t } = useTranslation('messenger');
  // Messenger module disabled → no button anywhere.
  if (!isMessengerActive()) return null;
  return (
    <button
      type="button"
      onClick={() => {
        if (!onBeforeOpen) return openMessenger(user);
        onBeforeOpen();
        window.setTimeout(() => openMessenger(user), MESSENGER_LAYER_DELAY_MS);
      }}
      aria-label={t('open')}
      title={t('open')}
      className={cn(
        'grid size-9 shrink-0 place-items-center rounded-full text-foreground outline-none transition-colors hover:bg-foreground/10 focus-visible:ring-2 focus-visible:ring-ring',
        className
      )}
    >
      <MessageCircle className="size-5" />
    </button>
  );
};
