import { RoleGate } from '@core/auth/roles/RoleGate.tsx';
import { RoutePage } from '@router/components';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { AdminNoAccess } from '../../admin/components/AdminNoAccess';
import { ADMIN_SCROLL, ADMIN_WIDTH } from '../../admin/ui/AdminPage';
import { ShopArea } from '../components/ShopArea';
import { ADMIN_SHOP_ROLES } from '../const';

/** `/admin/shop`: requests (CRM), offers and settings of the one shop (own chunk). */
export const PageAdminShop: React.FC = () => {
  const { t } = useTranslation('admin-shop');
  return (
    <RoutePage
      width={ADMIN_WIDTH.base}
      scrollable={true}
      classes={{ scroll: ADMIN_SCROLL }}
      header={{ title: t('title'), description: t('subtitle') }}
    >
      <RoleGate roles={ADMIN_SHOP_ROLES} fallback={<AdminNoAccess />}>
        <ShopArea />
      </RoleGate>
    </RoutePage>
  );
};
