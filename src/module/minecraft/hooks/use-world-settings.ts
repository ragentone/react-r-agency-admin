import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { AdminMinecraftApi } from '../api';
import type { IMinecraftWorldSettings } from '../types';

/** Lädt die Welt-Einstellungen eines Servers und speichert Änderungen (Zahlen als Text im Feld). */
export const useWorldSettings = (serverId: string, onDone: () => void) => {
  const { t } = useTranslation('minecraft');
  const [draft, setDraft] = useState<IMinecraftWorldSettings | null>(null);
  const [view, setView] = useState('');
  const [tick, setTick] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let alive = true;
    void AdminMinecraftApi.worldSettings(serverId).then(result => {
      if (!alive) return;
      setLoading(false);
      if (!result.success || !result.settings) return setError(result.error ?? 'unknown');
      setDraft(result.settings);
      setView(String(result.settings.viewDistance));
      setTick(String(result.settings.tickDistance));
    });
    return () => {
      alive = false;
    };
  }, [serverId]);

  const save = async () => {
    if (!draft) return;
    setBusy(true);
    const next = { ...draft, viewDistance: Number(view), tickDistance: Number(tick) };
    const result = await AdminMinecraftApi.saveWorldSettings(serverId, next);
    setBusy(false);
    if (!result.success) {
      return void toast.error(
        t(`action.error.${result.error ?? 'unknown'}`, { defaultValue: t('action.error.unknown') })
      );
    }
    toast.success(t('world.done'));
    if (result.restartRequired) toast.info(t('form.restartHint'));
    onDone();
  };

  const patch = (change: Partial<IMinecraftWorldSettings>) =>
    setDraft(current => (current ? { ...current, ...change } : current));

  return { draft, view, tick, setView, setTick, loading, error, busy, save, patch };
};
