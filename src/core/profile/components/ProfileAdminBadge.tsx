import { cn } from '@ui/lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from '@ui/shad-cn/components/popover.tsx';
import { ShieldCheck } from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next';

export interface IProfileAdminBadgeProps {
  className?: string;
}

/**
 * Admin mark next to the name (like X's verified badge). Tap / click → short explanation,
 * so the meaning is clear on touch devices too (no hover tooltip).
 */
export const ProfileAdminBadge: React.FC<IProfileAdminBadgeProps> = ({ className }) => {
  const { t } = useTranslation('profile');
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={t('admin.label')}
          className={cn(
            // 32px tap target around the 20px icon, visually aligned with the name.
            '-my-1.5 inline-grid size-8 shrink-0 place-items-center rounded-full text-foreground outline-none transition-colors hover:bg-foreground/10 focus-visible:ring-2 focus-visible:ring-ring',
            className
          )}
        >
          <ShieldCheck className="size-5" aria-hidden="true" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        sideOffset={8}
        className="w-[min(18rem,calc(100vw-2rem))] rounded-2xl border-border/50 p-4 shadow-lg"
      >
        <div className="flex items-start gap-3">
          <span className="grid size-9 shrink-0 place-items-center rounded-full bg-foreground text-background">
            <ShieldCheck className="size-5" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <p className="text-body leading-5 font-bold text-foreground">{t('admin.title')}</p>
            <p className="mt-0.5 text-body leading-5 text-muted-foreground">{t('admin.text')}</p>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};
