import { refreshSeoConfig } from '@core/seo/store';
import { useCallback, useEffect, useState } from 'react';

import { SeoAdminApi } from './api';
import type { ISeoOverview, ISeoRouteValues, ISeoSettingsValues } from './types';

const byPath = (a: { path: string }, b: { path: string }) => a.path.localeCompare(b.path);

/**
 * State of `/admin/seo`: loads everything once, keeps it in sync after saves and tells the
 * head (`SeoManager`) to reload, so changes show up on the site right away.
 */
export const useSeoAdmin = () => {
  const [data, setData] = useState<ISeoOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [saving, setSaving] = useState(false);
  const [building, setBuilding] = useState(false);

  // Request counter: a retry starts a new load, the effect re-runs and owns the result.
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let cancelled = false;
    void SeoAdminApi.overview().then(result => {
      if (cancelled) return;
      setLoading(false);
      setError(!result.ok);
      if (result.ok && result.data) setData(result.data);
    });
    return () => {
      cancelled = true;
    };
  }, [tick]);

  const retry = useCallback(() => {
    setLoading(true);
    setError(false);
    setTick(value => value + 1);
  }, []);

  /** Sitemap follows every change in the runtime – reload its status a moment later. */
  const reloadSitemap = useCallback(() => {
    setTimeout(async () => {
      const result = await SeoAdminApi.overview();
      if (result.ok && result.data) {
        setData(prev => (prev ? { ...prev, sitemap: result.data!.sitemap } : result.data!));
      }
    }, 800);
  }, []);

  const saveRoute = useCallback(
    async (id: string | null, values: ISeoRouteValues) => {
      setSaving(true);
      const result = await SeoAdminApi.saveRoute(id, values);
      setSaving(false);
      if (result.ok && result.data) {
        const route = result.data;
        setData(prev =>
          prev
            ? {
                ...prev,
                routes: [...prev.routes.filter(item => item.id !== route.id), route].sort(byPath),
              }
            : prev
        );
        refreshSeoConfig();
        reloadSitemap();
      }
      return result;
    },
    [reloadSitemap]
  );

  const deleteRoute = useCallback(
    async (id: string) => {
      setSaving(true);
      const result = await SeoAdminApi.deleteRoute(id);
      setSaving(false);
      if (result.ok) {
        setData(prev =>
          prev ? { ...prev, routes: prev.routes.filter(item => item.id !== id) } : prev
        );
        refreshSeoConfig();
        reloadSitemap();
      }
      return result;
    },
    [reloadSitemap]
  );

  const saveSettings = useCallback(
    async (values: ISeoSettingsValues) => {
      setSaving(true);
      const result = await SeoAdminApi.saveSettings(values);
      setSaving(false);
      if (result.ok && result.data) {
        const settings = result.data;
        setData(prev => (prev ? { ...prev, settings } : prev));
        refreshSeoConfig();
        reloadSitemap();
      }
      return result;
    },
    [reloadSitemap]
  );

  const rebuildSitemap = useCallback(async () => {
    setBuilding(true);
    const result = await SeoAdminApi.sitemap();
    setBuilding(false);
    if (result.data) {
      const sitemap = result.data;
      setData(prev => (prev ? { ...prev, sitemap } : prev));
    }
    return result;
  }, []);

  return {
    data,
    loading,
    error,
    saving,
    building,
    retry,
    saveRoute,
    deleteRoute,
    saveSettings,
    rebuildSitemap,
  };
};

export type SeoAdmin = ReturnType<typeof useSeoAdmin>;
