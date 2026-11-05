import { Button } from '@ui/shad-cn/components/button';
import { Popover, PopoverContent, PopoverTrigger } from '@ui/shad-cn/components/popover';
import * as React from 'react';
import { useTranslation } from 'react-i18next';

export interface IConfirmPopoverButtonProps extends Omit<
  React.ComponentProps<typeof Button>,
  'onClick' | 'children' | 'title'
> {
  /** Text of the trigger button. */
  children: React.ReactNode;
  /** Question shown in the popover, e.g. „Wirklich löschen?“. */
  title?: React.ReactNode;
  /** Optional detail text under the question. */
  description?: React.ReactNode;
  /** Label of the confirm button. Default: `base` → `confirm.ok`. */
  confirmLabel?: string;
  /** Label of the cancel button. Default: `base` → `confirm.cancel`. */
  cancelLabel?: string;
  /** `destructive` (red) only for irreversible actions. */
  confirmVariant?: 'default' | 'destructive';
  /** Runs on confirm. The popover stays open and locked while a Promise is pending. */
  onConfirm: () => void | Promise<void>;
  side?: 'top' | 'right' | 'bottom' | 'left';
  align?: 'start' | 'center' | 'end';
}

/**
 * Trigger button that opens a small popover asking for confirmation.
 * Closes with Cancel, Escape or a click outside. Use it for quick, inline confirmations;
 * for larger decisions use `confirm` (drawer) instead.
 */
export const ConfirmPopoverButton: React.FC<IConfirmPopoverButtonProps> = ({
  children,
  title,
  description,
  confirmLabel,
  cancelLabel,
  confirmVariant = 'default',
  onConfirm,
  side = 'bottom',
  align = 'center',
  disabled,
  ...buttonProps
}) => {
  const { t } = useTranslation('base');
  const [open, setOpen] = React.useState(false);
  const [busy, setBusy] = React.useState(false);

  const handleConfirm = async () => {
    setBusy(true);
    try {
      await onConfirm();
      setOpen(false);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Popover open={open} onOpenChange={next => !busy && setOpen(next)}>
      <PopoverTrigger asChild>
        <Button disabled={disabled} {...buttonProps}>
          {children}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        side={side}
        align={align}
        className="w-72 flex flex-col gap-2 border-border/50 p-4"
      >
        {title && <p className="text-body font-bold text-foreground">{title}</p>}
        {description && <p className="text-caption text-muted-foreground">{description}</p>}
        <div className="grid grid-cols-2 gap-2">
          <Button variant="outline" size="sm" disabled={busy} onClick={() => setOpen(false)}>
            {cancelLabel ?? t('confirm.cancel')}
          </Button>
          <Button variant={confirmVariant} size="sm" isLoading={busy} onClick={handleConfirm}>
            {confirmLabel ?? t('confirm.ok')}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};
