import { useEffect, useRef, useState } from 'react';

type Element = HTMLInputElement | HTMLTextAreaElement | null;
type Value = string | undefined | null;

interface IOptions {
  toViewOnFocus?: boolean;
  scrollMarginTop?: number;
  watch?: {
    focus?: boolean;
    change?: boolean;
    keyDown?: boolean;
  };
  onChange?: (value: Value) => void;
  onEnter?: (value: Value) => void;
}

export const useInput = (options: IOptions = {}) => {
  const input = useRef<Element>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const typingDebounce = useRef<number>(0);

  const registerInput = (el: Element) => {
    if (!el || input.current) return;
    input.current = el;
    subscribe();
  };

  const onFocus = () => {
    if (options.toViewOnFocus) {
      input.current?.scrollIntoView({ behavior: 'smooth' });
    }
    setIsFocused(true);
  };

  const onBlur = () => {
    setIsFocused(false);
  };

  const onChange = () => {
    clearTimeout(typingDebounce.current);
    typingDebounce.current = setTimeout(() => {
      setIsTyping(false);
    }, 500);
    setIsTyping(true);
    options.onChange?.(input.current?.value);
  };

  const onKeyDown = (event: Event) => {
    const { key } = event as KeyboardEvent;
    if (key === 'Enter') {
      options.onEnter?.(input.current?.value);
    }
  };

  const subscribe = () => {
    if (options.scrollMarginTop) {
      input.current?.style.setProperty('scroll-margin-top', `${options.scrollMarginTop + 16}px`);
    }
    if (options.watch?.focus) {
      input.current?.addEventListener('focus', onFocus);
      input.current?.addEventListener('blur', onBlur);
    }
    if (options.watch?.change) {
      input.current?.addEventListener('input', onChange);
    }
    if (options.watch?.keyDown) {
      input.current?.addEventListener('keydown', onKeyDown);
    }
  };

  const unsubscribe = () => {
    if (options.scrollMarginTop) {
      input.current?.style.removeProperty('scroll-margin-top');
    }
    if (options.watch?.focus) {
      input.current?.removeEventListener('focus', onFocus);
      input.current?.removeEventListener('blur', onBlur);
    }
    if (options.watch?.change) {
      input.current?.removeEventListener('input', onChange);
    }
    if (options.watch?.keyDown) {
      input.current?.removeEventListener('keydown', onKeyDown);
    }
  };

  useEffect(() => {
    return () => {
      unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { registerInput, isFocused, isTyping };
};
