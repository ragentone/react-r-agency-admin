import { cn } from '@ui/lib/utils';
import React, { useMemo } from 'react';
import { encode } from 'uqr';

export interface IQrCodeProps {
  /** Text / URL in the code (e.g. an `otpauth://` link). */
  value: string;
  /** Screen reader text – the code itself carries no readable text. */
  label: string;
  /** Error correction (`M` default; `L` = smaller code, `H` = more robust). */
  ecc?: 'L' | 'M' | 'Q' | 'H';
  className?: string;
}

/** Quiet zone in modules – scanners need a light border around the code. */
const QUIET = 2;

/**
 * QR code as a crisp SVG (one path, scales with the container).
 * Always black on white, also in dark mode: many scanners cannot read inverted codes.
 */
export const QrCode: React.FC<IQrCodeProps> = ({ value, label, ecc = 'M', className }) => {
  const { path, size } = useMemo(() => {
    const qr = encode(value, { ecc, border: 0 });
    let d = '';
    qr.data.forEach((row, y) =>
      row.forEach((dark, x) => {
        if (dark) d += `M${x + QUIET} ${y + QUIET}h1v1h-1z`;
      })
    );
    return { path: d, size: qr.size + QUIET * 2 };
  }, [value, ecc]);

  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      role="img"
      aria-label={label}
      shapeRendering="crispEdges"
      className={cn('block aspect-square rounded-xl bg-white', className)}
    >
      <path d={path} fill="#000" />
    </svg>
  );
};
