import { cn } from '@ui/lib/utils';
import React, { useMemo } from 'react';

import { sanitizeTicketHtml } from '../utils';

export interface ITicketHtmlProps {
  html: string | null | undefined;
  className?: string;
}

/** Sanitized ticket description (bold, italic, lists …) – nothing executable gets through. */
export const TicketHtml: React.FC<ITicketHtmlProps> = ({ html, className }) => {
  const safe = useMemo(() => sanitizeTicketHtml(html), [html]);
  if (!safe) return null;
  return (
    <div
      data-slot="ticket-html"
      className={cn(
        'break-words [&>*+*]:mt-1.5 [&_ol]:list-decimal [&_ol]:pl-5 [&_ul]:list-disc [&_ul]:pl-5 [&_strong]:font-bold [&_b]:font-bold [&_em]:italic [&_i]:italic [&_u]:underline [&_s]:line-through',
        className
      )}
      dangerouslySetInnerHTML={{ __html: safe }}
    />
  );
};
