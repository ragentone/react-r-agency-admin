import { Link } from '@tanstack/react-router';
import React from 'react';

import { isInternalUrl, isSafeUrl } from './types';

/**
 * Internal paths navigate in the app (`/site/x#preise` → path + hash, the page scrolls to the
 * block), `#preise` jumps on the same page, everything else opens externally.
 */
export const BlockLink: React.FC<{
  href: string;
  className?: string;
  children: React.ReactNode;
}> = ({ href, className, children }) => {
  if (!isSafeUrl(href)) return <span className={className}>{children}</span>;
  if (isInternalUrl(href) && !href.startsWith('#')) {
    const [path, hash] = href.split('#', 2);
    return (
      <Link to={path} hash={hash || undefined} className={className}>
        {children}
      </Link>
    );
  }
  const external = /^https?:\/\//i.test(href);
  return (
    <a
      href={href}
      className={className}
      {...(external ? { target: '_blank', rel: 'noopener noreferrer nofollow' } : {})}
    >
      {children}
    </a>
  );
};
