import { useEffect, useMemo, useRef, useState } from 'react';

export interface ILayoutContent {
  mounted: boolean;
  setElement: (el: HTMLDivElement | null) => void;
  scrollTop: (smooth?: boolean) => void;
}

const useLayoutContent = () => {
  const [mounted, setMounted] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);

  const setElement = (el: HTMLDivElement | null) => {
    elementRef.current = el;
  };

  const scrollTop = (smooth: boolean = false) => {
    if (!elementRef.current) return;
    elementRef.current.scrollTo({ top: 0, behavior: smooth ? 'smooth' : 'auto' });
  };

  useEffect(() => {
    const init = () => {
      setMounted(true);
    };
    init();
    return () => setMounted(false);
  }, []);

  return useMemo<ILayoutContent>(() => {
    return {
      mounted,
      setElement,
      scrollTop,
    };
  }, [mounted]);
};

export { useLayoutContent };
