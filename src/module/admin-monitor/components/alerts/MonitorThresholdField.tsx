import {
  NumberInput,
  NumberInputDecrement,
  NumberInputGroup,
  NumberInputIncrement,
  NumberInputInput,
} from '@ui/shad-cn/components/number-input.tsx';
import React from 'react';

/** One warn / crit / minutes number field with label. */
export const MonitorThresholdField: React.FC<{
  label: string;
  value: number;
  min: number;
  max: number;
  disabled: boolean;
  onChange: (value: number) => void;
}> = ({ label, value, min, max, disabled, onChange }) => (
  <label className="flex items-center justify-between gap-3 sm:flex-col sm:items-stretch sm:gap-1">
    <span className="text-caption text-muted-foreground">{label}</span>
    <NumberInput
      className="w-40 sm:w-full"
      value={String(value)}
      min={min}
      max={max}
      disabled={disabled}
      onValueChange={details => onChange(details.valueAsNumber)}
    >
      <NumberInputGroup>
        <NumberInputDecrement />
        <NumberInputInput size="sm" />
        <NumberInputIncrement />
      </NumberInputGroup>
    </NumberInput>
  </label>
);
