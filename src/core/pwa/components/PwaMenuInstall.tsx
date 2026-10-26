import type { IMenuComponentProps } from '@core/menu/types.ts';
import { cn } from '@ui/lib';
import { Tooltip, TooltipContent, TooltipTrigger } from '@ui/shad-cn/components/tooltip.tsx';
import { MonitorDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { usePwa } from './use.pwa.ts';

/** Main menu entry "Install app" – only while installing is possible. */
export const PwaMenuInstall = ({ variant, close }: IMenuComponentProps) => {
  const { t } = useTranslation('pwa');
  const { canInstall, iosInstallable, openInstallSheet } = usePwa();
  if (!canInstall && !iosInstallable) return null;

  const label = t('install.menu');
  const button = (
    <button
      type="button"
      aria-label={label}
      onClick={() => {
        close();
        // Let the menu drawer close first (back-button history), then open the sheet.
        window.setTimeout(openInstallSheet, variant === 'drawer' ? 320 : 0);
      }}
      className={cn(
        'group flex w-full items-center rounded-full text-muted-foreground outline-none transition-colors hover:bg-foreground/[0.06] hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50',
        variant === 'rail' ? 'justify-center p-3' : 'gap-3 py-2',
        variant === 'drawer' && 'rounded-2xl px-3',
        variant === 'sidebar' && 'px-4'
      )}
    >
      <MonitorDown className={variant === 'rail' ? 'size-6' : 'size-5'} strokeWidth={1.75} />
      {variant !== 'rail' && <span className="truncate text-body font-medium">{label}</span>}
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
