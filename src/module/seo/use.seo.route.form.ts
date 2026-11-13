import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import {
  SEO_DESCRIPTION_MAX,
  SEO_JSON_LD_MAX,
  SEO_PATH_MAX,
  SEO_PATH_PATTERN,
  SEO_TITLE_MAX,
  SEO_URL_MAX,
} from './const';
import type { ISeoRoute, ISeoRouteValues, ISeoSaveResult } from './types';

const EMPTY: ISeoRouteValues = {
  path: '',
  title: '',
  description: '',
  image: '',
  index: true,
  inSitemap: true,
  changefreq: 'weekly',
  priority: 0.5,
  schemaType: 'WebPage',
  jsonLd: '',
};

const toValues = (route: ISeoRoute | null, path?: string): ISeoRouteValues =>
  route
    ? { ...route, jsonLd: route.jsonLd ? JSON.stringify(route.jsonLd, null, 2) : '' }
    : { ...EMPTY, path: path ?? '' };

export type SeoRouteErrors = Partial<Record<keyof ISeoRouteValues, string>>;

interface IOptions {
  route: ISeoRoute | null;
  initialPath?: string;
  takenPaths: string[];
  onSave: (id: string | null, values: ISeoRouteValues) => Promise<ISeoSaveResult<ISeoRoute>>;
  onDelete: (id: string) => Promise<ISeoSaveResult<true>>;
  /** Called after a successful save / delete (the page goes back to the list). */
  onDone: () => void;
}

/** Form state of one SEO entry: values, validation, save and delete. */
export const useSeoRouteForm = ({
  route,
  initialPath,
  takenPaths,
  onSave,
  onDelete,
  onDone,
}: IOptions) => {
  const { t } = useTranslation('seo');
  const [values, setValues] = useState<ISeoRouteValues>(() => toValues(route, initialPath));
  const [touched, setTouched] = useState(false);
  const [serverErrors, setServerErrors] = useState<SeoRouteErrors>({});
  const [serverError, setServerError] = useState<string | null>(null);

  const set = <K extends keyof ISeoRouteValues>(key: K, value: ISeoRouteValues[K]) => {
    setValues(prev => ({ ...prev, [key]: value }));
    setServerErrors(prev => ({ ...prev, [key]: undefined }));
    setServerError(null);
  };

  const errors = useMemo<SeoRouteErrors>(() => {
    const result: SeoRouteErrors = {};
    const path = values.path.trim();
    if (!path) result.path = t('form.errors.pathRequired');
    else if (path.length > SEO_PATH_MAX || !SEO_PATH_PATTERN.test(path)) {
      result.path = t('form.errors.pathInvalid');
    } else if (takenPaths.includes(path.replace(/(.)\/$/, '$1'))) {
      result.path = t('error.path_exists');
    }
    if (values.title.length > SEO_TITLE_MAX) result.title = t('error.title_too_long');
    if (values.description.length > SEO_DESCRIPTION_MAX) {
      result.description = t('error.description_too_long');
    }
    const image = values.image.trim();
    if (image && (image.length > SEO_URL_MAX || !/^(https?:\/\/|\/(?!\/))/i.test(image))) {
      result.image = t('error.url_invalid');
    }
    if (values.jsonLd.trim()) {
      try {
        const parsed: unknown = JSON.parse(values.jsonLd);
        if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
          result.jsonLd = t('error.json_ld_invalid');
        } else if (JSON.stringify(parsed).length > SEO_JSON_LD_MAX) {
          result.jsonLd = t('error.json_ld_too_long');
        }
      } catch {
        result.jsonLd = t('error.json_ld_invalid');
      }
    }
    return result;
  }, [values, takenPaths, t]);

  const shown = (key: keyof ISeoRouteValues) =>
    serverErrors[key] ??
    (touched || key === 'jsonLd' || key === 'title' || key === 'description'
      ? errors[key]
      : undefined);

  const submit = async () => {
    setTouched(true);
    if (Object.values(errors).some(Boolean)) return;
    const result = await onSave(route?.id ?? null, {
      ...values,
      path: values.path.trim(),
      title: values.title.trim(),
      description: values.description.trim(),
      image: values.image.trim(),
    });
    if (result.ok) {
      toast.success(
        route ? t('toast.saved', { path: values.path }) : t('toast.created', { path: values.path })
      );
      onDone();
      return;
    }
    const message = t(result.error ?? 'error.unknown');
    if (result.field) setServerErrors({ [result.field]: message });
    else setServerError(message);
  };

  const remove = async () => {
    if (!route) return false;
    const result = await onDelete(route.id);
    if (!result.ok) {
      toast.error(t(result.error ?? 'error.unknown'));
      return false;
    }
    toast.success(t('toast.deleted', { path: route.path }));
    onDone();
    return true;
  };

  return { values, set, shown, serverError, setTouched, submit, remove };
};

export type SeoRouteForm = ReturnType<typeof useSeoRouteForm>;
