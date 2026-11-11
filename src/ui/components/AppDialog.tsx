import { cn } from '@ui/lib/utils';
import { Button } from '@ui/shad-cn/components/button.tsx';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@ui/shad-cn/components/dialog.tsx';
import { X } from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next';

export type AppDialogSize = 'sm' | 'md' | 'lg';

export interface IAppDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Heading. Always set it: screen readers announce it. */
  title?: React.ReactNode;
  /** Hides the heading visually (it is still read out). */
  hideTitle?: boolean;
  /** Text under the heading. Without it the title is read out as description. */
  description?: React.ReactNode;
  /** Scrollable content. */
  children?: React.ReactNode;
  /** Fixed area at the bottom (buttons). */
  footer?: React.ReactNode;
  /** Width from tablet on. On phones the dialog always fills the screen. */
  size?: AppDialogSize;
  /**
   * Browser / Android back closes the dialog instead of leaving the page (default `true`).
   * Set `false` only for dialogs whose state lives in the URL.
   */
  backClose?: boolean;
  /** Extra classes for the content box. */
  className?: string;
  /** Extra classes for the scrollable body. */
  bodyClassName?: string;
  /** Covers the whole dialog, header included (e.g. a loading overlay). Positioned absolute. */
  overlay?: React.ReactNode;
  /** Rounded corners from tablet on. Default `true`. */
  rounded?: boolean;
}

const SIZE_CLASS: Record<AppDialogSize, string> = {
  sm: 'sm:max-w-sm',
  md: 'sm:max-w-lg',
  lg: 'sm:max-w-2xl',
};

/**
 * Reusable dialog: mobile full screen, from tablet a centered card. Closes with the X, Escape,
 * a click outside or the browser / Android back button (via `shadcn dialog`).
 *
 * Layout: header (title + X), scrollable body, optional footer.
 */
export const AppDialog: React.FC<IAppDialogProps> = ({
  open,
  onOpenChange,
  title,
  hideTitle = false,
  description,
  children,
  footer,
  size = 'md',
  backClose = true,
  className,
  bodyClassName,
  overlay,
  rounded = true,
}) => {
  const { t } = useTranslation('base');
  return (
    <Dialog open={open} onOpenChange={onOpenChange} backClose={backClose}>
      <DialogContent
        showCloseButton={false}
        overlayClassName="bg-black/50"
        className={cn(
          // Phone: full screen, slides in from the bottom. Tablet and up: centered card, no slide.
          'top-0 left-0 flex h-dvh max-h-dvh w-full max-w-none translate-x-0 translate-y-0 flex-col gap-0 rounded-none p-0',
          'data-[state=open]:animate-dialog-sheet-in data-[state=closed]:animate-dialog-sheet-out',
          'sm:top-1/2 sm:left-1/2 sm:h-auto sm:max-h-[85dvh] sm:-translate-x-1/2 sm:-translate-y-1/2',
          'sm:data-[state=open]:animate-none sm:data-[state=closed]:animate-none',
          // Clip the content to the radius, otherwise border and header lines stick out at the corners.
          rounded ? 'sm:rounded-2xl sm:overflow-hidden' : 'sm:rounded-none',
          SIZE_CLASS[size],
          className
        )}
      >
        <div className="flex shrink-0 items-center gap-2 border-b border-border/50 pl-4 pr-2 py-2">
          <DialogHeader className="min-w-0 flex-1 space-y-0.5 text-left">
            {title && (
              <DialogTitle className={cn('truncate text-body font-bold', hideTitle && 'sr-only')}>
                {title}
              </DialogTitle>
            )}
            <DialogDescription className={cn(!description && 'sr-only')}>
              {description ?? title}
            </DialogDescription>
          </DialogHeader>
          <DialogClose asChild>
            <Button
              variant="ghost"
              size="icon-md"
              aria-label={t('drawer.close')}
              className="shrink-0"
            >
              <X className="size-4.5" aria-hidden="true" />
            </Button>
          </DialogClose>
        </div>

        <div className={cn('min-h-0 flex-1 overflow-y-auto', bodyClassName)}>{children}</div>

        {footer && (
          <DialogFooter className="shrink-0 border-t border-border/50 p-4">{footer}</DialogFooter>
        )}
        {overlay}
      </DialogContent>
    </Dialog>
  );
};
