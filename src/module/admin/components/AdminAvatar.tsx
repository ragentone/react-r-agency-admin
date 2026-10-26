import { cn } from '@ui/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@ui/shad-cn/components/avatar.tsx';
import React from 'react';

import type { IAdminUser } from '../types';
import { initials } from '../utils';

export const AdminAvatar: React.FC<{ user: IAdminUser; className?: string }> = ({
  user,
  className,
}) => (
  <Avatar className={cn('size-11', className)}>
    {user.avatarUrl && <AvatarImage src={user.avatarUrl} alt="" className="object-cover" />}
    <AvatarFallback className="bg-foreground/[0.08] text-sm font-bold">
      {initials(user.alias)}
    </AvatarFallback>
  </Avatar>
);
