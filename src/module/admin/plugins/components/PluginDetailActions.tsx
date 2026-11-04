import { Button } from '@ui/shad-cn/components/button.tsx';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@ui/shad-cn/components/dropdown-menu.tsx';
import {
  Database,
  Download,
  EllipsisVertical,
  Hammer,
  RefreshCw,
  Rocket,
  Settings2,
  Trash2,
} from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next';

import type { PluginDetail } from '../hooks/use-plugin-detail';
import type { IPluginListItem } from '../types';

interface IPluginDetailActionsProps {
  plugin: IPluginListItem;
  detail: PluginDetail;
  onDeploy: () => void;
  onRemove: () => void;
  onPurge: () => void;
  onConfig: () => void;
}

/**
 * Plugin actions in a dropdown at the top right of the page header. Development actions first,
 * destructive actions last and only for inactive plugins.
 */
export const PluginDetailActions: React.FC<IPluginDetailActionsProps> = ({
  plugin,
  detail,
  onDeploy,
  onRemove,
  onPurge,
  onConfig,
}) => {
  const { t } = useTranslation('admin');
  const canDelete = !detail.active;

  return (
    <>
      <Button
        variant="ghost"
        size="icon-lg"
        disabled={detail.busy}
        aria-label={t('plugins.details.config')}
        onClick={onConfig}
      >
        <Settings2 className="size-5" />
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon-lg" aria-label={t('plugins.details.more')}>
            <EllipsisVertical className="size-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-56">
          {plugin.development && (
            <DropdownMenuItem disabled={detail.busy} onSelect={onDeploy}>
              <Rocket />
              {t('plugins.details.deploy')}
            </DropdownMenuItem>
          )}
          {plugin.development && (
            <DropdownMenuItem disabled={detail.busy} onSelect={() => void detail.build()}>
              <Hammer />
              {t('plugins.details.build')}
            </DropdownMenuItem>
          )}
          {plugin.development && (
            <DropdownMenuItem disabled={detail.busy} onSelect={() => void detail.build()}>
              <RefreshCw />
              {t('plugins.details.reinstall')}
            </DropdownMenuItem>
          )}
          <DropdownMenuItem disabled={detail.busy} onSelect={() => void detail.download()}>
            <Download />
            {t('plugins.details.download')}
          </DropdownMenuItem>

          {canDelete && <DropdownMenuSeparator />}
          {canDelete && (
            <DropdownMenuItem variant="destructive" disabled={detail.busy} onSelect={onPurge}>
              <Database />
              {t('plugins.purge.button')}
            </DropdownMenuItem>
          )}
          {canDelete && (
            <DropdownMenuItem variant="destructive" disabled={detail.busy} onSelect={onRemove}>
              <Trash2 />
              {t('plugins.details.remove')}
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};
