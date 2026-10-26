import { RoleGate } from '@core/auth/roles/RoleGate.tsx';
import { AdminNoAccess } from '@module/admin/components/AdminNoAccess';
import { RoutePage } from '@router/components';
import React from 'react';

import { SeoArea } from '../components/SeoArea';
import { SEO_ADMIN_ROLES } from '../const';

/** `/admin/seo`: meta data per path, site defaults, sitemap (own chunk). */
export const PageAdminSeo: React.FC = () => (
  <RoutePage width={900} scrollable={true} classes={{ scroll: 'p-0' }}>
    <RoleGate roles={SEO_ADMIN_ROLES} fallback={<AdminNoAccess />}>
      <SeoArea />
    </RoleGate>
  </RoutePage>
);
