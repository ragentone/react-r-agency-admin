import { cn } from '@ui/lib/utils';
import React from 'react';

import type { IShopRequest, IShopRequestReply, ShopRequestViewer } from '../types/request';
import { formatRequestDate } from '../utils/request-view';

export interface IShopRequestThreadProps {
  request: IShopRequest;
  /** Which side reads: own messages are black and on the right. */
  viewer: ShopRequestViewer;
  language: string;
  replies: IShopRequestReply[];
}

const Bubble: React.FC<{ own: boolean; text: string; date: string }> = ({ own, text, date }) => (
  <div className={cn('flex max-w-[90%] flex-col gap-1', own ? 'ml-auto items-end' : 'items-start')}>
    <p
      className={cn(
        'rounded-2xl p-3 text-body break-words whitespace-pre-line',
        own ? 'rounded-br-sm bg-foreground text-background' : 'rounded-tl-sm bg-muted'
      )}
    >
      {text}
    </p>
    <p className="px-1 text-caption text-muted-foreground">{date}</p>
  </div>
);

/** Conversation of a request: first message and replies (the reply field sits in the drawer footer). */
export const ShopRequestThread: React.FC<IShopRequestThreadProps> = ({
  request,
  replies,
  viewer,
  language,
}) => (
  <div className="space-y-3">
    <Bubble
      own={viewer === 'requester'}
      text={request.message}
      date={formatRequestDate(request.createdAt, language)}
    />
    {replies.map(reply => (
      <Bubble
        key={reply.id}
        own={reply.fromRequester === (viewer === 'requester')}
        text={reply.message}
        date={formatRequestDate(reply.createdAt, language)}
      />
    ))}
  </div>
);
