import * as DialogPrimitive from '@radix-ui/react-dialog';
import { useBackCloseProps } from '@ui/lib/back-close.core.ts';
import { cn } from '@ui/lib/utils';
import {
  Dialog,
  DialogClose,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
} from '@ui/shad-cn/components/dialog';
import { X } from 'lucide-react';
import type { FormEvent, ReactNode } from 'react';

/** Max width from `sm` up. On phones the dialog always spans the full width. */
const SIZE = {
  md: 'sm:max-w-md',
  lg: 'sm:max-w-2xl',
  xl: 'sm:max-w-4xl',
} as const;

export interface IAppDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: ReactNode;
  /** Visible under the title. Without it the dialog still has a (hidden) description for screen readers. */
  description?: string;
  /** Right of the title, left of the close button (e.g. edit button, ⋯ menu). */
  headerActions?: ReactNode;
  /** Fixed area at the bottom (buttons). Stays visible while the body scrolls. */
  footer?: ReactNode;
  /** Wraps body and footer in a form, so the footer buttons can submit. */
  onSubmit?: (event: FormEvent<HTMLFormElement>) => void;
  size?: keyof typeof SIZE;
  className?: string;
  bodyClassName?: string;
  children: ReactNode;
}

/**
 * Dialog that slides up from the bottom and down again on close. Header and footer stay fixed,
 * the body scrolls. Back (browser or Android) closes it, via the same mechanism as every dialog.
 */
export const AppDialog = ({
  open,
  onOpenChange,
  title,
  description,
  headerActions,
  footer,
  onSubmit,
  size = 'lg',
  className,
  bodyClassName,
  children,
}: IAppDialogProps) => {
  const inner = (
    <>
      <DialogHeader className="shrink-0 flex-row items-start justify-between gap-3 space-y-0 border-b border-border/50 py-4 pr-14 pl-6">
        <div className="min-w-0 flex-1 space-y-1">
          <DialogTitle className="text-title font-bold break-words">{title}</DialogTitle>
          <DialogDescription className={description ? 'text-caption' : 'sr-only'}>
            {description ?? (typeof title === 'string' ? title : '')}
          </DialogDescription>
        </div>
        {headerActions && <div className="flex shrink-0 items-center gap-2">{headerActions}</div>}
      </DialogHeader>

      <div
        className={cn(
          'flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto px-6 py-5',
          bodyClassName
        )}
      >
        {children}
      </div>

      {footer && (
        <DialogFooter className="shrink-0 gap-2 border-t border-border/50 px-6 py-4">
          {footer}
        </DialogFooter>
      )}
    </>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogPortal>
        <DialogOverlay />
        <DialogPrimitive.Content
          {...useBackCloseProps()}
          className={cn(
            // Bottom sheet: slides up from the bottom, slides down on close. No centring transform,
            // so the slide animation is not fighting a translate class.
            'fixed inset-x-0 bottom-0 z-50 flex max-h-[90dvh] w-full flex-col rounded-t-2xl border-t border-border/50 bg-background shadow-lg',
            'duration-300 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:slide-in-from-bottom data-[state=closed]:slide-out-to-bottom',
            'sm:mx-auto sm:inset-y-0 sm:my-auto sm:h-fit sm:rounded-2xl sm:border',
            SIZE[size],
            className
          )}
        >
          {onSubmit ? (
            <form onSubmit={onSubmit} className="flex min-h-0 flex-1 flex-col">
              {inner}
            </form>
          ) : (
            inner
          )}
          <DialogClose className="absolute top-4 right-4 rounded-sm opacity-70 transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
            <X className="size-4" />
            <span className="sr-only">Close</span>
          </DialogClose>
        </DialogPrimitive.Content>
      </DialogPortal>
    </Dialog>
  );
};
