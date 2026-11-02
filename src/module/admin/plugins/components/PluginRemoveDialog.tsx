import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@ui/shad-cn/components/alert-dialog.tsx';
import React from 'react';
import { useTranslation } from 'react-i18next';

import type { IPluginListItem } from '../types';

interface IPluginRemoveDialogProps {
  plugin: IPluginListItem | null;
  busy: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (plugin: IPluginListItem) => void;
}

/** Confirmation before a plugin is deleted. Deletion is final, so it is always asked for. */
export const PluginRemoveDialog: React.FC<IPluginRemoveDialogProps> = ({
  plugin,
  busy,
  onOpenChange,
  onConfirm,
}) => {
  const { t } = useTranslation('admin');

  return (
    <AlertDialog open={plugin !== null} onOpenChange={open => !busy && onOpenChange(open)}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {t('plugins.remove.title', { name: plugin?.name ?? '' })}
          </AlertDialogTitle>
          <AlertDialogDescription>{t('plugins.remove.description')}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={busy}>{t('plugins.remove.cancel')}</AlertDialogCancel>
          <AlertDialogAction
            disabled={busy}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/85"
            onClick={event => {
              event.preventDefault();
              if (plugin) onConfirm(plugin);
            }}
          >
            {busy ? t('plugins.remove.busy') : t('plugins.remove.confirm')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
