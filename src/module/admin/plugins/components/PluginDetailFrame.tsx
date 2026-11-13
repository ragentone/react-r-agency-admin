import { RoutePage } from '@router/components';
import { Link } from '@tanstack/react-router';
import { buttonVariants } from '@ui/shad-cn/components/button.tsx';
import { ArrowLeft } from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { ADMIN_PLUGINS_ROUTE } from '../../const';
import { ADMIN_SCROLL, ADMIN_WIDTH } from '../../ui/AdminPage';

interface IPluginDetailFrameProps {
  name?: string;
  pluginId?: string;
  /** Actions at the right edge of the route page header, e.g. the plugin action menu. */
  actions?: React.ReactNode;
  children?: React.ReactNode;
}

/** Route page of one plugin: route page header with back link, name, id and actions. */
export const PluginDetailFrame: React.FC<IPluginDetailFrameProps> = ({
  name,
  pluginId,
  actions,
  children,
}) => {
  const { t } = useTranslation('admin');

  return (
    <RoutePage
      width={ADMIN_WIDTH.narrow}
      scrollable={true}
      classes={{ scroll: ADMIN_SCROLL }}
      header={{
        title: name ?? '',
        description: pluginId,
        leading: (
          <Link
            to={ADMIN_PLUGINS_ROUTE}
            aria-label={t('plugins.details.back')}
            className={buttonVariants({ variant: 'ghost', size: 'icon-lg', className: 'shrink-0' })}
          >
            <ArrowLeft className="size-5" />
          </Link>
        ),
        actions,
      }}
    >
      {children}
    </RoutePage>
  );
};
