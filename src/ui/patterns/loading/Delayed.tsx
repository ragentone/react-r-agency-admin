import { cn } from '@ui/lib/utils';
import React, { useEffect, useState } from 'react';

/**
 * Shows its children (usually a skeleton) only after `delay` ms – fast loads don't flash a
 * skeleton. Until then it keeps the space (`className`, e.g. a min height) and tells screen
 * readers that something is loading. Fades in, without animation on `prefers-reduced-motion`.
 */
export const Delayed: React.FC<{
  delay?: number;
  label?: string;
  className?: string;
  children: React.ReactNode;
}> = ({ delay = 300, label, className, children }) => {
  const [visible, setVisible] = useState(delay <= 0);

  useEffect(() => {
    if (delay <= 0) return;
    const timer = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div
      aria-busy="true"
      aria-live="polite"
      aria-label={label}
      className={cn(
        visible && 'motion-safe:animate-in motion-safe:fade-in motion-safe:duration-300',
        className
      )}
    >
      {visible ? children : null}
    </div>
  );
};
