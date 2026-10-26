/**
 * Back-closable dialog root. The logic (dialog stack, history blocker, hooks) lives in
 * `back-close.core.ts` – module state there survives a hot reload of this component.
 */
import React, { useCallback, useState } from 'react';

import { BackCloseIdContext, useBackClose } from './back-close.core.ts';

export interface IBackCloseRootProps<Details = unknown> {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean, details: Details) => void;
  /** Default true – false for dialogs whose state lives in the URL. */
  backClose?: boolean;
}

/**
 * Turns a dialog root into a back-closable one (works controlled and uncontrolled).
 * Renders `render(open, onOpenChange)` inside the id context for the content.
 */
export function BackCloseRoot<Details>({
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  backClose = true,
  render,
}: IBackCloseRootProps<Details> & {
  render: (
    open: boolean,
    onOpenChange: (open: boolean, details: Details) => void
  ) => React.ReactNode;
}) {
  const [innerOpen, setInnerOpen] = useState(defaultOpen);
  const controlled = openProp !== undefined;
  const open = controlled ? openProp : innerOpen;

  const handleOpenChange = useCallback(
    (next: boolean, details: Details) => {
      if (!controlled) setInnerOpen(next);
      onOpenChange?.(next, details);
    },
    [controlled, onOpenChange]
  );

  const id = useBackClose(open, () => handleOpenChange(false, undefined as Details), backClose);

  return (
    <BackCloseIdContext.Provider value={backClose ? id : undefined}>
      {render(open, handleOpenChange)}
    </BackCloseIdContext.Provider>
  );
}
