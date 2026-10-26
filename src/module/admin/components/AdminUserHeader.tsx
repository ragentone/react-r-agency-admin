import React from 'react';

import type { IAdminUser } from '../types';
import { AdminAvatar } from './AdminAvatar';
import { AdminUserBadges } from './AdminUserBadges';

export const AdminUserHeader: React.FC<{ user: IAdminUser; as?: 'h1' | 'h2' }> = ({
  user,
  as: Heading = 'h2',
}) => (
  <div className="flex items-center gap-3">
    <AdminAvatar user={user} className="size-14" />
    <div className="min-w-0 flex-1">
      <Heading className="truncate text-title font-bold">{user.alias}</Heading>
      <p className="truncate text-caption text-muted-foreground">{user.email}</p>
      <div className="mt-1">
        <AdminUserBadges user={user} />
      </div>
    </div>
  </div>
);
