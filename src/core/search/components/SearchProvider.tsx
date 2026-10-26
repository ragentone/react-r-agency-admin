import { type ReactNode, useEffect } from 'react';

import { useSearchUi } from '../store';
import { SearchDialog } from './SearchDialog';

const isTyping = (target: EventTarget | null) =>
  target instanceof HTMLElement &&
  Boolean(target.closest('input, textarea, select, [contenteditable="true"], [role="textbox"]'));

/** Renders the search dialog once + shortcuts: ⌘K / Ctrl+K anywhere, "/" outside of inputs. */
export const SearchProvider = ({ children }: { children: ReactNode }) => {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const { open, setOpen } = useSearchUi.getState();
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen(!open);
      } else if (e.key === '/' && !open && !e.metaKey && !e.ctrlKey && !isTyping(e.target)) {
        e.preventDefault();
        setOpen(true);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <>
      {children}
      <SearchDialog />
    </>
  );
};
