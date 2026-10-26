import { motion, useReducedMotion } from 'framer-motion';
import React from 'react';

/** Three bouncing dots in a grey bubble (the friend is typing). */
export const MessengerTypingBubble: React.FC<{ label: string }> = ({ label }) => {
  const reduceMotion = useReducedMotion();
  return (
    <div
      role="status"
      aria-label={label}
      className="flex h-9 items-center gap-1 rounded-[18px] bg-foreground/[0.07] px-3.5"
    >
      {[0, 0.15, 0.3].map(delay => (
        <motion.span
          key={delay}
          className="size-2 rounded-full bg-foreground/45"
          animate={reduceMotion ? undefined : { y: [0, -4, 0], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 0.9, delay, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}
    </div>
  );
};
