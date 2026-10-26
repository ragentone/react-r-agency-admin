import { RoutePage } from '@router/components';
import React from 'react';

import { DevArea } from '../components/DevArea';

/** `/developer`: dev area (todos + user tickets) as a normal page. */
export const PageDev: React.FC = () => (
  <RoutePage width={620} scrollable={true} classes={{ scroll: 'p-0' }}>
    <DevArea />
  </RoutePage>
);
