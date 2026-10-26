import { Drawer as DrawerPrimitive } from '@base-ui/react/drawer';
import { cn } from '@ui/lib/utils';
import { Button } from '@ui/shad-cn/components/button.tsx';
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerTitle,
} from '@ui/shad-cn/components/drawer.tsx';
import { ArrowLeft, X } from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next';

/** Almost full height on phones, max. ~830px on large screens. */
export const APP_DRAWER_SIZE = {
  '--drawer-height': 'min(calc(100dvh - 2.5rem), 52rem)',
  '--drawer-content-max-height': 'min(calc(100dvh - 2.5rem), 52rem)',
} as React.CSSProperties;

export interface IAppDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: React.ReactNode;
  /** Screen-reader description. Default: the title (if it is a string). */
  description?: string;
  /** Default: „Schließen“ from the `base` namespace. */
  closeLabel?: string;
  /** While saving: swipe / back / Escape / X don't close. */
  locked?: boolean;
  /** Right of the title (e.g. the „Posten“ button or a menu). */
  action?: React.ReactNode;
  /** Fixed area between title bar and body (tabs, steps, search field). */
  subHeader?: React.ReactNode;
  /** Sticky area at the bottom (thumb zone, above the keyboard) – e.g. the save button. */
  footer?: React.ReactNode;
  /** Back arrow before the title (sub pane inside the drawer). */
  onBack?: () => void;
  backLabel?: string;
  /** `full` = almost full height (default), `auto` = fits the content. */
  size?: 'full' | 'auto';
  /**
   * No title bar – the content brings its own. The title stays for screen readers;
   * pass `title={null}` when the content renders its own `DrawerTitle`.
   */
  hideHeader?: boolean;
  /** Changes → the body is new (scroll position starts at the top). */
  bodyKey?: React.Key;
  bodyClassName?: string;
  /** Escape hatch for the popup (extra classes, style, onClick …). */
  contentProps?: Omit<React.ComponentProps<typeof DrawerContent>, 'children'>;
  /** Wraps header, body and footer (used by `AppFormDrawer` for the `<form>`). */
  wrapper?: (children: React.ReactNode) => React.ReactNode;
  children: React.ReactNode;
  direction?: 'up' | 'down' | 'left' | 'right';
}

/**
 * The bottom drawer of the platform: title bar (back | title | action | close),
 * scrolling body, optional sticky footer. Mobile first, 600px column from `sm`.
 */
export const AppDrawer: React.FC<IAppDrawerProps> = ({
  open,
  onOpenChange,
  title,
  description,
  closeLabel,
  locked,
  action,
  subHeader,
  footer,
  onBack,
  backLabel,
  size = 'full',
  hideHeader,
  bodyKey,
  bodyClassName,
  contentProps,
  wrapper,
  children,
  direction,
}) => {
  const { t } = useTranslation('base');
  const close = closeLabel ?? t('drawer.close');
  const back = backLabel ?? t('drawer.back');
  const sr = description ?? (typeof title === 'string' ? title : '');

  const inner = (
    <>
      {hideHeader ? (
        title != null && <DrawerTitle className="sr-only">{title}</DrawerTitle>
      ) : (
        <div className="flex min-h-13 shrink-0 items-center gap-2 border-b border-border/50 px-3 pb-2">
          {onBack && (
            <Button
              variant="ghost"
              size="icon-lg"
              onClick={onBack}
              disabled={locked}
              aria-label={back}
              title={back}
            >
              <ArrowLeft className="size-5" />
            </Button>
          )}
          <DrawerTitle
            className={cn('min-w-0 flex-1 truncate text-title font-bold', !onBack && 'pl-1')}
          >
            {title}
          </DrawerTitle>
          {action}
          <Button
            variant="ghost"
            size="icon-lg"
            onClick={() => onOpenChange(false)}
            disabled={locked}
            aria-label={close}
            title={close}
          >
            <X className="size-5" />
          </Button>
        </div>
      )}
      {subHeader && <div className="shrink-0 border-b border-border/50">{subHeader}</div>}
      {hideHeader ? (
        children
      ) : (
        <div
          key={bodyKey}
          className={cn(
            'min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pt-4',
            footer ? 'pb-4' : 'pb-[max(1.5rem,env(safe-area-inset-bottom))]',
            bodyClassName
          )}
        >
          {children}
        </div>
      )}
      {footer && (
        <div className="shrink-0 border-t border-border/50 bg-background px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          {footer}
        </div>
      )}
    </>
  );

  return (
    <Drawer
      open={open}
      onOpenChange={next => {
        if (!next && locked) return;
        onOpenChange(next);
      }}
      showSwipeHandle
      swipeDirection={direction}
    >
      <DrawerPrimitive.VirtualKeyboardProvider>
        <DrawerContent
          {...contentProps}
          className={cn('mx-auto w-full max-w-150', contentProps?.className)}
          style={{ ...(size === 'full' ? APP_DRAWER_SIZE : undefined), ...contentProps?.style }}
        >
          {sr && <DrawerDescription className="sr-only">{sr}</DrawerDescription>}
          {wrapper ? wrapper(inner) : inner}
        </DrawerContent>
      </DrawerPrimitive.VirtualKeyboardProvider>
    </Drawer>
  );
};
