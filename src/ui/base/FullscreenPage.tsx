import { UserRole } from '@core/auth';
import { cn } from '@ui/lib/utils';
import React, { useEffect, useId, useRef } from 'react';
import { createPortal } from 'react-dom';

/**
 * Overlays that sit *above* a fullscreen page and handle Escape themselves
 * (drawers, Radix dialogs / alert dialogs, popovers, menus, selects …).
 */
const OVERLAY_SELECTOR = [
  '[data-slot="drawer-popup"]',
  '[role="dialog"][data-state="open"]',
  '[role="alertdialog"]',
  '[data-radix-popper-content-wrapper]',
].join(',');

/** Open fullscreen pages, last = topmost (only that one reacts to Escape). */
const stack: string[] = [];
let scrollLocks = 0;
let previousOverflow = '';

const lockScroll = () => {
  if (scrollLocks++ === 0) {
    previousOverflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = 'hidden';
  }
};
const unlockScroll = () => {
  if (--scrollLocks === 0) document.documentElement.style.overflow = previousOverflow;
};

export interface IFullscreenPageProps {
  open: boolean;
  /** Escape (if `closeOnEscape`) – the caller restores the URL / state. */
  onClose?: () => void;
  /** Accessible name of the page (screen readers). */
  title: string;
  /** Default `true`. `false` e.g. for a running call. */
  closeOnEscape?: boolean;
  /**
   * `column`: centered 600px column with side borders from `sm` (timeline, profile …).
   * `full`: the whole screen (meet, chat …).
   */
  layout?: 'column' | 'full';
  /** Root (background, text color …). */
  className?: string;
  /** Inner element (column / full area) – e.g. `overflow-y-auto` to make it the scroller. */
  contentClassName?: string;
  /** Ref of the inner element (e.g. scroll to top). */
  contentRef?: React.Ref<HTMLDivElement>;
  /** `data-slot` of the root. */
  slot?: string;
  children: React.ReactNode;
  userRole?: string[];
}

/**
 * Full screen page above the current route (detail, profile, account, meet …) – the page below
 * stays mounted, so its scroll position is kept.
 *
 * Deliberately *no* modal dialog primitive: drawers, popovers and dialogs opened from inside
 * are portaled next to it, and a modal dialog's focus trap / scroll lock would make their
 * editors un-typeable and their content un-scrollable. Instead:
 * - Escape only closes the topmost page and only when no overlay is open above it,
 * - the document behind does not scroll while a page is open,
 * - focus moves into the page and back to the trigger afterwards.
 */
export const FullscreenPage: React.FC<IFullscreenPageProps> = ({
  open,
  onClose,
  title,
  closeOnEscape = true,
  layout = 'column',
  className,
  contentClassName,
  contentRef,
  slot,
  children,
  userRole,
}) => {
  const id = useId();
  const rootRef = useRef<HTMLDivElement | null>(null);
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!open) return;
    stack.push(id);
    lockScroll();
    const previousFocus = document.activeElement as HTMLElement | null;
    rootRef.current?.focus({ preventScroll: true });

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape' || event.defaultPrevented || !closeOnEscape) return;
      if (stack[stack.length - 1] !== id) return;
      // Something above this page (outside of it) handles Escape itself.
      const root = rootRef.current;
      const overlayAbove = Array.from(document.querySelectorAll(OVERLAY_SELECTOR)).some(
        node => !root?.contains(node) && !node.hasAttribute('data-fullscreen-page')
      );
      if (overlayAbove) return;
      onCloseRef.current?.();
    };
    document.addEventListener('keydown', onKeyDown);

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      const index = stack.lastIndexOf(id);
      if (index !== -1) stack.splice(index, 1);
      unlockScroll();
      if (previousFocus?.isConnected) previousFocus.focus({ preventScroll: true });
    };
  }, [open, id, closeOnEscape]);

  if (!open) return null;

  return createPortal(
    <div
      ref={rootRef}
      role="dialog"
      aria-modal="true"
      aria-label={title}
      tabIndex={-1}
      data-slot={slot ?? 'fullscreen-page'}
      data-fullscreen-page=""
      // Counts as an open dialog for back-close.core (URL pages: back navigates as before).
      data-state="open"
      className={cn(
        'fixed inset-0 z-50 flex justify-center overflow-hidden bg-background text-foreground outline-none',
        'animate-in fade-in-0 slide-in-from-bottom-6 duration-200 motion-reduce:animate-none',
        className
      )}
    >
      <div
        ref={contentRef}
        className={cn(
          'flex h-dvh w-full min-w-0 flex-col',
          layout === 'column' && 'max-w-[600px] sm:border-x sm:border-border/50',
          contentClassName
        )}
      >
        <UserRole role={userRole}>{children}</UserRole>
      </div>
    </div>,
    document.body
  );
};
