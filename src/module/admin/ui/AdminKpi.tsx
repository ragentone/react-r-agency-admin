import { cn } from '@ui/lib/utils';
import { Sparkline } from '@ui/patterns/chart';
import { Card } from '@ui/shad-cn/components/card.tsx';
import { ArrowDownRight, ArrowRight, ArrowUpRight } from 'lucide-react';
import React from 'react';

interface IAdminKpiProps {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  hint?: string;
  spark?: number[];
  /** Percent against the previous period (`undefined` = no comparison shown). */
  change?: number | null;
  changeLabel?: string;
  className?: string;
}

const ChangeArrow: React.FC<{ change?: number | null }> = ({ change }) => {
  if (change === null || change === undefined || Math.abs(change) < 1) {
    return <ArrowRight className="size-3" aria-hidden="true" />;
  }
  return change > 0 ? (
    <ArrowUpRight className="size-3" aria-hidden="true" />
  ) : (
    <ArrowDownRight className="size-3" aria-hidden="true" />
  );
};

/** Key figure card: label + icon tile on top, big number, change pill, sparkline at the bottom. */
export const AdminKpi: React.FC<IAdminKpiProps> = ({
  icon,
  label,
  value,
  hint,
  spark,
  change,
  changeLabel,
  className,
}) => {
  return (
    <Card
      className={cn('flex flex-col gap-3 rounded-xl border-border/50 p-4 shadow-none', className)}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="min-w-0 truncate text-caption font-medium text-muted-foreground">
          {label}
        </span>
        <span
          aria-hidden="true"
          className="grid size-8 shrink-0 place-items-center rounded-lg bg-muted text-foreground [&>svg]:size-4"
        >
          {icon}
        </span>
      </div>
      <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
        <span className="text-display font-bold tabular-nums">{value}</span>
        {change !== undefined && (
          <span
            aria-label={changeLabel}
            className="inline-flex items-center gap-0.5 rounded-md bg-muted px-1.5 py-0.5 text-micro font-semibold tabular-nums"
          >
            <ChangeArrow change={change} />
            {change === null ? '–' : `${change > 0 ? '+' : ''}${Math.round(change)} %`}
          </span>
        )}
      </div>
      {hint && <span className="-mt-2 text-micro text-muted-foreground">{hint}</span>}
      {spark && spark.length > 1 && <Sparkline values={spark} className="mt-auto" />}
    </Card>
  );
};
