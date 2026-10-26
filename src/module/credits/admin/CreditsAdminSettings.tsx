import { cn } from '@ui/lib/utils';
import { Skeleton } from '@ui/shad-cn/components/skeleton.tsx';
import { Switch } from '@ui/shad-cn/components/switch.tsx';
import { Loader2, RotateCcw } from 'lucide-react';
import React, { type ReactNode, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { creditsFocus, creditsIconButton } from '../components/credits.classes.ts';
import { CreditsErrorState } from '../components/CreditsUi.tsx';
import { useCreditsStore } from '../store.ts';
import type { ICreditAdminSettings, ICreditGlobalSettings, ICreditOverride } from '../types.ts';
import { creditErrorText } from '../utils.ts';
import { CreditsSegmented } from './CreditsSegmented.tsx';
import { useFundingOptions } from './funding.ts';
import { useCreditsAdminSettings } from './use.credits.admin.ts';

type Overrides = Record<string, ICreditOverride | null>;

const numberInput =
  'h-10 w-20 rounded-full border border-border bg-transparent px-3 text-right text-body font-semibold tabular-nums outline-none transition-colors focus:border-foreground sm:w-24';

const NumberField: React.FC<{
  value: number | null | undefined;
  onChange: (value: number | null) => void;
  label: string;
  allowEmpty?: boolean;
  placeholder?: string;
  /** Show the label above the field (rows with several fields). */
  caption?: boolean;
}> = ({ value, onChange, label, allowEmpty = false, placeholder, caption = false }) => {
  const field = (
    <input
      type="number"
      inputMode="numeric"
      aria-label={label}
      value={value ?? ''}
      placeholder={placeholder}
      onChange={event => {
        const raw = event.target.value;
        if (raw === '') onChange(allowEmpty ? null : 0);
        else onChange(Math.max(0, Math.floor(Number(raw)) || 0));
      }}
      className={numberInput}
    />
  );
  if (!caption) return field;
  return (
    <label className="flex flex-col items-end gap-0.5">
      <span className="text-micro font-semibold text-muted-foreground uppercase">{label}</span>
      {field}
    </label>
  );
};

const Row: React.FC<{ title: ReactNode; text?: ReactNode; children: ReactNode }> = ({
  title,
  text,
  children,
}) => (
  <div className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:gap-3">
    <div className="min-w-0 flex-1">
      <p className="text-body font-semibold break-words">{title}</p>
      {text && <p className="text-caption break-words text-muted-foreground">{text}</p>}
    </div>
    <div className="flex flex-wrap items-end justify-end gap-2 self-end sm:shrink-0 sm:self-auto">
      {children}
    </div>
  </div>
);

const Section: React.FC<{ title: string; children: ReactNode }> = ({ title, children }) => (
  <section className="border-b border-border/50 py-2">
    <h2 className="px-4 pt-2 pb-1 text-title font-bold">{title}</h2>
    <div className="divide-y divide-border/40">{children}</div>
  </section>
);

/** Global limits + amounts / prices of every rule, product, tip context and app. */
export const CreditsAdminSettings: React.FC = () => {
  const { t } = useTranslation('credits');
  const { data, version, error, saving, save, reload } = useCreditsAdminSettings();
  useEffect(() => {
    void reload();
  }, [reload]);

  if (error && !data) {
    return (
      <CreditsErrorState
        text={creditErrorText(t, error)}
        retryLabel={t('actions.retry')}
        onRetry={() => void reload()}
      />
    );
  }
  if (!data) {
    return (
      <div className="space-y-2 p-4" aria-busy="true">
        <Skeleton className="h-40 w-full rounded-2xl" />
        <Skeleton className="h-40 w-full rounded-2xl" />
      </div>
    );
  }
  // New data (load / save) → the form starts again from it.
  return <SettingsForm key={version} data={data} saving={saving} save={save} />;
};

const SettingsForm: React.FC<{
  data: ICreditAdminSettings;
  saving: boolean;
  save: ReturnType<typeof useCreditsAdminSettings>['save'];
}> = ({ data, saving, save }) => {
  const { t } = useTranslation('credits');
  const [settings, setSettings] = useState<ICreditGlobalSettings>(data.settings);
  const [overrides, setOverrides] = useState<Overrides>(data.overrides);
  const fundingOptions = useFundingOptions(t);

  const patch = (key: string, value: Partial<ICreditOverride>) =>
    setOverrides(current => ({ ...current, [key]: { ...(current[key] ?? {}), ...value } }));
  const reset = (key: string) => setOverrides(current => ({ ...current, [key]: null }));
  const setTransfer = (value: Partial<ICreditGlobalSettings['transfer']>) =>
    setSettings(current =>
      current ? { ...current, transfer: { ...current.transfer, ...value } } : current
    );
  const setDaily = (value: Partial<ICreditGlobalSettings['daily']>) =>
    setSettings(current =>
      current ? { ...current, daily: { ...current.daily, ...value } } : current
    );

  const dirty =
    JSON.stringify(settings) !== JSON.stringify(data.settings) ||
    Object.entries(overrides).some(
      ([key, value]) =>
        JSON.stringify(value ?? null) !== JSON.stringify(data.overrides[key] ?? null)
    );

  const submit = async () => {
    // Only changed / reset overrides go to the runtime.
    const changed: Record<string, unknown> = {};
    Object.entries(overrides).forEach(([key, value]) => {
      if (JSON.stringify(value ?? null) !== JSON.stringify(data.overrides[key] ?? null))
        changed[key] = value;
    });
    const failed = await save({ settings, overrides: changed });
    if (failed) toast.error(creditErrorText(t, failed));
    else {
      toast.success(t('admin.saved'));
      void useCreditsStore.getState().loadCatalog(true);
    }
  };

  return (
    <>
      <Section title={t('admin.settings.global')}>
        <Row title={t('admin.settings.dailyCap')} text={t('admin.settings.dailyCapText')}>
          <NumberField
            label={t('admin.settings.dailyCap')}
            value={settings.dailyCap}
            onChange={value => setSettings({ ...settings, dailyCap: value ?? 0 })}
          />
        </Row>
        <Row title={t('admin.settings.earnConfirmed')}>
          <Switch
            checked={settings.earnRequiresConfirmed}
            onCheckedChange={checked =>
              setSettings({ ...settings, earnRequiresConfirmed: checked })
            }
          />
        </Row>
      </Section>

      <Section title={t('admin.settings.bank')}>
        <Row
          title={t('admin.settings.defaultFunding')}
          text={t('admin.settings.defaultFundingText')}
        >
          <CreditsSegmented
            label={t('admin.settings.defaultFunding')}
            value={settings.bank.defaultFunding}
            options={fundingOptions}
            onChange={value =>
              setSettings(current => ({
                ...current,
                bank: { ...current.bank, defaultFunding: value },
              }))
            }
          />
        </Row>
        <Row title={t('admin.settings.maxVoucherAmount')}>
          <NumberField
            label={t('admin.settings.maxVoucherAmount')}
            value={settings.bank.maxVoucherAmount}
            onChange={value =>
              setSettings(current => ({
                ...current,
                bank: { ...current.bank, maxVoucherAmount: Math.max(1, value ?? 1) },
              }))
            }
          />
        </Row>
      </Section>

      <Section title={t('admin.settings.daily')}>
        <Row title={t('admin.settings.enabled')}>
          <Switch
            checked={settings.daily.enabled}
            onCheckedChange={checked => setDaily({ enabled: checked })}
          />
        </Row>
        <Row title={t('admin.settings.dailyBase')}>
          <NumberField
            label={t('admin.settings.dailyBase')}
            value={settings.daily.base}
            onChange={value => setDaily({ base: value ?? 0 })}
          />
        </Row>
        <Row title={t('admin.settings.maxStreak')}>
          <NumberField
            label={t('admin.settings.maxStreak')}
            value={settings.daily.maxStreak}
            onChange={value => setDaily({ maxStreak: Math.max(1, value ?? 1) })}
          />
        </Row>
      </Section>

      <Section title={t('admin.settings.transfer')}>
        <Row title={t('admin.settings.enabled')}>
          <Switch
            checked={settings.transfer.enabled}
            onCheckedChange={checked => setTransfer({ enabled: checked })}
          />
        </Row>
        <Row title={t('admin.settings.friendsOnly')}>
          <Switch
            checked={settings.transfer.friendsOnly}
            onCheckedChange={checked => setTransfer({ friendsOnly: checked })}
          />
        </Row>
        <Row title={t('admin.settings.requireConfirmed')}>
          <Switch
            checked={settings.transfer.requireConfirmed}
            onCheckedChange={checked => setTransfer({ requireConfirmed: checked })}
          />
        </Row>
        {(
          [
            'minAccountAgeDays',
            'maxPerTransfer',
            'dailySend',
            'dailyReceive',
            'dailyPerRecipient',
            'holdHours',
            'feePercent',
          ] as const
        ).map(key => (
          <Row key={key} title={t(`admin.settings.${key}`)}>
            <NumberField
              label={t(`admin.settings.${key}`)}
              value={settings.transfer[key]}
              onChange={value => setTransfer({ [key]: value ?? 0 })}
            />
          </Row>
        ))}
      </Section>

      <OverrideSections data={data} overrides={overrides} patch={patch} reset={reset} />

      <div className="sticky bottom-0 z-10 border-t border-border/50 bg-background/90 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur-md">
        <button
          type="button"
          disabled={saving || !dirty}
          onClick={() => void submit()}
          className={cn(
            'inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-foreground text-body font-bold text-background transition-opacity hover:opacity-85 active:opacity-75 disabled:opacity-40',
            creditsFocus
          )}
        >
          {saving && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
          {t('admin.save')}
        </button>
      </div>
    </>
  );
};

const OverrideSections: React.FC<{
  data: ICreditAdminSettings;
  overrides: Overrides;
  patch: (key: string, value: Partial<ICreditOverride>) => void;
  reset: (key: string) => void;
}> = ({ data, overrides, patch, reset }) => {
  const { t } = useTranslation('credits');
  const labelOf = (list: { key: string; label: string }[], key: string) => {
    const label = list.find(item => item.key === key)?.label;
    return label ? t(label, { defaultValue: key }) : key;
  };
  const resetButton = (id: string) =>
    overrides[id] ? (
      <button
        type="button"
        onClick={() => reset(id)}
        aria-label={t('admin.reset')}
        title={t('admin.reset')}
        className={cn(creditsIconButton, 'text-muted-foreground hover:text-foreground')}
      >
        <RotateCcw className="size-4" aria-hidden="true" />
      </button>
    ) : (
      <span className="size-10" aria-hidden="true" />
    );
  const enabledOf = (id: string, fallback: boolean) => overrides[id]?.enabled ?? fallback;

  return (
    <>
      <Section title={t('admin.settings.rules')}>
        {data.defaults.rules.map(rule => {
          const id = `rule:${rule.key}`;
          const own = overrides[id] ?? {};
          return (
            <Row
              key={id}
              title={labelOf(data.catalog.rules, rule.key)}
              text={
                <span className={cn(!enabledOf(id, rule.enabled) && 'line-through')}>
                  {rule.key} ·{' '}
                  {t('admin.settings.default', { amount: rule.amount, cap: rule.dailyCap ?? '–' })}
                </span>
              }
            >
              <NumberField
                label={t('admin.settings.amount')}
                caption
                value={own.amount ?? rule.amount}
                onChange={value => patch(id, { amount: value ?? 0 })}
              />
              <NumberField
                label={t('admin.settings.cap')}
                caption
                allowEmpty
                placeholder="–"
                value={own.dailyCap !== undefined ? own.dailyCap : rule.dailyCap}
                onChange={value => patch(id, { dailyCap: value })}
              />
              <label className="flex flex-col items-end gap-0.5">
                <span className="text-micro font-semibold text-muted-foreground uppercase">
                  {t('admin.funding.label')}
                </span>
                <select
                  value={own.funding ?? ''}
                  onChange={event =>
                    patch(id, {
                      funding: (event.target.value || null) as ICreditOverride['funding'],
                    })
                  }
                  className="h-10 rounded-full border border-border bg-background px-3 text-caption font-semibold text-foreground outline-none focus:border-foreground"
                >
                  <option value="">{t('admin.funding.default')}</option>
                  <option value="bank">{t('admin.funding.bank')}</option>
                  <option value="mint">{t('admin.funding.mint')}</option>
                </select>
              </label>
              <span className="flex h-10 items-center">
                <Switch
                  aria-label={t('admin.settings.enabled')}
                  checked={enabledOf(id, rule.enabled)}
                  onCheckedChange={checked => patch(id, { enabled: checked })}
                />
              </span>
              {resetButton(id)}
            </Row>
          );
        })}
      </Section>

      <Section title={t('admin.settings.products')}>
        {data.defaults.products.map(product => {
          const id = `product:${product.key}`;
          const own = overrides[id] ?? {};
          return (
            <Row
              key={id}
              title={labelOf(data.catalog.products, product.key)}
              text={`${product.key} · ${t('admin.settings.defaultPrice', { price: product.price })}`}
            >
              <NumberField
                label={t('admin.settings.price')}
                caption
                value={own.price ?? product.price}
                onChange={value => patch(id, { price: Math.max(1, value ?? 1) })}
              />
              <span className="flex h-10 items-center">
                <Switch
                  aria-label={t('admin.settings.enabled')}
                  checked={enabledOf(id, product.enabled)}
                  onCheckedChange={checked => patch(id, { enabled: checked })}
                />
              </span>
              {resetButton(id)}
            </Row>
          );
        })}
      </Section>

      <Section title={t('admin.settings.tips')}>
        {data.defaults.tips.map(tip => {
          const id = `tip:${tip.key}`;
          const own = overrides[id] ?? {};
          return (
            <Row
              key={id}
              title={labelOf(data.catalog.tips, tip.key)}
              text={`${tip.key} · ${tip.min}–${tip.max}`}
            >
              <NumberField
                label={t('admin.settings.min')}
                caption
                value={own.min ?? tip.min}
                onChange={value => patch(id, { min: Math.max(1, value ?? 1) })}
              />
              <NumberField
                label={t('admin.settings.max')}
                caption
                value={own.max ?? tip.max}
                onChange={value => patch(id, { max: Math.max(1, value ?? 1) })}
              />
              <span className="flex h-10 items-center">
                <Switch
                  aria-label={t('admin.settings.enabled')}
                  checked={enabledOf(id, tip.enabled)}
                  onCheckedChange={checked => patch(id, { enabled: checked })}
                />
              </span>
              {resetButton(id)}
            </Row>
          );
        })}
      </Section>

      <Section title={t('admin.settings.apps')}>
        {data.defaults.apps.map(app => {
          const id = `app:${app.app}`;
          const own = overrides[id] ?? {};
          return (
            <Row key={id} title={app.app} text={t('admin.settings.appCap')}>
              <NumberField
                label={t('admin.settings.cap')}
                caption
                allowEmpty
                placeholder="–"
                value={own.dailyCap !== undefined ? own.dailyCap : app.dailyCap}
                onChange={value => patch(id, { dailyCap: value })}
              />
              {resetButton(id)}
            </Row>
          );
        })}
      </Section>
    </>
  );
};
