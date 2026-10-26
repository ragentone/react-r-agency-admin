import { Avatar, AvatarFallback, AvatarImage } from '@ui/shad-cn/components/avatar.tsx';
import { UserRound, X } from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next';

import type { INotifyItem } from '../types';
import { notifyText } from '../utils';
import { NotifyTypeIcon } from './NotifyTypeIcon';

export interface INotifyToastProps {
  item: INotifyItem;
  /** Opens the notification center (stored notifications only). */
  onOpen?: () => void;
  onClose: () => void;
}

/** Live popup of an incoming notification (sonner `toast.custom`, unstyled). */
export const NotifyToast: React.FC<INotifyToastProps> = ({ item, onOpen, onClose }) => {
  const { t } = useTranslation('notify');
  const title = notifyText(t, item.title, item);
  const message = notifyText(t, item.message, item);
  const heading = title || message;
  const body = title ? message : '';

  const content = (
    <>
      <span className="relative shrink-0">
        {item.from ? (
          <>
            <Avatar className="size-10 ring-1 ring-border/50">
              {item.from.avatarUrl && (
                <AvatarImage src={item.from.avatarUrl} alt="" className="object-cover" />
              )}
              <AvatarFallback className="bg-muted text-muted-foreground">
                <UserRound className="size-5" />
              </AvatarFallback>
            </Avatar>
            <NotifyTypeIcon type={item.type} badge className="absolute -right-1 -bottom-1" />
          </>
        ) : (
          <NotifyTypeIcon type={item.type} />
        )}
      </span>
      <span className="min-w-0 flex-1">
        <span className="line-clamp-2 block text-body leading-5 font-bold text-foreground">
          {heading}
        </span>
        {body && (
          <span className="mt-0.5 line-clamp-2 block text-caption text-muted-foreground">
            {body}
          </span>
        )}
        {onOpen && item.actions.length > 0 && (
          <span className="mt-1 block text-caption font-semibold text-foreground underline-offset-2">
            {t('toast.openActions')}
          </span>
        )}
      </span>
    </>
  );

  return (
    <div
      role="status"
      className="flex w-full max-w-full sm:max-w-sm items-start gap-1 rounded-none sm:rounded-2xl border-y sm:border border-border/60 bg-background p-1 shadow-lg"
    >
      {onOpen ? (
        <button
          type="button"
          onClick={onOpen}
          className="flex min-w-0 flex-1 items-start gap-3 rounded-xl p-2 text-left outline-none transition-colors hover:bg-foreground/[0.03] focus-visible:ring-2 focus-visible:ring-ring"
        >
          {content}
        </button>
      ) : (
        <div className="flex min-w-0 flex-1 items-start gap-3 p-2">{content}</div>
      )}
      <button
        type="button"
        onClick={onClose}
        aria-label={t('actions.close')}
        className="grid size-9 shrink-0 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-foreground/[0.06] hover:text-foreground"
      >
        <X className="size-4" />
      </button>
    </div>
  );
};
