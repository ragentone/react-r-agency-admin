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

/** Side drawers (left / right): column width on any screen, full height for `full`. */
const APP_DRAWER_SIDE_WIDTH = {
  '--drawer-content-width': 'min(88dvw, 28rem)',
} as React.CSSProperties;
const APP_DRAWER_SIDE_SIZE = {
  ...APP_DRAWER_SIDE_WIDTH,
  '--drawer-height': '100dvh',
  '--drawer-content-max-height': '100dvh',
} as React.CSSProperties;

/** `fullscreen`: the popup covers the whole viewport (100dvw × 100dvh). */
const APP_DRAWER_FULLSCREEN_SIZE = {
  '--drawer-height': '100dvh',
  '--drawer-content-max-height': '100dvh',
  '--drawer-content-width': '100dvw',
  '--drawer-inset': '0px',
} as React.CSSProperties;

export interface IAppDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Fires once the open / close animation finished. */
  onOpenChangeComplete?: (open: boolean) => void;
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
  /** `full` = almost full height (default), `auto` = fits the content, `fullscreen` = whole viewport, no radius. */
  size?: 'full' | 'auto' | 'fullscreen';
  /**
   * No title bar – the content brings its own. The title stays for screen readers;
   * pass `title={null}` when the content renders its own `DrawerTitle`.
   */
  hideHeader?: boolean;
  /** Grip bar at the drawer edge (default: shown). */
  showSwipeHandle?: boolean;
  /** Hides the grip bar via CSS only (stays mounted, swipe to close keeps working). Default `false`. */
  hideSwipeHandle?: boolean;
  /** Changes → the body is new (scroll position starts at the top). */
  bodyKey?: React.Key;
  bodyClassName?: string;
  /** Escape hatch for the popup (extra classes, style, onClick …). */
  contentProps?: Omit<React.ComponentProps<typeof DrawerContent>, 'children'>;
  /** Wraps header, body and footer (used by `AppFormDrawer` for the `<form>`). */
  wrapper?: (children: React.ReactNode) => React.ReactNode;
  children: React.ReactNode;
  direction?: 'up' | 'down' | 'left' | 'right';
  /** `full` only: the height follows the content instead of the fixed drawer height. */
  autoHeight?: boolean;
  /** Browser / Android back closes the drawer. Default `true`. */
  backClose?: boolean;
  hideFooter?: boolean;
}

/**
 * The bottom drawer of the platform: title bar (back | title | action | close),
 * scrolling body, optional sticky footer. Mobile first, 600px column from `sm`.
 */
export const AppDrawer: React.FC<IAppDrawerProps> = ({
  open,
  onOpenChange,
  onOpenChangeComplete,
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
  showSwipeHandle = true,
  hideSwipeHandle = true,
  bodyKey,
  bodyClassName,
  contentProps,
  wrapper,
  children,
  direction,
  autoHeight = false,
  backClose = true,
  hideFooter = false,
}) => {
  const { t } = useTranslation('base');
  const close = closeLabel ?? t('drawer.close');
  const back = backLabel ?? t('drawer.back');
  const sr = description ?? (typeof title === 'string' ? title : '');

  // Layout by size and side. Top / bottom: full-width row. Left / right: a column that stays
  // at its side. `fullscreen`: no radius, no border, no inset.
  const isSide = direction === 'left' || direction === 'right';
  // Bottom drawer (default `down`): flush to the bottom edge, square bottom corners, no bottom border.
  const isBottom = !isSide && direction !== 'up';
  // Top drawer (`up`): flush to the top edge, square top corners, no top border.
  const isTop = direction === 'up';
  const isLeft = direction === 'left';
  const isRight = direction === 'right';

  // fullscreen
  const layoutClass =
    size === 'fullscreen'
      ? 'h-dvh w-dvw max-h-dvh max-w-none rounded-none border-0 m-0'
      : isSide
        ? cn('max-w-none rounded-none', {
            'rounded-r-[min(var(--radius-4xl),24px)]': isLeft,
            'rounded-l-[min(var(--radius-4xl),24px)]': isRight,
            'm-0 border-0 border-r border-border/50': isLeft,
            'm-0 border-0 border-l border-border/50': isRight,
          })
        : cn('mx-auto w-full max-w-150', {
            'rounded-b-none border-b-0 border-border/50': isBottom,
            'rounded-t-none border-t-0 border-border/50': isTop,
            'h-dvh': isSide,
          });

  const fullStyle: React.CSSProperties = isSide ? APP_DRAWER_SIDE_SIZE : APP_DRAWER_SIZE;
  const sizeStyle: React.CSSProperties | undefined =
    size === 'fullscreen'
      ? APP_DRAWER_FULLSCREEN_SIZE
      : size === 'full'
        ? autoHeight
          ? ({ ...fullStyle, '--drawer-height': 'auto' } as React.CSSProperties)
          : fullStyle
        : isSide
          ? APP_DRAWER_SIDE_WIDTH
          : undefined;
  const layoutStyle: React.CSSProperties | undefined =
    isBottom || isTop || isSide
      ? ({ ...sizeStyle, '--drawer-inset': '0px' } as React.CSSProperties)
      : sizeStyle;

  const inner = (
    <>
      {hideHeader ? (
        title != null && <DrawerTitle className="sr-only">{title}</DrawerTitle>
      ) : (
        <div
          className={cn(
            'flex min-h-13 shrink-0 items-center gap-2 border-b border-border/50 px-3',
            {
              'pb-2': isBottom && !hideSwipeHandle,
              'bg-gray-50 dark:bg-transparent': true,
            }
          )}
        >
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
      {!hideFooter && (
        <div
          className={cn(
            'shrink-0 border-t border-border/50 bg-background px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]',
            {
              'bg-gray-50 dark:bg-transparent': true,
            }
          )}
        >
          {footer}
        </div>
      )}
    </>
  );

  return (
    <Drawer
      open={open}
      backClose={backClose}
      onOpenChange={next => {
        if (!next && locked) return;
        onOpenChange(next);
      }}
      onOpenChangeComplete={onOpenChangeComplete}
      showSwipeHandle={showSwipeHandle}
      swipeDirection={direction}
    >
      <DrawerPrimitive.VirtualKeyboardProvider>
        <DrawerContent
          {...contentProps}
          className={cn(
            layoutClass,
            hideSwipeHandle && '[&_[data-slot=drawer-swipe-handle]]:hidden',
            contentProps?.className
          )}
          style={{ ...layoutStyle, ...contentProps?.style }}
        >
          {sr && <DrawerDescription className="sr-only">{sr}</DrawerDescription>}
          {wrapper ? wrapper(inner) : inner}
        </DrawerContent>
      </DrawerPrimitive.VirtualKeyboardProvider>
    </Drawer>
  );
};
