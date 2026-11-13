import { RoleGate } from '@core/auth/roles/RoleGate.tsx';
import { AdminNoAccess } from '@module/admin/components/AdminNoAccess';
import { RoutePage } from '@router/components';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { ADMIN_SCROLL, ADMIN_WIDTH } from '../../admin/ui/AdminPage';
import { SeoArea } from '../components/SeoArea';
import { SEO_ADMIN_ROLES } from '../const';

/** `/admin/seo`: meta data per path, site defaults, sitemap (own chunk). */
export const PageAdminSeo: React.FC = () => {
  const { t } = useTranslation('seo');
  return (
    <RoutePage
      width={ADMIN_WIDTH.base}
      scrollable={true}
      classes={{ scroll: ADMIN_SCROLL }}
      header={{ title: t('title'), description: t('subtitle') }}
    >
      <RoleGate roles={SEO_ADMIN_ROLES} fallback={<AdminNoAccess />}>
        <SeoArea />
      </RoleGate>
    </RoutePage>
  );
};
