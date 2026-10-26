import { useApp } from '@core/app';
import { useRouterState } from '@tanstack/react-router';
import { ArrowUp, Check } from 'lucide-react';
import { useEffect, useState } from 'react';

import { DockButton } from './DockButton.tsx';

/** Up to this scroll offset (px) the page counts as "at the very top". */
const TOP_OFFSET = 4;

/** `true` while the page content (any scroll container outside dialogs) is at the very top. */
const useAtTop = () => {
  const pathname = useRouterState({ select: state => state.location.pathname });
  const [atTop, setAtTop] = useState(true);
  const [lastPath, setLastPath] = useState(pathname);

  // New page starts at the top.
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setAtTop(true);
  }

  useEffect(() => {
    const onScroll = (event: Event) => {
      const target = event.target;
      const el =
        target === document || target === window
          ? document.scrollingElement
          : target instanceof Element
            ? target
            : null;
      if (!el || el.closest('[role="dialog"], [role="alertdialog"]')) return;
      setAtTop(el.scrollTop <= TOP_OFFSET);
    };
    document.addEventListener('scroll', onScroll, { capture: true, passive: true });
    return () => document.removeEventListener('scroll', onScroll, { capture: true });
  }, []);

  return atTop;
};

/**
 * "Back to top" in the dock (registered in `core.tsx`, always last on the right).
 * Always visible: arrow while scrolled down, check mark when the page is at the very top.
 * Scrolls via `useApp().layout.content.scrollTop`.
 */
const DockScrollTopButton = () => {
  const {
    layout: {
      content: { scrollTop },
    },
  } = useApp();
  const atTop = useAtTop();

  return (
    <DockButton
      entry={{
        id: 'scroll-top',
        label: atTop ? 'layout:scrollTop.atTop' : 'layout:scrollTop.label',
        icon: atTop ? Check : ArrowUp,
        onClick: () => scrollTop(true),
      }}
    />
  );
};

export { DockScrollTopButton };
