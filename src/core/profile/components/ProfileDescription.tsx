import { cn } from '@ui/lib/utils';
import DOMPurify from 'dompurify';
import React, { useMemo } from 'react';

export interface IProfileDescriptionProps {
  html: string | null | undefined;
  className?: string;
}

const hasText = (html: string) =>
  html
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .trim();

/** Bio from the account's HTML editor – sanitized, links open in a new tab. */
export const ProfileDescription: React.FC<IProfileDescriptionProps> = ({ html, className }) => {
  const clean = useMemo(() => {
    if (!html) return '';
    const sanitized = DOMPurify.sanitize(html, { USE_PROFILES: { html: true } });
    return hasText(sanitized) ? sanitized : '';
  }, [html]);

  if (!clean) return null;

  return (
    <div
      data-slot="profile-description"
      className={cn(
        'text-body leading-5 break-words text-foreground [&_a]:underline [&_a]:underline-offset-2 [&_p]:min-h-5 [&_p+p]:mt-2 [&_strong]:font-bold',
        className
      )}
      // Sanitized above.
      dangerouslySetInnerHTML={{ __html: clean }}
      onClick={e => {
        const link = (e.target as HTMLElement).closest('a');
        if (link) {
          link.target = '_blank';
          link.rel = 'noopener noreferrer';
        }
      }}
    />
  );
};
