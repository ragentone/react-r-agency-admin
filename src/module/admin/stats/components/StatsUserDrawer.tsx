import React, { useEffect, useState } from 'react';

import { AdminUserDrawer } from '../../components/AdminUserDrawer';
import { useAdminRoleUpdate, useAdminUser } from '../../hooks';

/** Opens the normal admin user drawer (roles, ban, activity) for a user from the statistics. */
export const StatsUserDrawer: React.FC<{
  userId: string | null;
  onClose: () => void;
}> = ({ userId, onClose }) => {
  const { user, setUser, load } = useAdminUser();
  const { saving, update } = useAdminRoleUpdate();
  // Last opened user: keeps the content while the drawer closes.
  const [shownId, setShownId] = useState(userId);
  if (userId && userId !== shownId) setShownId(userId);

  useEffect(() => {
    if (userId) void load(userId);
  }, [userId, load]);

  return (
    <AdminUserDrawer
      open={Boolean(userId)}
      onOpenChange={next => {
        if (!next) onClose();
      }}
      user={user && user.id === shownId ? user : null}
      saving={saving}
      onUpdate={update}
      onChanged={setUser}
      initialTab="activity"
    />
  );
};
