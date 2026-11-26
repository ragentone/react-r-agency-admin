import { Input } from '@ui/shad-cn/components/input.tsx';
import { Switch } from '@ui/shad-cn/components/switch.tsx';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { SITE_PAGE_MENU_ORDER_MAX, SITE_PAGE_MENU_ORDER_MIN } from '../const';
import type { ISitePageValues } from '../types';
import { PageAccessField } from './PageAccessField';
import { PageDisplayModeField } from './PageDisplayModeField';

export interface IPageVisibilityFieldsProps {
  values: ISitePageValues;
  saving: boolean;
  menuOrderError: string | null;
  set: <K extends keyof ISitePageValues>(key: K, value: ISitePageValues[K]) => void;
  /** Access / display mode: patch several values and mark the form as changed. */
  patch: (patch: Partial<ISitePageValues>) => void;
}

/** "Visibility" tab: access, display mode, published, menu entry. */
export const PageVisibilityFields: React.FC<IPageVisibilityFieldsProps> = ({
  values,
  saving,
  menuOrderError,
  set,
  patch,
}) => {
  const { t } = useTranslation('admin');
  return (
    <>
      <PageAccessField
        visibility={values.visibility}
        roles={values.roles}
        onChange={(visibility, roles) => patch({ visibility, roles })}
        disabled={saving}
      />

      <PageDisplayModeField
        value={values.displayMode}
        onChange={displayMode => patch({ displayMode })}
        disabled={saving}
      />

      <label
        htmlFor="admin-page-published"
        className="flex cursor-pointer items-center gap-4 rounded-xl border border-border/50 px-3 py-3"
      >
        <span className="min-w-0 flex-1">
          <span className="block text-body font-semibold text-foreground">
            {t('pages.form.published')}
          </span>
          <span className="mt-0.5 block text-caption text-muted-foreground">
            {t('pages.form.publishedHint')}
          </span>
        </span>
        <Switch
          id="admin-page-published"
          checked={values.published}
          onCheckedChange={checked => set('published', checked)}
          disabled={saving}
        />
      </label>

      <div className="rounded-xl border border-border/50">
        <label
          htmlFor="admin-page-menu"
          className="flex cursor-pointer items-center gap-4 px-3 py-3"
        >
          <span className="min-w-0 flex-1">
            <span className="block text-body font-semibold text-foreground">
              {t('pages.form.showInMenu')}
            </span>
            <span className="mt-0.5 block text-caption text-muted-foreground">
              {values.published
                ? t('pages.form.showInMenuHint')
                : t('pages.form.showInMenuDraftHint')}
            </span>
          </span>
          <Switch
            id="admin-page-menu"
            checked={values.showInMenu}
            onCheckedChange={checked => set('showInMenu', checked)}
            disabled={saving}
          />
        </label>
        {values.showInMenu && (
          <div className="flex items-center gap-4 border-t border-border/50 px-3 py-2.5">
            <label
              htmlFor="admin-page-menu-order"
              className="min-w-0 flex-1 text-caption text-muted-foreground"
            >
              {t('pages.form.menuOrder')}
            </label>
            <Input
              id="admin-page-menu-order"
              type="number"
              inputMode="numeric"
              step={1}
              min={SITE_PAGE_MENU_ORDER_MIN}
              max={SITE_PAGE_MENU_ORDER_MAX}
              value={Number.isNaN(values.menuOrder) ? '' : values.menuOrder}
              onChange={e => set('menuOrder', e.target.value === '' ? 0 : Number(e.target.value))}
              disabled={saving}
              aria-invalid={Boolean(menuOrderError)}
              className="h-10 w-24 rounded-lg text-right text-base tabular-nums sm:text-body"
            />
          </div>
        )}
        {menuOrderError && (
          <p role="alert" className="px-3 pb-2.5 text-caption text-destructive">
            {menuOrderError}
          </p>
        )}
      </div>
    </>
  );
};
