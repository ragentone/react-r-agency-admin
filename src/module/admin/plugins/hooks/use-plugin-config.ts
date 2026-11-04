import { useCallback, useEffect, useMemo, useState } from 'react';

import { PluginApi } from '../api';
import { defaultsOf, withValue } from '../config.utils';
import type {
  IPluginConfigError,
  IPluginConfigField,
  PluginConfigPrimitive,
  PluginConfigValues,
} from '../types';

/** Last schema load. `key` identifies the request, so a retry or another plugin never shows stale data. */
interface IConfigRemote {
  key: string;
  fields: IPluginConfigField[];
  error: string | null;
}

/**
 * Loads schema and global values while the drawer is open, keeps the edited draft,
 * and stores it. Nothing is written unless the backend accepts all values.
 */
export const usePluginConfig = (pluginId: string, open: boolean) => {
  const [attempt, setAttempt] = useState(0);
  const requestKey = `${pluginId}:${attempt}`;
  const [remote, setRemote] = useState<IConfigRemote | null>(null);
  const [saved, setSaved] = useState<PluginConfigValues>({});
  const [draft, setDraft] = useState<PluginConfigValues>({});
  const [errors, setErrors] = useState<IPluginConfigError[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    let active = true;
    void PluginApi.configGet(pluginId).then(result => {
      if (!active) return;
      const values = result.values ?? {};
      setRemote({
        key: requestKey,
        fields: result.fields ?? [],
        error: result.success ? null : (result.error ?? 'unknown'),
      });
      setSaved(values);
      setDraft(values);
      setErrors([]);
    });
    return () => {
      active = false;
    };
  }, [open, pluginId, requestKey]);

  const current = remote?.key === requestKey ? remote : null;
  const fields = useMemo(() => current?.fields ?? [], [current]);
  const loading = open && current === null;
  const loadError = current?.error ?? null;
  const dirty = useMemo(() => JSON.stringify(draft) !== JSON.stringify(saved), [draft, saved]);

  const setValue = useCallback((key: string, value: PluginConfigPrimitive | undefined) => {
    setDraft(currentDraft => withValue(currentDraft, key, value));
    setErrors(currentErrors => currentErrors.filter(error => error.key !== key));
  }, []);

  const resetAll = useCallback(() => {
    setDraft(defaultsOf(fields));
    setErrors([]);
  }, [fields]);

  const save = useCallback(async (): Promise<boolean> => {
    setSaving(true);
    const result = await PluginApi.configSet(pluginId, draft);
    setSaving(false);
    if (result.success) {
      const values = result.values ?? draft;
      setSaved(values);
      setDraft(values);
      setErrors([]);
      return true;
    }
    setErrors(result.errors ?? [{ key: '', code: result.error ?? 'unknown' }]);
    return false;
  }, [draft, pluginId]);

  const retry = useCallback(() => setAttempt(count => count + 1), []);

  return {
    loading,
    loadError,
    fields,
    draft,
    dirty,
    errors,
    saving,
    setValue,
    resetAll,
    save,
    retry,
  };
};

export type PluginConfig = ReturnType<typeof usePluginConfig>;
