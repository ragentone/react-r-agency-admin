import { useNavigate } from '@tanstack/react-router';
import { Button } from '@ui/shad-cn/components/button.tsx';
import { Skeleton } from '@ui/shad-cn/components/skeleton.tsx';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { AdminPage } from '../../admin/ui/AdminPage';
import { ADMIN_SEO_ROUTE } from '../const';
import { takePendingSeoPath } from '../seo.draft';
import { useSeoAdmin } from '../use.seo.admin';
import { useSeoSuggestions } from '../use.seo.suggestions';
import { SeoRouteForm } from './SeoRouteForm';

/** Body of `/admin/seo/new` and `/admin/seo/:routeId`: loads the SEO data, shows the form. */
export const SeoRouteEditor: React.FC<{ routeId?: string }> = ({ routeId }) => {
  const { t } = useTranslation('seo');
  const navigate = useNavigate();
  const admin = useSeoAdmin();
  const data = admin.data;
  const routes = useMemo(() => data?.routes ?? [], [data?.routes]);
  const suggestions = useSeoSuggestions(routes);
  // Read once: the form takes it as its start value.
  const initialPath = useMemo(() => (routeId ? undefined : takePendingSeoPath()), [routeId]);
  const back = () => void navigate({ to: ADMIN_SEO_ROUTE });
  const route = routeId ? (routes.find(item => item.id === routeId) ?? null) : null;

  if (!data && admin.loading) {
    return (
      <AdminPage slot="admin-seo-route">
        <Skeleton className="h-96 rounded-xl" />
      </AdminPage>
    );
  }
  if (!data || (routeId && !route)) {
    return (
      <AdminPage slot="admin-seo-route">
        <div role="alert" className="flex flex-col items-center gap-4 px-8 py-16 text-center">
          <p className="text-body text-muted-foreground">
            {data ? t('routes.notFound') : t('error.load')}
          </p>
          <Button variant="outline" onClick={data ? back : admin.retry}>
            {data ? t('form.back') : t('retry')}
          </Button>
        </div>
      </AdminPage>
    );
  }

  return (
    <AdminPage slot="admin-seo-route">
      <SeoRouteForm
        admin={admin}
        route={route}
        initialPath={initialPath}
        suggestions={suggestions}
        settings={data.settings}
        onDone={back}
      />
    </AdminPage>
  );
};
