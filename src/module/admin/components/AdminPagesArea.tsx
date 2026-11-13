import React from 'react';

import { AdminPage } from '../ui/AdminPage';
import { AdminPanel } from '../ui/AdminPanel';
import { AdminPagesView } from './AdminPagesView';

/** `/admin/pages`: dynamic pages (list, create, edit, delete) – separate from user management. */
export const AdminPagesArea: React.FC = () => (
  <AdminPage slot="admin-pages">
    <AdminPanel flush={true}>
      <AdminPagesView />
    </AdminPanel>
  </AdminPage>
);
