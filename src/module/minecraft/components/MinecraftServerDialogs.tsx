import React from 'react';

import type { IMinecraftRunState, IMinecraftServer } from '../types';
import { BackupsDrawer } from './BackupsDrawer';
import { BroadcastDialog } from './BroadcastDialog';
import { GamerulesDialog } from './GamerulesDialog';
import { KickPlayerDialog } from './KickPlayerDialog';
import { MinecraftTerminal } from './MinecraftTerminal';
import { PlayersDrawer } from './PlayersDrawer';
import { WorldSettingsDialog } from './WorldSettingsDialog';

export type MinecraftDialog =
  | 'backups'
  | 'world'
  | 'rules'
  | 'broadcast'
  | 'terminal'
  | 'players';

/** Alle Dialoge/Drawer eines Servers; `dialog` ist der gerade offene, `kicking` ein Spielername. */
export const MinecraftServerDialogs: React.FC<{
  server: IMinecraftServer;
  state: IMinecraftRunState | undefined;
  dialog: MinecraftDialog | null;
  kicking: string | null;
  onClose: () => void;
  onKickClose: () => void;
}> = ({ server, state, dialog, kicking, onClose, onKickClose }) => {
  const { id, name } = server;
  const stopped = state === 'stopped' || state === 'crashed';
  return (
    <>
      {kicking && <KickPlayerDialog serverId={id} name={kicking} onClose={onKickClose} />}
      {dialog === 'broadcast' && <BroadcastDialog serverId={id} name={name} onClose={onClose} />}
      {dialog === 'rules' && <GamerulesDialog serverId={id} name={name} onClose={onClose} />}
      {dialog === 'world' && <WorldSettingsDialog serverId={id} name={name} onClose={onClose} />}
      <BackupsDrawer
        serverId={id}
        name={name}
        open={dialog === 'backups'}
        stopped={stopped}
        onOpenChange={open => !open && onClose()}
      />
      <PlayersDrawer
        server={{ id, name }}
        open={dialog === 'players'}
        onOpenChange={open => !open && onClose()}
      />
      <MinecraftTerminal
        serverId={id}
        name={name}
        open={dialog === 'terminal'}
        canSend={state === 'running' || state === 'starting'}
        onOpenChange={open => !open && onClose()}
      />
    </>
  );
};
