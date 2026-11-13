import { Button } from '@ui/shad-cn/components/button.tsx';
import { HardDriveDownload, Plus, Users } from 'lucide-react';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useMinecraftServers } from '../hooks/use-minecraft-servers';
import type { IMinecraftServer } from '../types';
import { BdsDialog } from './BdsDialog';
import { DeleteServerDialog } from './DeleteServerDialog';
import { MinecraftServerCard } from './MinecraftServerCard';
import { PassesDrawer } from './PassesDrawer';
import { ServerFormDialog } from './ServerFormDialog';

/** Liste aller Server (eine Karte je Server) mit Plus-Button zum Anlegen. */
export const MinecraftServerList: React.FC = () => {
  const { t } = useTranslation('minecraft');
  const { data: entries, reload, error } = useMinecraftServers();
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<IMinecraftServer | null>(null);
  const [deleting, setDeleting] = useState<IMinecraftServer | null>(null);
  const [passes, setPasses] = useState(false);
  const [bds, setBds] = useState(false);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-title font-bold">{t('list.title')}</h3>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon-lg"
            aria-label={t('bds.title')}
            onClick={() => setBds(true)}
          >
            <HardDriveDownload />
          </Button>
          <Button
            variant="outline"
            size="icon-lg"
            aria-label={t('pass.title')}
            onClick={() => setPasses(true)}
          >
            <Users />
          </Button>
          <Button
            size="icon-lg"
            aria-label={t('form.createTitle')}
            onClick={() => setCreating(true)}
          >
            <Plus />
          </Button>
        </div>
      </div>
      {error && <p className="text-caption text-destructive">{t('list.error')}</p>}
      {entries?.length === 0 && (
        <p className="text-caption text-muted-foreground">{t('list.empty')}</p>
      )}
      {entries?.map(entry => (
        <MinecraftServerCard
          key={entry.server.id}
          entry={entry}
          onChanged={reload}
          onEdit={() => setEditing(entry.server)}
          onDelete={() => setDeleting(entry.server)}
        />
      ))}
      {bds && <BdsDialog onClose={() => setBds(false)} />}
      <PassesDrawer open={passes} onOpenChange={setPasses} />
      {creating && <ServerFormDialog onSaved={reload} onClose={() => setCreating(false)} />}
      {editing && (
        <ServerFormDialog server={editing} onSaved={reload} onClose={() => setEditing(null)} />
      )}
      {deleting && (
        <DeleteServerDialog
          server={deleting}
          onDeleted={reload}
          onClose={() => setDeleting(null)}
        />
      )}
    </div>
  );
};
