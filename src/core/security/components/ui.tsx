import { cn } from '@ui/lib/utils';
import { Button } from '@ui/shad-cn/components/button.tsx';
import { AppDrawer } from '@ui/patterns';
import { Input } from '@ui/shad-cn/components/input.tsx';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@ui/shad-cn/components/input-otp.tsx';
import { ChevronRight, Eye, EyeOff, type LucideIcon } from 'lucide-react';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

export interface ISecurityDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: React.ReactNode;
  description: string;
  /** Busy → cannot be closed by swipe / backdrop. */
  locked?: boolean;
  action?: React.ReactNode;
  /** Sticky bottom area (thumb zone). */
  footer?: React.ReactNode;
  onBack?: () => void;
  compact?: boolean;
  children: React.ReactNode;
}

/** shadcn bottom drawer: title bar (back | title | action | close), scrolling body, sticky footer. */
export const SecurityDrawer: React.FC<ISecurityDrawerProps> = ({
  open,
  onOpenChange,
  title,
  description,
  locked,
  action,
  footer,
  onBack,
  compact,
  children,
}) => {
  const { t } = useTranslation('security');
  return (
    <AppDrawer
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      description={description}
      locked={locked}
      action={action}
      footer={footer}
      onBack={onBack}
      backLabel={t('common.back')}
      closeLabel={t('common.close')}
      size={compact ? 'auto' : 'full'}
      bodyClassName="px-0 pt-0"
    >
      {children}
    </AppDrawer>
  );
};

/** Big pill button (48px, thumb zone) – same as `<Button size="xl" fullWidth>`. */
export const BigButton: React.FC<React.ComponentProps<typeof Button>> = props => (
  <Button size="xl" fullWidth {...props} />
);

export const ErrorNote: React.FC<{ message: string | null | undefined; className?: string }> = ({
  message,
  className,
}) =>
  message ? (
    <p role="alert" className={cn('text-body leading-5 font-medium text-foreground', className)}>
      {message}
    </p>
  ) : null;

/** 6-digit code (e-mail / authenticator): big slots, numeric keyboard, one-time-code autofill. */
export const CodeField: React.FC<{
  value: string;
  onChange: (value: string) => void;
  onComplete?: (value: string) => void;
  disabled?: boolean;
  invalid?: boolean;
  label: string;
}> = ({ value, onChange, onComplete, disabled, invalid, label }) => (
  <InputOTP
    maxLength={6}
    value={value}
    onChange={onChange}
    onComplete={onComplete}
    disabled={disabled}
    inputMode="numeric"
    pattern="^[0-9]*$"
    autoComplete="one-time-code"
    aria-label={label}
    aria-invalid={invalid || undefined}
    containerClassName="justify-center"
  >
    <InputOTPGroup className="gap-2">
      {Array.from({ length: 6 }, (_, index) => (
        <InputOTPSlot
          key={index}
          index={index}
          className={cn(
            'h-14 w-12 rounded-xl border text-2xl font-bold first:rounded-xl last:rounded-xl sm:w-13',
            invalid && 'border-foreground ring-1 ring-foreground'
          )}
        />
      ))}
    </InputOTPGroup>
  </InputOTP>
);

/** Password input with show / hide (16px+ text, no iOS zoom). */
export const PasswordField: React.FC<
  Omit<React.ComponentProps<typeof Input>, 'type'> & {
    autoComplete: 'current-password' | 'new-password';
  }
> = ({ className, ...props }) => {
  const { t } = useTranslation('security');
  const [visible, setVisible] = useState(false);
  return (
    <div className="relative">
      <Input
        type={visible ? 'text' : 'password'}
        className={cn('h-12 rounded-full pr-12 pl-4 text-[17px]', className)}
        autoCapitalize="none"
        autoCorrect="off"
        spellCheck={false}
        {...props}
      />
      <Button
        type="button"
        variant="ghost"
        size="icon-lg"
        pill
        className="absolute top-1/2 right-1.5 -translate-y-1/2 text-muted-foreground"
        onClick={() => setVisible(value => !value)}
        aria-label={visible ? t('common.hidePassword') : t('common.showPassword')}
        title={visible ? t('common.hidePassword') : t('common.showPassword')}
      >
        {visible ? <EyeOff /> : <Eye />}
      </Button>
    </div>
  );
};

/** X-style settings row (icon | title + description | value | chevron). */
export const SecurityRow: React.FC<{
  icon: LucideIcon;
  title: string;
  description?: string;
  value?: React.ReactNode;
  onClick: () => void;
  destructive?: boolean;
}> = ({ icon: Icon, title, description, value, onClick, destructive }) => (
  <button
    type="button"
    onClick={onClick}
    className="group flex min-h-15 w-full items-center gap-4 border-b border-border/50 px-4 py-3 text-left transition-colors hover:bg-foreground/[0.03] focus-visible:bg-foreground/[0.05] focus-visible:outline-none active:bg-foreground/[0.06]"
  >
    <Icon
      aria-hidden="true"
      className={cn('size-5 shrink-0', destructive ? 'text-foreground' : 'text-muted-foreground')}
      strokeWidth={1.75}
    />
    <span className="min-w-0 flex-1">
      <span className={cn('block text-body leading-5 text-foreground', destructive && 'font-bold')}>
        {title}
      </span>
      {description && (
        <span className="mt-0.5 block truncate text-caption leading-4 text-muted-foreground">
          {description}
        </span>
      )}
    </span>
    {value !== undefined && value !== null && (
      <span className="shrink-0 text-caption text-muted-foreground">{value}</span>
    )}
    <ChevronRight
      aria-hidden="true"
      className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5"
    />
  </button>
);

/** Small inline explanation box (fine border, no colour). */
export const InfoBox: React.FC<{
  icon?: LucideIcon;
  children: React.ReactNode;
  className?: string;
}> = ({ icon: Icon, children, className }) => (
  <div
    className={cn(
      'flex gap-3 rounded-2xl border border-border/60 p-4 text-body leading-5',
      className
    )}
  >
    {Icon && <Icon aria-hidden="true" className="mt-0.5 size-5 shrink-0" strokeWidth={1.75} />}
    <div className="min-w-0 flex-1 text-muted-foreground">{children}</div>
  </div>
);
