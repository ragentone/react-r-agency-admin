import { AppDrawer } from '@ui/patterns';
import { Badge } from '@ui/shad-cn/components/badge.tsx';
import { Button } from '@ui/shad-cn/components/button.tsx';
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@ui/shad-cn/components/empty.tsx';
import { Ban, CircleCheck, Trash2, Users } from 'lucide-react';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { AdminMinecraftApi } from '../api';
import { useMinecraftPasses } from '../hooks/use-minecraft-passes';
import type { IMinecraftPass } from '../types';
import { PassDeleteDialog } from './PassDeleteDialog';

/** Spielerpass: alle eingetragenen Gamertags, auf allen Servern sperren/entsperren oder löschen. */
export const PassesDrawer: React.FC<{ open: boolean; onOpenChange: (open: boolean) => void }> = ({
  open,
  onOpenChange,
}) => {
  const { t } = useTranslation('minecraft');
  const { passes, reload } = useMinecraftPasses(open);
  const [deleting, setDeleting] = useState<IMinecraftPass | null>(null);

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
      contentProps={{ className: 'max-w-5xl' }}
    >
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
      <ul className="flex flex-col">
        {(passes ?? []).map(pass => (
          <li
            key={pass.id}
            className="flex items-center gap-2 border-t border-border/50 py-2 first:border-t-0"
          >
            <div className="min-w-0 flex-1">
              <p className="text-body font-medium">{pass.gamertag}</p>
              <p className="text-caption text-muted-foreground">
                {pass.alias} ·{' '}
                {pass.lastSeenAt ? new Date(pass.lastSeenAt).toLocaleString() : t('pass.never')}
              </p>
            </div>
            <Badge variant={pass.status === 'active' ? 'default' : 'secondary'}>
              {t(`pass.status.${pass.status}`)}
            </Badge>
            <Button
              variant="outline"
              size="icon-md"
              aria-label={pass.status === 'blocked' ? t('pass.unblock') : t('pass.block')}
              onClick={() => void toggleBlock(pass)}
            >
              {pass.status === 'blocked' ? <CircleCheck /> : <Ban />}
            </Button>
            <Button
              variant="ghost"
              size="icon-md"
              aria-label={t('pass.delete')}
              onClick={() => setDeleting(pass)}
            >
              <Trash2 />
            </Button>
          </li>
        ))}
      </ul>
    </AppDrawer>
  );
};
