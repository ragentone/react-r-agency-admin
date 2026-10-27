import { cn } from '@ui/lib/utils';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@ui/shad-cn/components/alert-dialog.tsx';
import { Button } from '@ui/shad-cn/components/button.tsx';
import { Input } from '@ui/shad-cn/components/input.tsx';
import { Skeleton } from '@ui/shad-cn/components/skeleton.tsx';
import { Switch } from '@ui/shad-cn/components/switch.tsx';
import { ToggleGroup, ToggleGroupItem } from '@ui/shad-cn/components/toggle-group.tsx';
import { Plus, RotateCcw, Trash2 } from 'lucide-react';
import React, { type ReactNode, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { pokerAdminAction } from '../api.ts';
import type {
  IPokerAdminResult,
  IPokerSettings,
  IPokerSngSetting,
  IPokerStakeSetting,
  PokerSameAddress,
} from '../types.ts';
import { PokerSection } from './PokerAdminView.tsx';
import { usePokerAdminSettings } from './use.poker.admin.ts';

type Result = IPokerAdminResult & { settings?: IPokerSettings; defaults?: IPokerSettings };

const BOT_DEFAULTS = { enabled: true, dailyWinLimit: 500, maxBb: 10 };

/** Number field with its label – `invalid` when the runtime rejected exactly this field. */
const NumberField: React.FC<{
  label: string;
  value: number;
  onChange: (value: number) => void;
  invalid?: boolean;
  suffix?: string;
}> = ({ label, value, onChange, invalid = false, suffix }) => (
  <label className="flex min-w-0 flex-col gap-1">
    <span className="truncate text-micro font-semibold text-muted-foreground uppercase">
      {label}
      {suffix ? ` (${suffix})` : ''}
    </span>
    <Input
      size="lg"
      type="number"
      inputMode="numeric"
      value={Number.isFinite(value) ? String(value) : ''}
      aria-invalid={invalid || undefined}
      onChange={event => onChange(Math.floor(Number(event.target.value)))}
      className="tabular-nums"
    />
  </label>
);

const Card: React.FC<{
  title: ReactNode;
  enabled: boolean;
  onEnabled: (value: boolean) => void;
  onRemove?: () => void;
  children: ReactNode;
  enabledLabel: string;
  removeLabel: string;
}> = ({ title, enabled, onEnabled, onRemove, children, enabledLabel, removeLabel }) => (
  <div className={cn('border-b border-border/50 px-4 py-4', !enabled && 'opacity-60')}>
    <div className="mb-3 flex items-center gap-3">
      <div className="min-w-0 flex-1">{title}</div>
      <Switch checked={enabled} onCheckedChange={onEnabled} aria-label={enabledLabel} />
      {onRemove && (
        <Button variant="ghost" size="icon-md" aria-label={removeLabel} onClick={onRemove}>
          <Trash2 />
        </Button>
      )}
    </div>
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">{children}</div>
  </div>
);

/** Settings: cash stakes, Sit & Go and freeroll – apply to new tables and tournaments. */
export const PokerAdminSettings: React.FC = () => {
  const { t } = useTranslation('poker');
  const { settings, version, error, reload, replace } = usePokerAdminSettings();

  useEffect(() => {
    void reload();
  }, [reload]);

  if (error && !settings) {
    return (
      <p className="px-4 py-10 text-center text-body font-bold">{t(`admin.errors.${error}`)}</p>
    );
  }
  if (!settings) {
    return (
      <div className="space-y-3 p-4" aria-busy="true">
        <Skeleton className="h-32 rounded-2xl" />
        <Skeleton className="h-32 rounded-2xl" />
      </div>
    );
  }
  // New saved copy → the form starts again from it.
  return <PokerSettingsForm key={version} saved={settings} onSaved={replace} />;
};

const PokerSettingsForm: React.FC<{
  saved: IPokerSettings;
  onSaved: (settings: IPokerSettings) => void;
}> = ({ saved, onSaved }) => {
  const { t } = useTranslation('poker');
  const [draft, setDraft] = useState<IPokerSettings>(
    () => JSON.parse(JSON.stringify(saved)) as IPokerSettings
  );
  const [field, setField] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const apply = (settings: IPokerSettings) => {
    setField(null);
    onSaved(settings);
  };

  const dirty = JSON.stringify(draft) !== JSON.stringify(saved);
  const savedStakes = new Set(saved.stakes.map(item => item.id));
  const savedSngs = new Set(saved.sngs.map(item => item.id));

  const update = (fn: (next: IPokerSettings) => void) => {
    const next = JSON.parse(JSON.stringify(draft)) as IPokerSettings;
    fn(next);
    setDraft(next);
  };
  const bad = (path: string) => field === path;

  const save = async () => {
    setSaving(true);
    const result = await pokerAdminAction<Result>('saveSettings', { settings: draft });
    setSaving(false);
    if (result.success && result.settings) {
      apply(result.settings);
      toast.success(t('admin.settings.saved'));
      return;
    }
    setField(result.field ?? null);
    toast.error(
      result.field
        ? t('admin.settings.invalidField', { field: fieldLabel(t, result.field) })
        : t(`admin.errors.${result.error ?? 'unknown'}`)
    );
  };

  const reset = async () => {
    setConfirmReset(false);
    const result = await pokerAdminAction<Result>('resetSettings');
    if (result.success && result.settings) {
      apply(result.settings);
      toast.success(t('admin.settings.resetDone'));
    } else toast.error(t(`admin.errors.${result.error ?? 'unknown'}`));
  };

  const stakeField = (index: number, key: keyof IPokerStakeSetting, suffix?: string) => (
    <NumberField
      key={key}
      label={t(`admin.settings.fields.${key}`)}
      suffix={suffix}
      value={draft.stakes[index]![key] as number}
      invalid={bad(`stakes.${index}.${key}`)}
      onChange={value =>
        update(next => {
          (next.stakes[index] as unknown as Record<string, number>)[key] = value;
        })
      }
    />
  );

  const sngField = (index: number, key: keyof IPokerSngSetting) => (
    <NumberField
      key={key}
      label={t(`admin.settings.fields.${key}`)}
      value={draft.sngs[index]![key] as number}
      invalid={bad(`sngs.${index}.${key}`)}
      onChange={value =>
        update(next => {
          (next.sngs[index] as unknown as Record<string, number>)[key] = value;
        })
      }
    />
  );

  const fr = draft.freeroll;
  const frField = (key: keyof typeof fr, suffix?: string) => (
    <NumberField
      key={key}
      label={t(`admin.settings.fields.${key}`)}
      suffix={suffix}
      value={fr[key] as number}
      invalid={bad(`freeroll.${key}`)}
      onChange={value =>
        update(next => {
          (next.freeroll as unknown as Record<string, number>)[key] = value;
        })
      }
    />
  );

  return (
    <>
      <p className="px-4 pt-4 text-caption text-muted-foreground">{t('admin.settings.hint')}</p>

      <PokerSection
        title={t('admin.settings.stakes')}
        action={
          <Button
            size="sm"
            variant="outline"
            onClick={() =>
              update(next => {
                next.stakes.push({
                  id: `stake-${next.stakes.length + 1}`,
                  enabled: false,
                  sb: 1,
                  bb: 2,
                  minBuyIn: 40,
                  maxBuyIn: 200,
                  seats: 6,
                  rakePercent: 5,
                  rakeCap: 4,
                });
              })
            }
          >
            <Plus />
            {t('admin.settings.add')}
          </Button>
        }
      />
      <div className="border-t border-border/50">
        {draft.stakes.map((stake, index) => (
          <Card
            key={index}
            enabled={stake.enabled}
            enabledLabel={t('admin.settings.enabled')}
            removeLabel={t('admin.settings.remove')}
            onEnabled={value => update(next => void (next.stakes[index]!.enabled = value))}
            onRemove={
              savedStakes.has(stake.id)
                ? undefined
                : () => update(next => void next.stakes.splice(index, 1))
            }
            title={
              savedStakes.has(stake.id) ? (
                <p className="truncate text-body font-bold">
                  {stake.id}
                  <span className="ml-2 text-caption font-medium text-muted-foreground">
                    {stake.seats === 2 ? 'Heads-Up' : `${stake.seats}-Max`}
                  </span>
                </p>
              ) : (
                <Input
                  size="lg"
                  value={stake.id}
                  aria-label={t('admin.settings.fields.id')}
                  aria-invalid={bad(`stakes.${index}.id`) || undefined}
                  onChange={event =>
                    update(next => void (next.stakes[index]!.id = event.target.value.toLowerCase()))
                  }
                />
              )
            }
          >
            {stakeField(index, 'sb')}
            {stakeField(index, 'bb')}
            {stakeField(index, 'minBuyIn')}
            {stakeField(index, 'maxBuyIn')}
            {stakeField(index, 'seats')}
            {stakeField(index, 'rakePercent', '%')}
            {stakeField(index, 'rakeCap')}
          </Card>
        ))}
      </div>

      <PokerSection
        title={t('admin.settings.sngs')}
        action={
          <Button
            size="sm"
            variant="outline"
            onClick={() =>
              update(next => {
                next.sngs.push({
                  id: `sng-${next.sngs.length + 1}`,
                  enabled: false,
                  players: 6,
                  buyIn: 50,
                  fee: 5,
                  chips: 1500,
                  levelMinutes: 4,
                  payouts: [65, 35],
                });
              })
            }
          >
            <Plus />
            {t('admin.settings.add')}
          </Button>
        }
      />
      <div className="border-t border-border/50">
        {draft.sngs.map((sng, index) => (
          <Card
            key={index}
            enabled={sng.enabled}
            enabledLabel={t('admin.settings.enabled')}
            removeLabel={t('admin.settings.remove')}
            onEnabled={value => update(next => void (next.sngs[index]!.enabled = value))}
            onRemove={
              savedSngs.has(sng.id)
                ? undefined
                : () => update(next => void next.sngs.splice(index, 1))
            }
            title={
              savedSngs.has(sng.id) ? (
                <p className="truncate text-body font-bold">
                  {t(`admin.names.${sng.id}`, { defaultValue: sng.id })}
                </p>
              ) : (
                <Input
                  size="lg"
                  value={sng.id}
                  aria-label={t('admin.settings.fields.id')}
                  aria-invalid={bad(`sngs.${index}.id`) || undefined}
                  onChange={event =>
                    update(next => void (next.sngs[index]!.id = event.target.value.toLowerCase()))
                  }
                />
              )
            }
          >
            {sngField(index, 'players')}
            {sngField(index, 'buyIn')}
            {sngField(index, 'fee')}
            {sngField(index, 'chips')}
            {sngField(index, 'levelMinutes')}
            <label className="col-span-2 flex min-w-0 flex-col gap-1 sm:col-span-3">
              <span className="truncate text-micro font-semibold text-muted-foreground uppercase">
                {t('admin.settings.fields.payouts')}
              </span>
              <Input
                size="lg"
                inputMode="numeric"
                value={sng.payouts.join(', ')}
                aria-invalid={bad(`sngs.${index}.payouts`) || undefined}
                onChange={event =>
                  update(next => {
                    next.sngs[index]!.payouts = event.target.value
                      .split(/[,\s]+/)
                      .filter(Boolean)
                      .map(value => Math.floor(Number(value)));
                  })
                }
                className="tabular-nums"
              />
            </label>
          </Card>
        ))}
      </div>

      <PokerSection title={t('admin.settings.bots')} />
      <div className="border-t border-border/50">
        <Card
          enabled={draft.bots?.enabled ?? true}
          enabledLabel={t('admin.settings.enabled')}
          removeLabel={t('admin.settings.remove')}
          onEnabled={value =>
            update(next => {
              next.bots = { ...(next.bots ?? BOT_DEFAULTS), enabled: value };
            })
          }
          title={
            <div className="min-w-0">
              <p className="truncate text-body font-bold">{t('admin.settings.botsTitle')}</p>
              <p className="text-caption text-muted-foreground">{t('admin.settings.botsText')}</p>
            </div>
          }
        >
          {(['dailyWinLimit', 'maxBb'] as const).map(key => (
            <NumberField
              key={key}
              label={t(`admin.settings.fields.${key}`)}
              value={(draft.bots ?? BOT_DEFAULTS)[key]}
              invalid={bad(`bots.${key}`)}
              onChange={value =>
                update(next => {
                  next.bots = { ...(next.bots ?? BOT_DEFAULTS), [key]: value };
                })
              }
            />
          ))}
        </Card>
      </div>

      <PokerSection title={t('admin.settings.matching')} />
      <div className="border-y border-border/50 px-4 py-4">
        <p className="text-body font-bold">{t('admin.settings.sameAddress')}</p>
        <p className="mt-0.5 text-caption text-muted-foreground">
          {t(`admin.settings.sameAddressText.${draft.matching?.sameAddress ?? 'avoid'}`)}
        </p>
        <ToggleGroup
          type="single"
          value={draft.matching?.sameAddress ?? 'avoid'}
          onValueChange={value =>
            value &&
            update(next => {
              next.matching = { sameAddress: value as PokerSameAddress };
            })
          }
          aria-label={t('admin.settings.sameAddress')}
          className="mt-3 justify-start"
        >
          {(['allow', 'avoid', 'block'] as const).map(item => (
            <ToggleGroupItem
              key={item}
              value={item}
              className="rounded-full px-3 data-[state=on]:bg-foreground data-[state=on]:text-background"
            >
              {t(`admin.settings.sameAddressOptions.${item}`)}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>

      <PokerSection title={t('admin.settings.freeroll')} />
      <div className="border-t border-border/50">
        <Card
          enabled={fr.enabled}
          enabledLabel={t('admin.settings.enabled')}
          removeLabel={t('admin.settings.remove')}
          onEnabled={value => update(next => void (next.freeroll.enabled = value))}
          title={
            <p className="truncate text-body font-bold">
              {t('admin.names.freeroll')}
              <span className="ml-2 text-caption font-medium text-muted-foreground">
                {fr.timeZone}
              </span>
            </p>
          }
        >
          <label className="flex min-w-0 flex-col gap-1">
            <span className="truncate text-micro font-semibold text-muted-foreground uppercase">
              {t('admin.settings.fields.start')}
            </span>
            <Input
              size="lg"
              type="time"
              value={`${String(fr.hour).padStart(2, '0')}:${String(fr.minute).padStart(2, '0')}`}
              aria-invalid={bad('freeroll.hour') || bad('freeroll.minute') || undefined}
              onChange={event => {
                const [hour, minute] = event.target.value.split(':').map(Number);
                update(next => {
                  next.freeroll.hour = hour ?? 0;
                  next.freeroll.minute = minute ?? 0;
                });
              }}
              className="tabular-nums"
            />
          </label>
          {frField('registerMinutes', 'min')}
          {frField('minPlayers')}
          {frField('maxPlayers')}
          {frField('chips')}
          {frField('levelMinutes')}
          {frField('prizePerPlayer')}
          {frField('minPool')}
          {frField('maxPool')}
        </Card>
      </div>

      <div className="sticky bottom-0 z-10 flex gap-2 border-t border-border/50 bg-background/90 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur-md">
        <Button variant="outline" size="xl" onClick={() => setConfirmReset(true)}>
          <RotateCcw />
          <span className="sr-only sm:not-sr-only">{t('admin.settings.reset')}</span>
        </Button>
        <Button
          variant="outline"
          size="xl"
          className="flex-1"
          disabled={!dirty || saving}
          onClick={() => {
            setDraft(JSON.parse(JSON.stringify(saved)) as IPokerSettings);
            setField(null);
          }}
        >
          {t('admin.settings.discard')}
        </Button>
        <Button
          size="xl"
          className="flex-1"
          disabled={!dirty}
          isLoading={saving}
          onClick={() => void save()}
        >
          {t('admin.settings.save')}
        </Button>
      </div>

      <AlertDialog open={confirmReset} onOpenChange={setConfirmReset}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('admin.settings.resetTitle')}</AlertDialogTitle>
            <AlertDialogDescription>{t('admin.settings.resetText')}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('admin.back')}</AlertDialogCancel>
            <AlertDialogAction onClick={() => void reset()}>
              {t('admin.settings.reset')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

/** `stakes.2.bb` → "Cash-Stakes 3 · Big Blind". */
const fieldLabel = (
  t: (key: string, options?: Record<string, unknown>) => string,
  path: string
) => {
  const parts = path.split('.');
  const section = parts[0] ?? '';
  const index = Number(parts[1]);
  const key = Number.isFinite(index) ? parts[2] : parts[1];
  const sectionLabel = t(`admin.settings.${section}`, { defaultValue: section });
  const keyLabel = key ? t(`admin.settings.fields.${key}`, { defaultValue: key }) : '';
  return [Number.isFinite(index) ? `${sectionLabel} ${index + 1}` : sectionLabel, keyLabel]
    .filter(Boolean)
    .join(' · ');
};
