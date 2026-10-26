import { Link } from '@tanstack/react-router';
import { cn } from '@ui/lib';
import { type ReactNode, useCallback, useEffect, useState } from 'react';

import type { IResolvedMenuEntry } from '../hooks';
import type { IMenuContext } from '../types.ts';

const tap = () => {
  try {
    navigator.vibrate?.(6);
  } catch {
    /* not supported */
  }
};

interface IMenuItemActionProps {
  item: IResolvedMenuEntry;
  ctx: IMenuContext;
  className?: string;
  children: ReactNode;
  label: string;
  onAfterSelect?: () => void;
}

/** Link (or button for `onSelect` entries) of one menu entry. */
export const MenuItemAction = ({
  item,
  ctx,
  className,
  children,
  label,
  onAfterSelect,
}: IMenuItemActionProps) => {
  const { entry, href, active } = item;

  if (entry.onSelect || !href) {
    return (
      <button
        type={'button'}
        aria-label={label}
        // Buttons center their text by default – links don't. Keep both identical.
        className={cn('text-left', className)}
        onClick={() => {
          tap();
          entry.onSelect?.(ctx);
          onAfterSelect?.();
        }}
      >
        {children}
      </button>
    );
  }

  return (
    <Link
      to={href as '/'}
      aria-label={label}
      aria-current={active ? 'page' : undefined}
      className={className}
      onClick={() => {
        tap();
        onAfterSelect?.();
      }}
    >
      {children}
    </Link>
  );
};

/** Icon of an entry (active state = `activeIcon` or a heavier stroke). */
export const MenuItemIcon = ({
  item,
  className,
}: {
  item: IResolvedMenuEntry;
  className?: string;
}) => {
  const Icon = (item.active && item.entry.activeIcon) || item.entry.icon;
  return (
    <Icon
      aria-hidden
      strokeWidth={item.active ? 2.5 : 1.75}
      className={cn('size-6 shrink-0 transition-[stroke-width]', className)}
    />
  );
};

type BadgeValue = number | string | null | undefined;

const NoBadge = (): BadgeValue => undefined;

const isEmpty = (value: BadgeValue) =>
  value === null || value === undefined || value === 0 || value === '';

interface IBadgeProps {
  item: IResolvedMenuEntry;
  variant?: 'pill' | 'dot';
  className?: string;
}

const BadgeView = ({
  value,
  variant = 'pill',
  className,
}: Omit<IBadgeProps, 'item'> & { value: BadgeValue }) => {
  if (isEmpty(value)) return null;
  const text = typeof value === 'number' && value > 99 ? '99+' : String(value);

  return (
    <span
      className={cn(
        'pointer-events-none inline-flex items-center justify-center rounded-full bg-foreground text-background font-semibold tabular-nums ring-2 ring-background',
        variant === 'dot'
          ? 'min-w-4 h-4 px-1 text-micro leading-none'
          : 'min-w-5 h-5 px-1.5 text-micro',
        className
      )}
    >
      {text}
    </span>
  );
};

/** Calls one child's `useBadge` hook and reports the value to the group (renders nothing). */
const BadgeProbe = ({
  id,
  useBadge,
  report,
}: {
  id: string;
  useBadge: () => BadgeValue;
  report: (id: string, value: BadgeValue) => void;
}) => {
  const value = useBadge();
  useEffect(() => report(id, value), [id, value, report]);
  useEffect(() => () => report(id, undefined), [id, report]);
  return null;
};

/**
 * Badge of a group: own `useBadge` value or – without one – the sum of the children's
 * numeric badges (a `•` when a child only has a text badge).
 */
const GroupBadge = ({ item, variant, className }: IBadgeProps) => {
  const [values, setValues] = useState<Record<string, BadgeValue>>({});
  const report = useCallback(
    (id: string, value: BadgeValue) =>
      setValues(prev => (prev[id] === value ? prev : { ...prev, [id]: value })),
    []
  );
  const probes = (item.children ?? []).filter(child => child.entry.useBadge);

  const filled = Object.values(values).filter(value => !isEmpty(value));
  const sum = filled.reduce<number>(
    (total, value) => total + (typeof value === 'number' ? value : 0),
    0
  );
  const value: BadgeValue = sum > 0 ? sum : filled.length ? '•' : undefined;

  return (
    <>
      {probes.map(child => (
        <BadgeProbe
          key={child.entry.id}
          id={child.entry.id}
          useBadge={child.entry.useBadge as () => BadgeValue}
          report={report}
        />
      ))}
      <BadgeView value={value} variant={variant} className={className} />
    </>
  );
};

const EntryBadge = ({ item, variant, className }: IBadgeProps) => {
  const useBadge = item.entry.useBadge ?? NoBadge;
  return <BadgeView value={useBadge()} variant={variant} className={className} />;
};

/**
 * Badge from the entry's `useBadge` hook (dot when used as `dot`). Groups without an own
 * `useBadge` show the summed badges of their children.
 */
export const MenuItemBadge = (props: IBadgeProps) =>
  !props.item.entry.useBadge && props.item.children?.some(child => child.entry.useBadge) ? (
    <GroupBadge {...props} />
  ) : (
    <EntryBadge {...props} />
  );
