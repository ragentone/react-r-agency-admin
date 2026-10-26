import { RoutePage } from '@router/components';
import React from 'react';

import { RoadmapView } from '../components/RoadmapView';

/** `/roadmap`: public development page (roadmap + own tickets). */
export const PageRoadmap: React.FC = () => (
  <RoutePage width={620} scrollable={true} classes={{ scroll: 'p-0' }}>
    <RoadmapView />
  </RoutePage>
);
