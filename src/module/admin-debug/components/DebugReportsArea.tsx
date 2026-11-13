import React from 'react';

import { AdminPage } from '../../admin/ui/AdminPage';
import { AdminPanel } from '../../admin/ui/AdminPanel';
import { DebugReportsTable } from './DebugReportsTable';

/** `/admin/debug`: client debug reports from frontend and app. */
export const DebugReportsArea: React.FC = () => (
  <AdminPage slot="admin-debug">
    <AdminPanel flush={true}>
      <DebugReportsTable />
    </AdminPanel>
  </AdminPage>
);
