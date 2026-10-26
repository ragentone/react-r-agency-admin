import { cn } from '@ui/lib/utils';
import { type KeyboardEvent, type PointerEvent, useRef } from 'react';

import type { Hsv } from '../types';

interface ColorPickerAreaProps {
  hsv: Hsv;
  onChange: (hsv: Hsv) => void;
  onChangeEnd: () => void;
  label: string;
  className?: string;
}

const clamp01 = (n: number) => Math.min(1, Math.max(0, n));

/** 2D field: x = saturation, y = brightness. Mouse, touch and arrow keys. */
export function ColorPickerArea({
  hsv,
  onChange,
  onChangeEnd,
  label,
  className,
}: ColorPickerAreaProps) {
  const ref = useRef<HTMLDivElement>(null);

  const update = (event: PointerEvent) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    const x = clamp01((event.clientX - rect.left) / rect.width);
    const y = clamp01((event.clientY - rect.top) / rect.height);
    onChange({ h: hsv.h, s: x * 100, v: (1 - y) * 100 });
  };

  const onKeyDown = (event: KeyboardEvent) => {
    const step = event.shiftKey ? 10 : 1;
    const moves: Record<string, [number, number]> = {
      ArrowLeft: [-step, 0],
      ArrowRight: [step, 0],
      ArrowUp: [0, step],
      ArrowDown: [0, -step],
    };
    const move = moves[event.key];
    if (!move) return;
    event.preventDefault();
    onChange({
      h: hsv.h,
      s: Math.min(100, Math.max(0, hsv.s + move[0])),
      v: Math.min(100, Math.max(0, hsv.v + move[1])),
    });
  };

  return (
    <div
      ref={ref}
      role="slider"
      tabIndex={0}
      aria-label={label}
      aria-valuetext={`${Math.round(hsv.s)}%, ${Math.round(hsv.v)}%`}
      aria-valuenow={Math.round(hsv.s)}
      onPointerDown={event => {
        event.currentTarget.setPointerCapture(event.pointerId);
        update(event);
      }}
      onPointerMove={event => {
        if (event.currentTarget.hasPointerCapture(event.pointerId)) update(event);
      }}
      onPointerUp={event => {
        event.currentTarget.releasePointerCapture(event.pointerId);
        onChangeEnd();
      }}
      onKeyDown={onKeyDown}
      onKeyUp={event => event.key.startsWith('Arrow') && onChangeEnd()}
      className={cn(
        'relative h-36 w-full cursor-crosshair touch-none rounded-md select-none',
        'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-popover focus-visible:outline-none',
        className
      )}
      style={{
        backgroundColor: `hsl(${hsv.h} 100% 50%)`,
        backgroundImage:
          'linear-gradient(to top, #000, transparent), linear-gradient(to right, #fff, transparent)',
      }}
    >
      <span
        className="pointer-events-none absolute size-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-[0_0_0_1px_rgb(0_0_0/0.3),0_1px_3px_rgb(0_0_0/0.4)]"
        style={{ left: `${hsv.s}%`, top: `${100 - hsv.v}%` }}
      />
    </div>
  );
}
