import { Label } from '@ui/shad-cn/components/label.tsx';
import React from 'react';

/** Label (+ optional counter) above, hint or error below – same rhythm for every field. */
export const SeoField: React.FC<{
  id: string;
  label: string;
  hint?: React.ReactNode;
  error?: string | null;
  aside?: React.ReactNode;
  children: React.ReactNode;
}> = ({ id, label, hint, error, aside, children }) => (
  <div>
    <div className="mb-1.5 flex items-center justify-between gap-3">
      <Label htmlFor={id} className="text-caption font-medium text-foreground">
        {label}
      </Label>
      {aside}
    </div>
    {children}
    {error ? (
      <p id={`${id}-error`} role="alert" className="mt-1.5 text-caption text-destructive">
        {error}
      </p>
    ) : hint ? (
      <p id={`${id}-hint`} className="mt-1.5 text-caption text-muted-foreground">
        {hint}
      </p>
    ) : null}
  </div>
);

/** Switch row: title + hint left, switch right; whole row is the hit area. */
export const SeoSwitchRow: React.FC<{
  id: string;
  title: string;
  hint?: string;
  children: React.ReactNode;
}> = ({ id, title, hint, children }) => (
  <label
    htmlFor={id}
    className="flex min-h-14 cursor-pointer items-center gap-4 px-3 py-3 has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-60"
  >
    <span className="min-w-0 flex-1">
      <span className="block text-body font-semibold text-foreground">{title}</span>
      {hint && <span className="mt-0.5 block text-caption text-muted-foreground">{hint}</span>}
    </span>
    {children}
  </label>
);
