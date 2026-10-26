import { Drawer as DrawerPrimitive } from '@base-ui/react/drawer';
import { cn } from '@ui/lib/utils';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@ui/shad-cn/components/drawer';
import { Popover, PopoverContent, PopoverTrigger } from '@ui/shad-cn/components/popover';
import type { ReactElement, ReactNode } from 'react';

import { useIsMobile } from './use.media.query';

export interface ResponsivePopoverContext {
  /** Rendered inside the mobile bottom sheet. */
  sheet: boolean;
}

export interface ResponsivePopoverProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** The trigger button (must accept ref, onClick and aria props). */
  trigger: ReactElement;
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

/**
 * Popover on larger screens, bottom sheet (Base UI drawer) on phones.
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

  return (
    <Drawer open={open} onOpenChange={next => onOpenChange(next)} showSwipeHandle>
      <DrawerTrigger render={trigger} />
      {/* Keeps focused fields visible above the on-screen keyboard. */}
      <DrawerPrimitive.VirtualKeyboardProvider>
        <DrawerContent data-html-editor-ui="" initialFocus={sheetAutoFocus} finalFocus={false}>
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
        </DrawerContent>
      </DrawerPrimitive.VirtualKeyboardProvider>
    </Drawer>
  );
}
