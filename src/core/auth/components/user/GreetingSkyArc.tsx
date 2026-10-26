import { cn } from '@ui/lib';
import { animate, motion, useMotionValue, useReducedMotion, useTransform } from 'framer-motion';
import { useEffect } from 'react';

const CX = 100;
const CY = 100;
const R = 86;
const ARC = `M ${CX - R} ${CY} A ${R} ${R} 0 0 1 ${CX + R} ${CY}`;

const STARS = [
  [34, 30, 1.2],
  [62, 14, 0.9],
  [150, 22, 1.1],
  [176, 48, 0.8],
  [118, 8, 0.7],
  [20, 62, 0.8],
] as const;

interface IProps {
  /** Daylight (sun, 6–18 h) or night (moon). */
  day: boolean;
  /** 0 = rise (left) … 1 = set (right). */
  progress: number;
  className?: string;
}

/**
 * Monochrome sky arc: dashed track, travelled path and the sun / moon at the current position.
 * Animates from sunrise to "now" on mount.
 */
const GreetingSkyArc = ({ day, progress, className }: IProps) => {
  const reduceMotion = useReducedMotion();
  const t = useMotionValue(reduceMotion ? progress : 0);

  useEffect(() => {
    if (reduceMotion) {
      t.set(progress);
      return;
    }
    const controls = animate(t, progress, { duration: 1.6, delay: 0.25, ease: [0.22, 1, 0.36, 1] });
    return () => controls.stop();
  }, [progress, reduceMotion, t]);

  // CSS transforms on SVG elements use user units → x / y map 1:1 to the viewBox.
  const x = useTransform(t, value => CX + R * Math.cos(Math.PI * (1 - value)));
  const y = useTransform(t, value => CY - R * Math.sin(Math.PI * (1 - value)));

  return (
    <svg
      viewBox={'0 0 200 112'}
      aria-hidden
      className={cn('pointer-events-none overflow-visible text-foreground', className)}
    >
      {/* Stars at night */}
      {!day &&
        STARS.map(([x, y, r], i) => (
          <motion.circle
            key={i}
            cx={x}
            cy={y}
            r={r}
            fill={'currentColor'}
            initial={{ opacity: 0 }}
            animate={reduceMotion ? { opacity: 0.35 } : { opacity: [0.15, 0.55, 0.15] }}
            transition={
              reduceMotion ? undefined : { duration: 3 + i * 0.4, repeat: Infinity, delay: i * 0.3 }
            }
          />
        ))}

      {/* Track + travelled part */}
      <path
        d={ARC}
        fill={'none'}
        stroke={'currentColor'}
        strokeOpacity={0.14}
        strokeWidth={1.25}
        strokeDasharray={'2 5'}
        strokeLinecap={'round'}
      />
      <motion.path
        d={ARC}
        fill={'none'}
        stroke={'currentColor'}
        strokeOpacity={0.45}
        strokeWidth={1.5}
        strokeLinecap={'round'}
        style={{ pathLength: t }}
      />

      {/* Horizon */}
      <line x1={0} x2={200} y1={CY} y2={CY} stroke={'currentColor'} strokeOpacity={0.12} />
      {[CX - R, CX, CX + R].map(x => (
        <line
          key={x}
          x1={x}
          x2={x}
          y1={CY - 3}
          y2={CY + 3}
          stroke={'currentColor'}
          strokeOpacity={0.25}
        />
      ))}

      {/* Sun / moon */}
      <motion.g style={{ x, y }}>
        <motion.circle
          r={14}
          fill={'currentColor'}
          initial={{ opacity: 0.08, scale: 1 }}
          animate={reduceMotion ? undefined : { opacity: [0.1, 0.02, 0.1], scale: [1, 1.5, 1] }}
          transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
        />
        {day ? (
          <>
            {Array.from({ length: 8 }, (_, i) => {
              const a = (i * Math.PI) / 4;
              return (
                <line
                  key={i}
                  x1={Math.cos(a) * 9}
                  y1={Math.sin(a) * 9}
                  x2={Math.cos(a) * 12}
                  y2={Math.sin(a) * 12}
                  stroke={'currentColor'}
                  strokeWidth={1.5}
                  strokeLinecap={'round'}
                />
              );
            })}
            <circle r={6} fill={'currentColor'} />
          </>
        ) : (
          <>
            <circle r={7} fill={'currentColor'} />
            <circle cx={3.5} cy={-2.5} r={6} fill={'var(--color-background)'} />
          </>
        )}
      </motion.g>
    </svg>
  );
};

export { GreetingSkyArc };
