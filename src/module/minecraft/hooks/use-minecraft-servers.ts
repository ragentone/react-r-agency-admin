import { useStatsQuery } from '../../admin/stats/hooks/use.stats.query';
import { AdminMinecraftApi } from '../api';
import { ADMIN_MINECRAFT_POLL_MS } from '../const';

/** Alle Server mit Status, reloaded alle paar Sekunden solange der Tab sichtbar ist. */
export const useMinecraftServers = () =>
  useStatsQuery(
    () => AdminMinecraftApi.servers(),
    result => result.servers,
    'minecraft-servers',
    ADMIN_MINECRAFT_POLL_MS
  );
