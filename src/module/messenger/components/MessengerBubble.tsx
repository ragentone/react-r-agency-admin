import { cn } from '@ui/lib/utils.ts';
import React from 'react';

import type { IMessengerLocalMessage } from '../types.ts';
import { isBigEmoji } from '../utils.ts';

const URL_PATTERN = /(https?:\/\/[^\s<>"']+[^\s<>"'.,;:!?)\]])/gi;

/** Plain text with clickable links (no HTML from users). */
const Linkified: React.FC<{ text: string; mine: boolean }> = ({ text, mine }) => {
  const parts = text.split(URL_PATTERN);
  return (
    <>
      {parts.map((part, i) =>
        i % 2 === 1 ? (
          <a
            key={i}
            href={part}
            target="_blank"
            rel="noopener noreferrer nofollow"
            onClick={e => e.stopPropagation()}
            className={cn(
              'underline underline-offset-2 break-all',
              mine ? 'text-background' : 'text-foreground'
            )}
          >
            {part}
          </a>
        ) : (
          <React.Fragment key={i}>{part}</React.Fragment>
        )
      )}
    </>
  );
};

export interface IMessengerBubbleProps {
  message: IMessengerLocalMessage;
  mine: boolean;
  first: boolean;
  last: boolean;
  deletedLabel: string;
}

/**
 * Messenger bubble (monochrome): own = foreground colour right, other = light grey left; inside a group the corners on the
 * sender's side get small (4px), emoji-only messages are shown large without a bubble.
 */
export const MessengerBubble: React.FC<IMessengerBubbleProps> = ({
  message,
  mine,
  first,
  last,
  deletedLabel,
}) => {
  if (message.deleted) {
    return (
      <div className="rounded-[18px] border border-border px-3 py-2 text-[15px] leading-5 text-muted-foreground italic">
        {deletedLabel}
      </div>
    );
  }

  if (isBigEmoji(message.body)) {
    return (
      <div
        className={cn(
          'px-1 text-[40px] leading-12 select-text',
          message.status === 'sending' && 'opacity-60'
        )}
      >
        {message.body}
      </div>
    );
  }

  return (
    <div
      className={cn(
        'rounded-[18px] px-3 py-2 text-[15px] leading-5 whitespace-pre-wrap wrap-break-word select-text',
        mine
          ? cn('bg-foreground text-background', !first && 'rounded-tr-lg', !last && 'rounded-br-lg')
          : cn(
              'bg-foreground/[0.07] text-foreground',
              !first && 'rounded-tl-lg',
              !last && 'rounded-bl-lg'
            ),
        message.status === 'sending' && 'opacity-70',
        message.status === 'failed' && 'opacity-60'
      )}
    >
      <Linkified text={message.body} mine={mine} />
    </div>
  );
};
