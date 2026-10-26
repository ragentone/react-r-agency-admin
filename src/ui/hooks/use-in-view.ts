import { useEffect, useRef, useState } from 'react';

const VIEWPORT_ATTRIBUTE = 'data-in-view';

export interface IViewReturn {
  registerElement: (element: HTMLDivElement) => void;
  destroy(): void;
  isInView: boolean;
  viewed: number;
  entry: IntersectionObserverEntry | undefined;
  scrollToView(): void;
}

export interface IViewOptions {
  onInView?: (element: HTMLDivElement) => void;
  onNotInView?: (element: HTMLDivElement) => void;
  delay?: number;
  once?: boolean;
  observerOptions?: IntersectionObserverInit;
  scrollBehavior?: ScrollBehavior;
}

export const useInView = (options: IViewOptions = {}): IViewReturn => {
  const [isInView, setIsInView] = useState(false);
  const [viewed, setViewed] = useState<number>(0);
  const [entry, setEntry] = useState<IntersectionObserverEntry | undefined>(undefined);

  const ref = useRef<HTMLDivElement | null>(null);
  const observer = useRef<IntersectionObserver | undefined>(undefined);
  const onChangeDebounce = useRef<number>(0);

  const onChange = (inView: boolean) => {
    clearTimeout(onChangeDebounce.current);
    onChangeDebounce.current = setTimeout(() => {
      if (!ref.current) return;
      if (inView) {
        ref.current?.setAttribute(VIEWPORT_ATTRIBUTE, 'true');
        options.onInView?.(ref.current);
        console.log('in view');
        setIsInView(true);
        if (options.once) {
          unsubscribe();
        }
        setViewed(prev => prev + 1);
      } else {
        ref.current?.setAttribute(VIEWPORT_ATTRIBUTE, 'false');
        options.onNotInView?.(ref.current);
        console.log('not in view');
        setIsInView(false);
      }
    }, options.delay ?? 0);
  };

  const subscribe = () => {
    if (!observer.current) {
      observer.current = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          setEntry(entry);
          onChange(entry.isIntersecting);
        });
      }, options.observerOptions);
    }
    observer.current.observe(ref.current!);
  };

  const unsubscribe = () => {
    ref.current?.removeAttribute(VIEWPORT_ATTRIBUTE);
    observer.current?.unobserve(ref.current!);
    observer.current?.disconnect();
  };

  const registerElement = (element: HTMLDivElement) => {
    if (ref.current) return;
    ref.current = element;
    ref.current?.setAttribute(VIEWPORT_ATTRIBUTE, 'false');
    subscribe();
  };

  const destroy = () => {
    unsubscribe();
    ref.current = null;
  };

  const scrollToView = () => {
    ref.current?.scrollIntoView({ behavior: options.scrollBehavior });
  };

  useEffect(() => {
    return () => unsubscribe();
  }, []);

  return { registerElement, destroy, isInView, viewed, entry, scrollToView };
};
