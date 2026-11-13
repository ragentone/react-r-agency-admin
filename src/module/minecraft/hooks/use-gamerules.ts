import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { AdminMinecraftApi } from '../api';
import type { IMinecraftGamerules, MinecraftGamerule } from '../types';

/** Lädt die Spielregeln eines laufenden Servers und schaltet sie einzeln (mit Zurücksetzen bei Fehler). */
export function useGamerules(serverId: string) {
  const { t } = useTranslation('minecraft');
  const [rules, setRules] = useState<IMinecraftGamerules | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    void AdminMinecraftApi.gamerules(serverId).then(result => {
      if (!alive) return;
      if (result.success && result.rules) setRules(result.rules);
      else setError(result.error ?? 'unknown');
    });
    return () => {
      alive = false;
    };
  }, [serverId]);

  const toggle = async (name: MinecraftGamerule, value: boolean) => {
    const before = rules?.[name] ?? null;
    setPending(name);
    setRules(current => ({ ...current, [name]: value }));
    const result = await AdminMinecraftApi.setGamerule(serverId, name, value);
    setPending(null);
    if (result.success) return;
    setRules(current => ({ ...current, [name]: before }));
    toast.error(
      t(`action.error.${result.error ?? 'unknown'}`, { defaultValue: t('action.error.unknown') })
    );
  };

  return { rules, error, pending, toggle };
}
