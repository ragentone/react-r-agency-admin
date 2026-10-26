import type { IMenuComponentProps } from '@core/menu/types.ts';
import { cn } from '@ui/lib';
import { Tooltip, TooltipContent, TooltipTrigger } from '@ui/shad-cn/components/tooltip.tsx';
import { Link } from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { useLinks } from '../hooks';
import { openLinksMenu } from '../store.ts';

/**
 * Entry of the links menu in the main menu footer (drawer / sidebar / rail) – registered in
 * `core.tsx`. Hidden while no link is visible.
 */
export const LinksMenuTrigger: React.FC<IMenuComponentProps> = ({ variant, close }) => {
  const { t } = useTranslation('links');
  const { links } = useLinks();
  if (links.length === 0) return null;

  const label = t('menu.title');
  const button = (
    <button
      type="button"
      aria-haspopup="dialog"
      onClick={() => {
        // Mobile: close the main menu first, the links menu slides in from the right.
        close();
        openLinksMenu();
      }}
      className={cn(
        'group flex w-full shrink-0 items-center rounded-full text-muted-foreground transition-colors outline-none hover:bg-foreground/[0.06] hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50 [-webkit-tap-highlight-color:transparent]',
        variant === 'drawer' && 'gap-4 rounded-2xl px-3 py-2.5',
        variant === 'rail' && 'justify-center p-3',
        variant === 'sidebar' && 'gap-3 px-4 py-2'
      )}
    >
      <Link
        className={cn('shrink-0', variant === 'rail' ? 'size-6' : 'size-5')}
        strokeWidth={1.75}
        aria-hidden="true"
      />
      {variant !== 'rail' && <span className="truncate text-body font-medium">{label}</span>}
      {variant === 'rail' && <span className="sr-only">{label}</span>}
    </button>
  );

  if (variant !== 'rail') return button;
  return (
    <Tooltip>
      <TooltipTrigger asChild>{button}</TooltipTrigger>
      <TooltipContent side="right" sideOffset={6}>
        {label}
      </TooltipContent>
    </Tooltip>
  );
};
