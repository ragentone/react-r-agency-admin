import { cn } from '@ui/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@ui/shad-cn/components/avatar.tsx';
import React from 'react';

import type { ICreditUser } from '../types.ts';
import { initialsOf } from '../utils.ts';

export const CreditsAvatar: React.FC<{
  user: Pick<ICreditUser, 'alias' | 'avatarUrl'> | null;
  className?: string;
}> = ({ user, className }) => (
  <Avatar className={cn('size-10 shrink-0', className)}>
    {user?.avatarUrl && (
      <AvatarImage src={user.avatarUrl} alt={user.alias} className="object-cover" />
    )}
    <AvatarFallback className="bg-foreground/[0.08] text-[0.8em] font-semibold text-foreground">
      {initialsOf(user?.alias ?? '')}
    </AvatarFallback>
  </Avatar>
);
