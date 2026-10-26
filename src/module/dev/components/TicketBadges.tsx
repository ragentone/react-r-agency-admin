import { cn } from '@ui/lib/utils';
import { Bug, CheckCircle2, Clock, Lightbulb, Sparkles, XCircle } from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next';

import type { TicketStatus, TicketType } from '../types';

const TYPE_ICON = { bug: Bug, feature: Sparkles, idea: Lightbulb } as const;
const STATUS_ICON = { pending: Clock, accepted: CheckCircle2, rejected: XCircle } as const;

const badge = 'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-micro font-semibold';

export const TicketTypeBadge: React.FC<{ type: TicketType }> = ({ type }) => {
  const { t } = useTranslation('dev');
  const Icon = TYPE_ICON[type] ?? Lightbulb;
  return (
    <span className={cn(badge, 'bg-foreground/[0.06] text-foreground')}>
      <Icon className="size-3" aria-hidden="true" />
      {t(`ticket.type.${type}`)}
    </span>
  );
};

export const TicketStatusBadge: React.FC<{ status: TicketStatus }> = ({ status }) => {
  const { t } = useTranslation('dev');
  const Icon = STATUS_ICON[status] ?? Clock;
  return (
    <span
      className={cn(
        badge,
        status === 'accepted' && 'bg-foreground text-background',
        status === 'rejected' && 'bg-destructive/15 text-destructive',
        status === 'pending' && 'bg-foreground/[0.06] text-muted-foreground'
      )}
    >
      <Icon className="size-3" aria-hidden="true" />
      {t(`ticket.status.${status}`)}
    </span>
  );
};
