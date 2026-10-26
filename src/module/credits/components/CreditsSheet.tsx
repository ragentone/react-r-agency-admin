import { cn } from '@ui/lib/utils';
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerTitle,
} from '@ui/shad-cn/components/drawer.tsx';
import React, { type ReactNode } from 'react';

export interface ICreditsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: ReactNode;
  description?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
}

/** Bottom sheet of the credits (purchase, tip) – thumb-friendly, also centered on desktop. */
export const CreditsSheet: React.FC<ICreditsSheetProps> = ({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
}) => (
  <Drawer open={open} onOpenChange={onOpenChange} showSwipeHandle>
    <DrawerContent className="mx-auto w-full max-w-[480px]">
      <div className="flex max-h-[85dvh] flex-col sm:max-h-[80dvh]">
        <div className="px-5 pt-1 pb-3">
          <DrawerTitle className="text-title font-bold text-foreground">{title}</DrawerTitle>
          <DrawerDescription
            className={cn(description ? 'mt-0.5 text-body text-muted-foreground' : 'sr-only')}
          >
            {description ?? title}
          </DrawerDescription>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pb-3">
          {children}
        </div>
        {footer && (
          <div className="space-y-2 border-t border-border/50 px-5 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))]">
            {footer}
          </div>
        )}
      </div>
    </DrawerContent>
  </Drawer>
);

/** Label / value row of a sheet (price, balance …). */
export const CreditsSheetRow: React.FC<{
  label: ReactNode;
  value: ReactNode;
  strong?: boolean;
}> = ({ label, value, strong = false }) => (
  <div className="flex items-center justify-between gap-4 py-2.5 text-body">
    <span className="text-muted-foreground">{label}</span>
    <span
      className={cn(
        'text-right tabular-nums',
        strong ? 'font-bold text-foreground' : 'font-semibold'
      )}
    >
      {value}
    </span>
  </div>
);

export const creditsPrimaryButton =
  'inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-foreground px-5 text-body font-bold text-background outline-none transition-opacity hover:opacity-85 active:opacity-75 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-40';

export const creditsSecondaryButton =
  'inline-flex h-12 w-full items-center justify-center rounded-full border border-border px-5 text-body font-bold text-foreground outline-none transition-colors hover:bg-foreground/[0.04] active:bg-foreground/[0.08] focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-40';
