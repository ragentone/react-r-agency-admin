import { cn } from '@ui/lib/utils';
import { AppDrawer } from '@ui/patterns/drawer';
import { DrawerHeader, DrawerTitle } from '@ui/shad-cn/components/drawer';
import { Popover, PopoverContent, PopoverTrigger } from '@ui/shad-cn/components/popover';
import { cloneElement, type MouseEvent, type ReactElement, type ReactNode } from 'react';

import { useIsMobile } from './use.media.query';

export interface ResponsivePopoverContext {
  /** Rendered inside the mobile bottom sheet. */
  sheet: boolean;
}

/** Props the trigger must accept (the sheet opens on its click). */
interface ITriggerProps {
  onClick?: (event: MouseEvent) => void;
}

export interface ResponsivePopoverProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** The trigger button (must accept onClick and aria props). */
  trigger: ReactElement<ITriggerProps>;
  /** Title of the bottom sheet (also its accessible name). */
  title: string;
  children: ReactNode | ((context: ResponsivePopoverContext) => ReactNode);
  align?: 'start' | 'center' | 'end';
  /** Classes for the desktop popover. */
  popoverClassName?: string;
  /** Classes for the sheet body. */
  sheetClassName?: string;
  /** Desktop: stay open when focus moves back into the editor. */
  keepOpenOnFocusOutside?: boolean;
  /** Sheet: focus the first field on open (shows the keyboard). Default: false */
  sheetAutoFocus?: boolean;
  /** Override the automatic choice. */
  mode?: 'popover' | 'sheet';
}

/** Attributes of the sheet popup (the html editor checks them for outside clicks). */
const SHEET_ATTRS = { 'data-html-editor-ui': '' };

/**
 * Popover on larger screens, bottom sheet (AppDrawer) on phones.
 * Never returns focus to the trigger, so the editor keeps its selection.
 */
export function ResponsivePopover({
  open,
  onOpenChange,
  trigger,
  title,
  children,
  align = 'start',
  popoverClassName,
  sheetClassName,
  keepOpenOnFocusOutside = false,
  sheetAutoFocus = false,
  mode,
}: ResponsivePopoverProps) {
  const isMobile = useIsMobile();
  const sheet = (mode ?? (isMobile ? 'sheet' : 'popover')) === 'sheet';
  const content = typeof children === 'function' ? children({ sheet }) : children;

  if (!sheet) {
    return (
      <Popover open={open} onOpenChange={onOpenChange}>
        <PopoverTrigger asChild>{trigger}</PopoverTrigger>
        <PopoverContent
          data-html-editor-ui=""
          align={align}
          collisionPadding={8}
          className={cn('max-w-[calc(100vw-1rem)]', popoverClassName)}
          onCloseAutoFocus={event => event.preventDefault()}
          onFocusOutside={event => keepOpenOnFocusOutside && event.preventDefault()}
        >
          {content}
        </PopoverContent>
      </Popover>
    );
  }

  // The sheet opens on the trigger's click (no DrawerTrigger); the trigger keeps its own handler.
  const sheetTrigger = cloneElement(trigger, {
    onClick: (event: MouseEvent) => {
      trigger.props.onClick?.(event);
      onOpenChange(true);
    },
  });

  return (
    <>
      {sheetTrigger}
      <AppDrawer
        open={open}
        onOpenChange={next => onOpenChange(next)}
        title={null}
        hideHeader
        size="auto"
        showSwipeHandle
        contentProps={{ ...SHEET_ATTRS, initialFocus: sheetAutoFocus, finalFocus: false }}
      >
        <DrawerHeader className="pt-2 pb-1">
          <DrawerTitle className="text-sm">{title}</DrawerTitle>
        </DrawerHeader>
        <div
          className={cn(
            'min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pt-2 pb-[max(1rem,env(safe-area-inset-bottom))]',
            sheetClassName
          )}
        >
          {content}
        </div>
      </AppDrawer>
    </>
  );
}
