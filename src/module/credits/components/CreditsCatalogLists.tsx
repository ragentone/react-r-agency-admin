import { Skeleton } from '@ui/shad-cn/components/skeleton.tsx';
import { Coins, Flame, Gift, type LucideIcon, Send } from 'lucide-react';
import React, { type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import { CreditsRegistry } from '../registry.ts';
import type { ICreditCatalog } from '../types.ts';
import { durationText } from '../utils.ts';
import { CreditsAmount } from './CreditsAmount.tsx';

interface IGroup<T> {
  app: string;
  label: string;
  icon: LucideIcon;
  items: T[];
}

/** Items grouped by app (registered order, core first). */
const useGroups = <T extends { app: string }>(items: T[], catalog: ICreditCatalog): IGroup<T>[] => {
  const { t } = useTranslation('credits');
  const order = ['core', ...CreditsRegistry.apps().map(entry => entry.app)];
  const apps = Array.from(new Set(items.map(item => item.app))).sort(
    (a, b) => (order.indexOf(a) + 1 || 999) - (order.indexOf(b) + 1 || 999)
  );
  return apps.map(app => {
    const entry = CreditsRegistry.app(app);
    const label = entry?.label ?? catalog.apps.find(item => item.app === app)?.label ?? app;
    return {
      app,
      label: t(label, { defaultValue: app }),
      icon: entry?.icon ?? Coins,
      items: items.filter(item => item.app === app),
    };
  });
};

const Loading = () => (
  <div aria-busy="true" className="px-4 py-3">
    <Skeleton className="mb-3 h-5 w-32 rounded-full" />
    {Array.from({ length: 4 }, (_, index) => (
      <div key={index} className="flex items-center gap-3 py-3">
        <div className="flex-1 space-y-2">
          <Skeleton className="h-3.5 w-1/2 rounded-full" />
          <Skeleton className="h-3 w-3/4 rounded-full" />
        </div>
        <Skeleton className="h-4 w-10 rounded-full" />
      </div>
    ))}
  </div>
);

const Section: React.FC<{
  icon: LucideIcon;
  title: string;
  note?: ReactNode;
  children: ReactNode;
}> = ({ icon: Icon, title, note, children }) => (
  <section className="border-b border-border/50 py-2">
    <h2 className="flex min-w-0 items-center gap-2.5 px-4 pt-2 pb-1 text-title font-bold">
      <span className="grid size-8 shrink-0 place-items-center rounded-full bg-foreground/[0.06]">
        <Icon className="size-4" strokeWidth={2} aria-hidden="true" />
      </span>
      <span className="truncate">{title}</span>
    </h2>
    {note && <p className="px-4 pb-1 text-caption text-muted-foreground">{note}</p>}
    <ul className="divide-y divide-border/40">{children}</ul>
  </section>
);

const Row: React.FC<{
  title: string;
  text?: string | null;
  meta?: ReactNode;
  value: ReactNode;
}> = ({ title, text, meta, value }) => (
  <li className="flex items-start gap-3 px-4 py-3">
    <div className="min-w-0 flex-1">
      <p className="text-body font-semibold break-words">{title}</p>
      {text && <p className="text-caption break-words text-muted-foreground">{text}</p>}
      {meta && <p className="mt-0.5 text-caption font-semibold text-muted-foreground">{meta}</p>}
    </div>
    <div className="shrink-0 pt-0.5 text-body font-bold whitespace-nowrap tabular-nums">
      {value}
    </div>
  </li>
);

/** "Earn" tab: daily bonus + rules of all apps with amounts and limits. */
export const CreditsEarnList: React.FC<{ catalog: ICreditCatalog | null }> = ({ catalog }) => {
  const { t } = useTranslation('credits');
  if (!catalog) return <Loading />;
  return <EarnContent catalog={catalog} t={t} />;
};

const EarnContent: React.FC<{
  catalog: ICreditCatalog;
  t: ReturnType<typeof useTranslation>['t'];
}> = ({ catalog, t }) => {
  const rules = catalog.rules.filter(rule => rule.key !== 'core.daily.login');
  const groups = useGroups(rules, catalog);
  const daily = catalog.daily;
  const dailyActive = daily.enabled && catalog.rules.some(rule => rule.key === 'core.daily.login');
  return (
    <>
      {dailyActive && (
        <Section
          icon={Flame}
          title={t('earn.dailyTitle')}
          note={t('earn.dailyText', {
            base: daily.base,
            max: daily.base * daily.maxStreak,
            days: daily.maxStreak,
          })}
        >
          <Row
            title={t('rules.daily.label')}
            text={t('rules.daily.description')}
            value={<CreditsAmount value={daily.base} signed />}
          />
        </Section>
      )}
      {groups.map(group => (
        <Section
          key={group.app}
          icon={group.icon}
          title={group.label}
          note={
            catalog.apps.find(app => app.app === group.app)?.dailyCap
              ? t('earn.appCap', {
                  count: catalog.apps.find(app => app.app === group.app)?.dailyCap ?? 0,
                })
              : undefined
          }
        >
          {group.items.map(rule => (
            <Row
              key={rule.key}
              title={t(rule.label)}
              text={rule.description ? t(rule.description) : null}
              meta={
                rule.once
                  ? t('earn.once')
                  : rule.dailyCap
                    ? t('earn.ruleCap', { count: rule.dailyCap })
                    : null
              }
              value={<CreditsAmount value={rule.amount} signed />}
            />
          ))}
        </Section>
      ))}
      <p className="px-4 py-4 text-caption text-muted-foreground">
        {t('earn.globalCap', { count: catalog.dailyCap })}
      </p>
    </>
  );
};

/** "Spend" tab: products of the apps + tips / transfers with their limits. */
export const CreditsSpendList: React.FC<{ catalog: ICreditCatalog | null }> = ({ catalog }) => {
  const { t } = useTranslation('credits');
  if (!catalog) return <Loading />;
  return <SpendContent catalog={catalog} t={t} />;
};

const SpendContent: React.FC<{
  catalog: ICreditCatalog;
  t: ReturnType<typeof useTranslation>['t'];
}> = ({ catalog, t }) => {
  const groups = useGroups(catalog.products, catalog);
  const tips = catalog.tips.filter(tip => tip.key !== 'core.transfer');
  const transfer = catalog.tips.find(tip => tip.key === 'core.transfer');
  const settings = catalog.transfer;
  return (
    <>
      {groups.map(group => (
        <Section key={group.app} icon={group.icon} title={group.label}>
          {group.items.map(product => (
            <Row
              key={product.key}
              title={t(product.label)}
              text={product.description ? t(product.description) : null}
              meta={durationText(t, product.durationHours)}
              value={<CreditsAmount value={product.price} />}
            />
          ))}
        </Section>
      ))}
      {(tips.length > 0 || transfer) && settings.enabled && (
        <Section
          icon={Gift}
          title={t('spend.tipsTitle')}
          note={t('spend.tipsText', {
            daily: settings.dailySend,
            hours: settings.holdHours,
          })}
        >
          {tips.map(tip => (
            <Row
              key={tip.key}
              title={t(tip.label)}
              value={
                <span className="tabular-nums">
                  {tip.min}–{tip.max}
                </span>
              }
            />
          ))}
          {transfer && (
            <li className="flex items-start gap-3 px-4 py-3">
              <Send className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
              <div className="min-w-0 flex-1">
                <p className="text-body font-semibold">{t('tips.transfer')}</p>
                <p className="text-caption text-muted-foreground">
                  {t(settings.friendsOnly ? 'spend.transferFriends' : 'spend.transferText')}
                </p>
              </div>
              <span className="shrink-0 pt-0.5 text-body font-bold tabular-nums">
                {transfer.min}–{transfer.max}
              </span>
            </li>
          )}
        </Section>
      )}
      {settings.feePercent > 0 && (
        <p className="px-4 py-4 text-caption text-muted-foreground">
          {t('spend.fee', { percent: settings.feePercent })}
        </p>
      )}
    </>
  );
};
