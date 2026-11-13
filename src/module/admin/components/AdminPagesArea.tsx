import React from 'react';

import { AdminPagesView } from './AdminPagesView';

/** `/admin/pages`: dynamic pages (list, create, edit, delete) – separate from user management. */
export const AdminPagesArea: React.FC = () => (
  <div data-slot="admin-pages" className="mx-auto flex min-h-dvh w-full flex-col bg-background">
    <div className="flex-1">
      <AdminPagesView />
    </div>
  </div>
);
