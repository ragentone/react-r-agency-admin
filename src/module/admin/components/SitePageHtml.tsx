import { cn } from '@ui/lib/utils';
import React, { useMemo } from 'react';

import { sanitizePageHtml } from '../sanitize';

export interface ISitePageHtmlProps {
  html: string | null | undefined;
  className?: string;
}

/** Content of a dynamic page – sanitized, readable typography (mobile first). */
export const SitePageHtml: React.FC<ISitePageHtmlProps> = ({ html, className }) => {
  const safe = useMemo(() => sanitizePageHtml(html), [html]);
  if (!safe) return null;
  return (
    <div
      data-slot="site-page-html"
      className={cn(
        'text-base leading-7 break-words text-foreground sm:text-[17px]',
        '[&>*+*]:mt-4 [&_li+li]:mt-1',
        '[&_h2]:mt-8 [&_h2]:text-xl [&_h2]:font-bold [&_h2]:tracking-tight',
        '[&_h3]:mt-6 [&_h3]:text-lg [&_h3]:font-bold',
        '[&_h4]:mt-5 [&_h4]:font-bold',
        '[&_ol]:list-decimal [&_ol]:pl-6 [&_ul]:list-disc [&_ul]:pl-6',
        '[&_b]:font-bold [&_strong]:font-bold [&_em]:italic [&_i]:italic',
        '[&_s]:line-through [&_u]:underline',
        '[&_a]:font-medium [&_a]:underline [&_a]:underline-offset-2',
        '[&_blockquote]:border-l-4 [&_blockquote]:border-border [&_blockquote]:pl-4 [&_blockquote]:text-muted-foreground',
        '[&_hr]:my-8 [&_hr]:border-border/60',
        '[&_mark]:rounded [&_mark]:bg-yellow-200/70 [&_mark]:px-0.5 dark:[&_mark]:bg-yellow-500/30',
        '[&_code]:rounded [&_code]:bg-foreground/[0.07] [&_code]:px-1 [&_code]:py-0.5 [&_code]:text-[0.9em]',
        '[&_pre]:overflow-x-auto [&_pre]:rounded-xl [&_pre]:bg-foreground/[0.06] [&_pre]:p-4 [&_pre]:text-sm',
        '[&_pre_code]:bg-transparent [&_pre_code]:p-0',
        className
      )}
      dangerouslySetInnerHTML={{ __html: safe }}
    />
  );
};
