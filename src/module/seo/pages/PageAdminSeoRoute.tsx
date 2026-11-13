import { RoleGate } from '@core/auth/roles/RoleGate.tsx';
import { AdminNoAccess } from '@module/admin/components/AdminNoAccess';
import { RoutePage } from '@router/components';
import { Link, useParams } from '@tanstack/react-router';
import { buttonVariants } from '@ui/shad-cn/components/button.tsx';
import { ArrowLeft } from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { ADMIN_SCROLL, ADMIN_WIDTH } from '../../admin/ui/AdminPage';
import { SeoRouteEditor } from '../components/SeoRouteEditor';
import { ADMIN_SEO_ROUTE, SEO_ADMIN_ROLES } from '../const';

/** `/admin/seo/new` and `/admin/seo/:routeId`: create / edit one entry (replaces the drawer). */
export const PageAdminSeoRoute: React.FC = () => {
  const { t } = useTranslation('seo');
  const { routeId } = useParams({ strict: false }) as { routeId?: string };
  return (
    <RoutePage
      width={ADMIN_WIDTH.base}
      scrollable={true}
      classes={{ scroll: ADMIN_SCROLL }}
      header={{
        title: routeId ? t('form.editTitle') : t('form.createTitle'),
        leading: (
          <Link
            to={ADMIN_SEO_ROUTE}
            aria-label={t('form.back')}
            className={buttonVariants({ variant: 'ghost', size: 'icon-lg', className: 'shrink-0' })}
          >
            <ArrowLeft className="size-5" />
          </Link>
        ),
      }}
    >
      <RoleGate roles={SEO_ADMIN_ROLES} fallback={<AdminNoAccess />}>
        <SeoRouteEditor routeId={routeId} />
      </RoleGate>
    </RoutePage>
  );
};
