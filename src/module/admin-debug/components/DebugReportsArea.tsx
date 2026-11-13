import React from 'react';

import { DebugReportsTable } from './DebugReportsTable';

/** `/admin/debug`: client debug reports from frontend and app. */
export const DebugReportsArea: React.FC = () => (
  <div data-slot="admin-debug" className="mx-auto flex min-h-dvh w-full flex-col bg-background">
    <DebugReportsTable />
  </div>
);
