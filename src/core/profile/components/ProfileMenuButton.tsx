import { PluginSlot, usePluginSlot } from '@core/plugin';
import { AppDrawer } from '@ui/patterns';
import { Button } from '@ui/shad-cn/components/button';
import { MoreHorizontal } from 'lucide-react';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

export interface IProfileMenuButtonProps {
  /** Passed to the plugin components of `profile.menu` as `context`. */
  context: unknown;
}

/** "⋯" button in the profile header. Opens a drawer with the `profile.menu` plugin entries; hidden when no plugin adds one. */
export const ProfileMenuButton: React.FC<IProfileMenuButtonProps> = ({ context }) => {
  const { t } = useTranslation('profile');
  const [open, setOpen] = useState(false);
  const entries = usePluginSlot('profile.menu');
  if (entries.length === 0) return null;
  return (
    <>
      <Button variant="ghost" size="icon-lg" onClick={() => setOpen(true)} aria-label={t('menu.open')}>
        <MoreHorizontal className="size-5" />
      </Button>
      <AppDrawer open={open} onOpenChange={setOpen} title={t('menu.title')} size="auto">
        <PluginSlot name="profile.menu" className="flex flex-col gap-1 p-4" context={context} />
      </AppDrawer>
    </>
  );
};
