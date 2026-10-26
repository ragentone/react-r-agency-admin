import { RoutePage } from '@router/components';
import { useParams } from '@tanstack/react-router';
import React from 'react';

import { SitePageView } from '../components/SitePageView';

/**
 * `/p/$slug`: public dynamic page (created in the admin area). Full page width – the blocks
 * keep their own reading column, banners span edge to edge.
 */
export const PageSite: React.FC = () => {
  const { slug } = useParams({ strict: false }) as { slug?: string };
  return (
    <RoutePage width="100%" scrollable={true} classes={{ scroll: 'p-0 sm:border-x-0' }}>
      <SitePageView key={slug} slug={slug ?? ''} />
    </RoutePage>
  );
};
