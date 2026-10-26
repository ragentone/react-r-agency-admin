import { type NotifySoundType, playNotifySoundIfEnabled } from '@core/notify/sound';
import { CircleAlert, CircleCheck, Info, Loader2, TriangleAlert } from 'lucide-react';
import { useTheme } from 'next-themes';
import * as React from 'react';
import { Toaster as Sonner, useSonner } from 'sonner';

import './sonner.css';

type ToasterProps = React.ComponentProps<typeof Sonner>;

/** Watches for newly incoming sonner toasts and plays notification sound if enabled. */
const ToastSoundObserver = () => {
  const { toasts } = useSonner();
  const seenIdsRef = React.useRef<Set<string | number>>(new Set());
  const initialRef = React.useRef(true);

  React.useEffect(() => {
    if (initialRef.current) {
      initialRef.current = false;
      seenIdsRef.current = new Set(toasts.map(t => t.id));
      return;
    }

    const currentIds = new Set(toasts.map(t => t.id));
    for (const toastItem of toasts) {
      if (!seenIdsRef.current.has(toastItem.id)) {
        const rawType = toastItem.type;
        let soundType: NotifySoundType = 'info';
        if (
          rawType === 'success' ||
          rawType === 'error' ||
          rawType === 'warning' ||
          rawType === 'info'
        ) {
          soundType = rawType;
        }
        playNotifySoundIfEnabled(soundType);
        break;
      }
    }
    seenIdsRef.current = currentIds;
  }, [toasts]);

  return null;
};

/**
 * Standard shadcn / sonner styled toast container.
 * Sonner reads its colors from CSS variables on the toaster.
 */
const TOASTER_STYLE = {
  // Toasts stay clickable even while a modal dialog sets `pointer-events: none` on <body>.
  pointerEvents: 'auto',
  '--width': '360px',
  '--border-radius': '18px',
  '--normal-bg': 'var(--popover)',
  '--normal-border': 'var(--border)',
  '--normal-text': 'var(--popover-foreground)',
} as React.CSSProperties;

const ICON_CLASS = 'size-[18px] shrink-0';

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = 'system' } = useTheme();

  return (
    <>
      <ToastSoundObserver />
      <Sonner
        theme={theme as ToasterProps['theme']}
        className="toaster group"
        // Top right on desktop, full-width on mobile (see sonner.css).
        position="top-right"
        offset={24}
        mobileOffset={{
          top: 0,
          left: 0,
          right: 0,
        }}
        // Room between stacked toasts.
        gap={16}
        visibleToasts={3}
        style={TOASTER_STYLE}
        icons={{
          success: <CircleCheck className={ICON_CLASS} />,
          info: <Info className={ICON_CLASS} />,
          warning: <TriangleAlert className={ICON_CLASS} />,
          error: <CircleAlert className={ICON_CLASS} />,
          loading: <Loader2 className={`${ICON_CLASS} animate-spin`} />,
        }}
        toastOptions={{
          classNames: {
            // `data-[styled=true]:` → only regular toasts; `toast.custom` / `unstyled: true`
            // (e.g. timeline progress) keep their own look. `!` overrides sonner's built-in sizing.
            toast:
              'pointer-events-auto group toast data-[styled=true]:items-center! data-[styled=true]:gap-3! data-[styled=true]:px-4! data-[styled=true]:py-3! data-[styled=true]:font-sans! data-[styled=true]:text-[15px]! data-[styled=true]:leading-5! data-[styled=true]:antialiased data-[styled=true]:shadow-lg! data-[styled=true]:border-border/60!',
            title: 'font-medium! text-[15px]! leading-5! text-foreground!',
            description: 'mt-0.5! text-[14px]! leading-[18px]! text-muted-foreground!',
            icon: 'm-0! size-[18px]! text-foreground',
            actionButton:
              'pointer-events-auto ml-auto! h-auto! cursor-pointer rounded-full! bg-primary! px-3! py-1! text-[14px]! font-medium! text-primary-foreground! transition-colors hover:bg-primary/90! focus-visible:outline-2 focus-visible:outline-ring',
            cancelButton:
              'pointer-events-auto h-auto! cursor-pointer rounded-full! bg-muted! px-3! py-1! text-[14px]! font-medium! text-muted-foreground! transition-colors hover:bg-muted/80! hover:text-foreground!',
            closeButton: 'border border-border! bg-background! text-muted-foreground! hover:bg-muted! hover:text-foreground!',
          },
        }}
        {...props}
      />
    </>
  );
};

export { Toaster };
