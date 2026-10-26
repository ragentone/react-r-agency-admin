import { Button } from '@ui/shad-cn/components/button.tsx';
import React from 'react';

import { AppDrawer, type IAppDrawerProps } from './AppDrawer.tsx';

export interface IAppFormDrawerProps extends Omit<IAppDrawerProps, 'wrapper'> {
  /** Called on submit (button, Enter). With Formik: `formik.submitForm`. */
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  /** Without a label there is no submit button (e.g. read-only step). */
  submitLabel?: string;
  /** Saving: spinner on the button, drawer is locked. */
  busy?: boolean;
  submitDisabled?: boolean;
  /**
   * `header` = small pill top right like „Posten“ on X (compose: posts, comments).
   * `footer` = big black button in the thumb zone (forms with several fields).
   */
  submitPlacement?: 'header' | 'footer';
  /**
   * Left of the submit button in the footer (e.g. „Löschen“). Only with `footer` placement.
   * `footer` (from `AppDrawer`) is rendered above the button row, or alone with `header` placement.
   */
  secondaryAction?: React.ReactNode;
}

/** `AppDrawer` with a `<form>`: Enter submits, double submits are blocked. */
export const AppFormDrawer: React.FC<IAppFormDrawerProps> = ({
  onSubmit,
  submitLabel,
  busy = false,
  submitDisabled = false,
  submitPlacement = 'footer',
  secondaryAction,
  locked,
  action,
  footer,
  ...rest
}) => {
  const blocked = submitDisabled || busy;

  const submit = submitLabel ? (
    <Button
      type="submit"
      size={submitPlacement === 'header' ? 'md' : 'xl'}
      fullWidth={submitPlacement === 'footer' && !secondaryAction}
      className={submitPlacement === 'footer' && secondaryAction ? 'flex-1' : undefined}
      disabled={submitDisabled && !busy}
      isLoading={busy}
    >
      {submitLabel}
    </Button>
  ) : null;

  return (
    <AppDrawer
      {...rest}
      locked={locked || busy}
      action={
        submitPlacement === 'header' ? (
          <>
            {action}
            {submit}
          </>
        ) : (
          action
        )
      }
      footer={
        submitPlacement === 'footer' && (submit || secondaryAction) ? (
          <div className="space-y-3">
            {footer}
            <div className="flex items-center gap-2">
              {secondaryAction}
              {submit}
            </div>
          </div>
        ) : (
          footer
        )
      }
      wrapper={children => (
        <form
          className="flex min-h-0 flex-1 flex-col"
          noValidate
          onSubmit={event => {
            event.preventDefault();
            if (!blocked) onSubmit(event);
          }}
        >
          {children}
        </form>
      )}
    />
  );
};
