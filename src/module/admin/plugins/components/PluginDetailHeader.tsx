import { Link } from '@tanstack/react-router';
import { ArrowLeft } from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { ADMIN_PLUGINS_ROUTE } from '../../const';

interface IPluginDetailHeaderProps {
  name?: string;
  pluginId?: string;
}

/** Sticky header of a plugin page: back to the list, name and id. */
export const PluginDetailHeader: React.FC<IPluginDetailHeaderProps> = ({ name, pluginId }) => {
  const { t } = useTranslation('admin');

  return (
    <header className="sticky top-0 z-10 flex h-14 items-center gap-2 border-b border-border bg-background/80 px-2 backdrop-blur">
      <Link
        to={ADMIN_PLUGINS_ROUTE}
        aria-label={t('plugins.details.back')}
        className="inline-flex size-11 shrink-0 items-center justify-center rounded-md transition-colors hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
      >
        <ArrowLeft className="size-5" />
      </Link>
      <div className="min-w-0 flex-1">
        <h1 className="truncate text-title font-bold text-foreground">{name ?? ''}</h1>
        {pluginId && <p className="truncate font-mono text-caption text-muted-foreground">{pluginId}</p>}
      </div>
    </header>
  );
};
