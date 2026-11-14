import { AppDrawer } from '@ui/patterns';
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@ui/shad-cn/components/empty.tsx';
import { Button } from '@ui/shad-cn/components/button.tsx';
import { Plus, Users } from 'lucide-react';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { AdminMinecraftApi } from '../api';
import { useMinecraftPasses } from '../hooks/use-minecraft-passes';
import type { IMinecraftPass } from '../types';
import { PassAddDialog } from './PassAddDialog';
import { PassDeleteDialog } from './PassDeleteDialog';
import { PassesTable } from './PassesTable';

/** Spielerpass: alle eingetragenen Gamertags, auf allen Servern sperren/entsperren oder löschen. */
export const PassesDrawer: React.FC<{ open: boolean; onOpenChange: (open: boolean) => void }> = ({
  open,
  onOpenChange,
}) => {
  const { t } = useTranslation('minecraft');
  const { passes, reload } = useMinecraftPasses(open);
  const [deleting, setDeleting] = useState<IMinecraftPass | null>(null);
  const [adding, setAdding] = useState(false);

  const toggleBlock = async (pass: IMinecraftPass) => {
    const result = await AdminMinecraftApi.blockPass(pass.id, pass.status !== 'blocked');
    if (result.success) void reload();
    else toast.error(t('action.error.unknown'));
  };

  return (
    <AppDrawer
      open={open}
      onOpenChange={onOpenChange}
      title={t('pass.title')}
      description={t('pass.description')}
      action={
        <Button
          variant="ghost"
          size="icon-md"
          aria-label={t('pass.add')}
          onClick={() => setAdding(true)}
        >
          <Plus />
        </Button>
      }
      contentProps={{ className: 'max-w-5xl' }}
    >
      {adding && <PassAddDialog onDone={() => void reload()} onClose={() => setAdding(false)} />}
      {deleting && (
        <PassDeleteDialog
          pass={deleting}
          onDone={() => void reload()}
          onClose={() => setDeleting(null)}
        />
      )}
      {passes && passes.length === 0 && (
        <Empty className="px-4 py-12">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Users />
            </EmptyMedia>
            <EmptyTitle>{t('pass.empty')}</EmptyTitle>
            <EmptyDescription>{t('pass.emptyText')}</EmptyDescription>
          </EmptyHeader>
        </Empty>
      )}
      {passes && passes.length > 0 && (
        <PassesTable
          passes={passes}
          onToggleBlock={pass => void toggleBlock(pass)}
          onDelete={setDeleting}
        />
      )}
    </AppDrawer>
  );
};
