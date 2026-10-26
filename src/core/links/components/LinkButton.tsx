import { useMenuText } from '@core/menu/components/use.menu.text.ts';
import { cn } from '@ui/lib';
import React from 'react';

import { useLinkAccess, useLinkRegistry, useLinks } from '../hooks';
import { LinkManager } from '../manager.ts';

export interface ILinkButtonProps {
  /** Id of a registered link (`imprint`, `terms`, `timeline:terms` …). */
  id: string;
  /** Default: the link's label. */
  children?: React.ReactNode;
  className?: string;
}

/**
 * Inline link that opens a registered link (link page / new tab), e.g. in forms:
 * `Ich akzeptiere die <LinkButton id="terms" />`. Renders nothing for unknown / hidden links.
 */
export const LinkButton: React.FC<ILinkButtonProps> = ({ id, children, className }) => {
  const text = useMenuText();
  useLinkRegistry();
  const { allowed } = useLinkAccess();
  const link = LinkManager.get(id);
  if (!link || !allowed(link)) return null;

  return (
    <button
      type="button"
      onClick={() => LinkManager.open(id)}
      className={cn(
        'inline font-medium text-foreground underline underline-offset-2 hover:opacity-80',
        className
      )}
    >
      {children ?? text(link.label)}
    </button>
  );
};

export interface ILinksInlineProps {
  /** Only these groups (default: `legal`). */
  groups?: string[];
  className?: string;
}

/** Compact row "Imprint · Terms · Privacy" – e.g. under login forms or in page footers. */
export const LinksInline: React.FC<ILinksInlineProps> = ({ groups = ['legal'], className }) => {
  const text = useMenuText();
  const { links } = useLinks({ groups });
  if (links.length === 0) return null;

  return (
    <nav className={cn('flex flex-wrap items-center gap-x-1 text-caption', className)}>
      {links.map((link, i) => (
        <React.Fragment key={link.id}>
          {i > 0 && (
            <span aria-hidden="true" className="text-muted-foreground/60">
              ·
            </span>
          )}
          <button
            type="button"
            onClick={() => LinkManager.open(link.id)}
            className="rounded px-1 py-0.5 text-muted-foreground transition-colors hover:text-foreground"
          >
            {text(link.label)}
          </button>
        </React.Fragment>
      ))}
    </nav>
  );
};
