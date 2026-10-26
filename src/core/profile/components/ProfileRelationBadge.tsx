import { cn } from '@ui/lib/utils';
import { Ban, Check, Clock, UserPlus } from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next';

import type { IUserProfileRelation } from '../types';

export interface IProfileRelationBadgeProps {
  relation: IUserProfileRelation | null | undefined;
  /** Owner of the profile – to tell incoming from outgoing requests. */
  profileUserId: string;
  className?: string;
}

/** Read-only relation state between the viewer and the profile owner. */
export const ProfileRelationBadge: React.FC<IProfileRelationBadgeProps> = ({
  relation,
  profileUserId,
  className,
}) => {
  const { t } = useTranslation('profile');
  const status = relation?.status;
  if (!status || status === 'rejected') return null;

  const incoming = relation?.requestBy === profileUserId;
  const {
    icon: Icon,
    label,
    solid,
  } = status === 'accepted'
    ? { icon: Check, label: t('relation.accepted'), solid: true }
    : status === 'blocked'
      ? { icon: Ban, label: t('relation.blocked'), solid: false }
      : incoming
        ? { icon: UserPlus, label: t('relation.pendingIn'), solid: false }
        : { icon: Clock, label: t('relation.pendingOut'), solid: false };

  return (
    <span
      data-slot="profile-relation"
      className={cn(
        'inline-flex h-6 items-center gap-1 rounded-full px-2.5 text-xs font-medium',
        solid ? 'bg-foreground text-background' : 'border border-border/50 text-muted-foreground',
        className
      )}
    >
      <Icon className="size-3" aria-hidden="true" />
      {label}
    </span>
  );
};
