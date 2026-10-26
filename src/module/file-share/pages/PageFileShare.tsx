import { RoutePage } from '@router/components';
import React from 'react';

import { FileShareView } from '../components/FileShareView';

/** `/files`: download area (everyone), upload / edit for `admin:user`. */
export const PageFileShare: React.FC = () => (
  <RoutePage width={620} scrollable={true} classes={{ scroll: 'p-0' }}>
    <FileShareView />
  </RoutePage>
);
