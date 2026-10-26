import { cn } from '@ui/lib/utils';
import { type KeyboardEvent, type PointerEvent, useRef } from 'react';

interface ColorPickerHueProps {
  hue: number;
  onChange: (hue: number) => void;
  onChangeEnd: () => void;
  label: string;
  className?: string;
}

const HUE_GRADIENT =
  'linear-gradient(to right, #f00 0%, #ff0 16.66%, #0f0 33.33%, #0ff 50%, #00f 66.66%, #f0f 83.33%, #f00 100%)';

export function ColorPickerHue({
  hue,
  onChange,
  onChangeEnd,
  label,
  className,
}: ColorPickerHueProps) {
  const ref = useRef<HTMLDivElement>(null);

  const update = (event: PointerEvent) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    const x = Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width));
    onChange(Math.min(359.9, x * 360));
  };

  const onKeyDown = (event: KeyboardEvent) => {
    const step = event.shiftKey ? 15 : 1;
    const delta = { ArrowLeft: -step, ArrowDown: -step, ArrowRight: step, ArrowUp: step }[
      event.key
    ];
    if (delta === undefined) return;
    event.preventDefault();
    onChange((hue + delta + 360) % 360);
  };

  return (
    <div
      ref={ref}
      role="slider"
      tabIndex={0}
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={360}
      aria-valuenow={Math.round(hue)}
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
        'relative h-3 w-full cursor-pointer touch-none rounded-full select-none pointer-coarse:h-4',
        'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-popover focus-visible:outline-none',
        className
      )}
      style={{ backgroundImage: HUE_GRADIENT }}
    >
      <span
        className="pointer-events-none absolute top-1/2 size-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-[0_0_0_1px_rgb(0_0_0/0.3),0_1px_3px_rgb(0_0_0/0.4)] pointer-coarse:size-5"
        style={{ left: `${(hue / 360) * 100}%`, backgroundColor: `hsl(${hue} 100% 50%)` }}
      />
    </div>
  );
}
