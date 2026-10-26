import { useAdminUsers } from '@module/admin/hooks';
import { cn } from '@ui/lib/utils';
import { Skeleton } from '@ui/shad-cn/components/skeleton.tsx';
import {
  ArrowLeft,
  Check,
  Copy,
  Download,
  Link2,
  Loader2,
  Plus,
  Search,
  Ticket,
  X,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import {
  creditsFocus,
  creditsIconButton,
  creditsInput,
  creditsRowInteractive,
} from '../components/credits.classes.ts';
import { CreditsAmount } from '../components/CreditsAmount.tsx';
import { CreditsAvatar } from '../components/CreditsAvatar.tsx';
import { CreditsChips, CreditsEmptyState, CreditsLoadMore } from '../components/CreditsUi.tsx';
import { CREDITS_NOTE_MAX, CREDITS_ROUTE } from '../const.ts';
import { useCreditsFormat } from '../hooks.ts';
import type { CreditFunding, CreditVoucherState, ICreditUser, ICreditVoucher } from '../types.ts';
import { creditErrorText, formatVoucherCode } from '../utils.ts';
import { CreditsSegmented } from './CreditsSegmented.tsx';
import { useFundingOptions } from './funding.ts';
import {
  createCreditVouchers,
  type CreditVoucherFilter,
  useCreditsVouchers,
  useCreditVoucher,
} from './use.credits.vouchers.ts';

const FILTERS: CreditVoucherFilter[] = ['open', 'closed', 'all'];
const SEARCH_DEBOUNCE = 300;

const input = creditsInput;
const primaryButton = cn(
  'inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-foreground text-body font-bold text-background transition-opacity hover:opacity-85 active:opacity-75 disabled:opacity-40',
  creditsFocus
);
const outlineButton = cn(
  'inline-flex h-10 items-center justify-center gap-2 rounded-full border border-border px-4 text-caption font-bold transition-colors hover:bg-foreground/[0.04] active:bg-foreground/[0.08]',
  creditsFocus
);
const label = 'text-caption font-semibold text-muted-foreground';

/** ISO → value of `<input type="datetime-local">` (local time). */
const toLocalInput = (iso: string | null | undefined) => {
  if (!iso) return '';
  const date = new Date(iso);
  const pad = (value: number) => String(value).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};
const fromLocalInput = (value: string) => (value ? new Date(value).toISOString() : null);

const redeemLink = (code: string) =>
  `${window.location.origin}${CREDITS_ROUTE}?code=${encodeURIComponent(code)}`;

const copy = async (text: string, done: string, failed: string) => {
  try {
    await navigator.clipboard.writeText(text);
    toast.success(done);
  } catch {
    toast.error(failed);
  }
};

const STATE_CLASSES: Record<CreditVoucherState, string> = {
  active: 'bg-foreground text-background',
  scheduled: 'border border-foreground text-foreground',
  expired: 'bg-foreground/[0.08] text-muted-foreground',
  exhausted: 'bg-foreground/[0.08] text-muted-foreground',
  closed: 'bg-foreground/[0.08] text-muted-foreground line-through',
};

const StateBadge: React.FC<{ state: CreditVoucherState }> = ({ state }) => {
  const { t } = useTranslation('credits');
  return (
    <span
      className={cn(
        'rounded-full px-2 py-0.5 text-micro font-bold uppercase',
        STATE_CLASSES[state]
      )}
    >
      {t(`admin.vouchers.state.${state}`)}
    </span>
  );
};

/** Admin: create voucher codes (single / batch), list, details, deactivate. */
export const CreditsAdminVouchers: React.FC = () => {
  const [view, setView] = useState<'list' | 'create' | { id: string }>('list');
  if (view === 'create') {
    return <VoucherCreate onBack={() => setView('list')} onOpen={id => setView({ id })} />;
  }
  if (typeof view === 'object') {
    return <VoucherDetail key={view.id} id={view.id} onBack={() => setView('list')} />;
  }
  return <VoucherList onCreate={() => setView('create')} onOpen={id => setView({ id })} />;
};

// ---- list ----------------------------------------------------------------------------------

const VoucherList: React.FC<{ onCreate: () => void; onOpen: (id: string) => void }> = ({
  onCreate,
  onOpen,
}) => {
  const { t, i18n } = useTranslation('credits');
  const locale = i18n.resolvedLanguage || i18n.language;
  const { vouchers, hasMore, loaded, error, load } = useCreditsVouchers();
  const [filter, setFilter] = useState<CreditVoucherFilter>('open');
  const [query, setQuery] = useState('');

  useEffect(() => {
    const timer = window.setTimeout(() => void load(filter, query.trim()), SEARCH_DEBOUNCE);
    return () => window.clearTimeout(timer);
  }, [filter, query, load]);

  return (
    <div>
      <div className="space-y-3 px-4 pt-3">
        <button type="button" onClick={onCreate} className={primaryButton}>
          <Plus className="size-4" aria-hidden="true" />
          {t('admin.vouchers.new')}
        </button>
        <label className="relative block">
          <span className="sr-only">{t('admin.vouchers.search')}</span>
          <Search
            className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <input
            type="search"
            value={query}
            onChange={event => setQuery(event.target.value)}
            placeholder={t('admin.vouchers.search')}
            className="h-11 w-full rounded-full border border-transparent bg-foreground/[0.06] pr-4 pl-11 text-body outline-none transition-colors placeholder:text-muted-foreground focus:border-foreground focus:bg-background"
          />
        </label>
        <CreditsChips
          options={FILTERS}
          value={filter}
          onChange={setFilter}
          labelOf={item => t(`admin.vouchers.filters.${item}`)}
          label={t('admin.vouchers.filter')}
        />
      </div>

      {error && !vouchers.length ? (
        <p role="alert" className="px-4 py-10 text-center text-body text-muted-foreground">
          {creditErrorText(t, error)}
        </p>
      ) : !loaded ? (
        <div className="space-y-2 p-4" aria-busy="true">
          <Skeleton className="h-14 w-full rounded-2xl" />
          <Skeleton className="h-14 w-full rounded-2xl" />
          <Skeleton className="h-14 w-full rounded-2xl" />
        </div>
      ) : !vouchers.length ? (
        <CreditsEmptyState icon={Ticket} text={t('admin.vouchers.empty')} />
      ) : (
        <ul className="mt-2 divide-y divide-border/40">
          {vouchers.map(voucher => (
            <li key={voucher.id}>
              <button
                type="button"
                onClick={() => onOpen(voucher.id)}
                className={cn(
                  'flex w-full items-center gap-3 px-4 py-3 text-left',
                  creditsRowInteractive
                )}
              >
                <div className="min-w-0 flex-1">
                  <p className="flex min-w-0 items-center gap-2">
                    <span className="truncate font-mono text-body font-bold tracking-wider">
                      {formatVoucherCode(voucher.code)}
                    </span>
                    <StateBadge state={voucher.state} />
                  </p>
                  <p className="truncate text-caption text-muted-foreground">
                    {[
                      t('admin.vouchers.redeemedOf', {
                        redeemed: voucher.redeemed,
                        max: voucher.maxRedemptions,
                      }),
                      voucher.user ? `@${voucher.user.alias}` : null,
                      voucher.validUntil
                        ? t('admin.vouchers.until', {
                            date: new Date(voucher.validUntil).toLocaleDateString(locale),
                          })
                        : null,
                      voucher.note,
                    ]
                      .filter(Boolean)
                      .join(' · ')}
                  </p>
                </div>
                <CreditsAmount value={voucher.amount} className="shrink-0 text-body font-bold" />
              </button>
            </li>
          ))}
        </ul>
      )}
      {hasMore && (
        <CreditsLoadMore
          label={t('actions.loadMore')}
          onClick={() => void load(filter, query.trim(), vouchers.length)}
        />
      )}
    </div>
  );
};

// ---- create --------------------------------------------------------------------------------

const UserPicker: React.FC<{
  value: ICreditUser | null;
  onChange: (user: ICreditUser | null) => void;
}> = ({ value, onChange }) => {
  const { t } = useTranslation('credits');
  const { users, search } = useAdminUsers();
  const [term, setTerm] = useState('');

  useEffect(() => {
    const timer = window.setTimeout(() => void search(term), SEARCH_DEBOUNCE);
    return () => window.clearTimeout(timer);
  }, [term, search]);

  if (value) {
    return (
      <div className="flex items-center gap-3 rounded-2xl border border-border px-3 py-2">
        <CreditsAvatar user={value} className="size-8" />
        <span className="min-w-0 flex-1 truncate text-body font-semibold">@{value.alias}</span>
        <button
          type="button"
          onClick={() => onChange(null)}
          aria-label={t('admin.vouchers.removeUser')}
          className={creditsIconButton}
        >
          <X className="size-4" aria-hidden="true" />
        </button>
      </div>
    );
  }
  return (
    <div>
      <input
        type="search"
        value={term}
        onChange={event => setTerm(event.target.value)}
        placeholder={t('admin.vouchers.userSearch')}
        className={input}
      />
      {term.trim().length >= 2 && users.length > 0 && (
        <ul className="mt-1 divide-y divide-border/40 overflow-hidden rounded-2xl border border-border">
          {users.slice(0, 5).map(user => (
            <li key={user.id}>
              <button
                type="button"
                onClick={() => {
                  onChange({ id: user.id, alias: user.alias, avatarUrl: user.avatarUrl });
                  setTerm('');
                }}
                className={cn(
                  'flex w-full items-center gap-3 px-3 py-2.5 text-left',
                  creditsRowInteractive
                )}
              >
                <CreditsAvatar user={user} className="size-8" />
                <span className="min-w-0 flex-1 truncate text-body font-semibold">
                  @{user.alias}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

const VoucherCreate: React.FC<{ onBack: () => void; onOpen: (id: string) => void }> = ({
  onBack,
  onOpen,
}) => {
  const { t } = useTranslation('credits');
  const format = useCreditsFormat();
  const fundingOptions = useFundingOptions(t);
  const [mode, setMode] = useState<'single' | 'batch'>('single');
  const [code, setCode] = useState('');
  const [amount, setAmount] = useState('');
  const [maxRedemptions, setMaxRedemptions] = useState('1');
  const [count, setCount] = useState('10');
  const [validFrom, setValidFrom] = useState('');
  const [validUntil, setValidUntil] = useState('');
  const [user, setUser] = useState<ICreditUser | null>(null);
  const [note, setNote] = useState('');
  const [funding, setFunding] = useState<CreditFunding>('bank');
  const [busy, setBusy] = useState(false);
  const [created, setCreated] = useState<ICreditVoucher[] | null>(null);

  const value = Math.trunc(Number(amount)) || 0;
  const per = user ? 1 : Math.max(1, Math.trunc(Number(maxRedemptions)) || 1);
  const codes = mode === 'batch' ? Math.max(1, Math.trunc(Number(count)) || 1) : 1;
  const total = value * per * codes;

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (value < 1 || busy) return;
    setBusy(true);
    const result = await createCreditVouchers({
      code: mode === 'single' && code.trim() ? code.trim() : null,
      amount: value,
      maxRedemptions: per,
      count: codes,
      validFrom: fromLocalInput(validFrom),
      validUntil: fromLocalInput(validUntil),
      userId: mode === 'single' ? (user?.id ?? null) : null,
      note: note.trim() || null,
      funding,
    });
    setBusy(false);
    if (!result.success || !result.vouchers?.length) {
      toast.error(creditErrorText(t, result.error));
      return;
    }
    toast.success(t('admin.vouchers.created', { count: result.vouchers.length }));
    if (result.vouchers.length === 1) onOpen(result.vouchers[0]!.id);
    else setCreated(result.vouchers);
  };

  const downloadCsv = (list: ICreditVoucher[]) => {
    const rows = [
      ['code', 'amount', 'max_redemptions', 'valid_until', 'link'],
      ...list.map(item => [
        formatVoucherCode(item.code),
        String(item.amount),
        String(item.maxRedemptions),
        item.validUntil ?? '',
        redeemLink(item.code),
      ]),
    ];
    const csv = rows
      .map(row => row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `vouchers-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const header = (
    <div className="flex min-w-0 items-center gap-2 px-2 pt-2">
      <button
        type="button"
        onClick={onBack}
        aria-label={t('actions.back')}
        className={creditsIconButton}
      >
        <ArrowLeft className="size-5" aria-hidden="true" />
      </button>
      <h2 className="text-title font-bold">{t('admin.vouchers.new')}</h2>
    </div>
  );

  if (created) {
    return (
      <div>
        {header}
        <div className="space-y-3 px-4 py-3">
          <p className="text-body">{t('admin.vouchers.created', { count: created.length })}</p>
          <button type="button" onClick={() => downloadCsv(created)} className={primaryButton}>
            <Download className="size-4" aria-hidden="true" />
            {t('admin.vouchers.csv')}
          </button>
        </div>
        <ul className="divide-y divide-border/40">
          {created.map(item => (
            <li key={item.id} className="flex items-center gap-3 px-4 py-2.5">
              <span className="min-w-0 flex-1 truncate font-mono text-body font-bold tracking-wider">
                {formatVoucherCode(item.code)}
              </span>
              <button
                type="button"
                aria-label={t('admin.vouchers.copy')}
                onClick={() =>
                  void copy(
                    formatVoucherCode(item.code),
                    t('admin.vouchers.copied'),
                    t('errors.unknown')
                  )
                }
                className={creditsIconButton}
              >
                <Copy className="size-4" aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <form onSubmit={event => void submit(event)}>
      {header}
      <div className="space-y-4 px-4 py-3">
        <CreditsSegmented
          label={t('admin.vouchers.mode')}
          value={mode}
          onChange={setMode}
          options={[
            { value: 'single', label: t('admin.vouchers.single') },
            { value: 'batch', label: t('admin.vouchers.batch') },
          ]}
        />

        {mode === 'single' ? (
          <label className="block">
            <span className={label}>{t('admin.vouchers.code')}</span>
            <input
              type="text"
              value={code}
              onChange={event =>
                setCode(
                  event.target.value
                    .toUpperCase()
                    .replace(/[^A-Z0-9-]/g, '')
                    .slice(0, 40)
                )
              }
              placeholder={t('admin.vouchers.codePlaceholder')}
              autoCapitalize="characters"
              spellCheck={false}
              className={cn(input, 'mt-1 font-mono tracking-wider')}
            />
          </label>
        ) : (
          <label className="block">
            <span className={label}>{t('admin.vouchers.count')}</span>
            <input
              type="number"
              inputMode="numeric"
              min={1}
              max={500}
              value={count}
              onChange={event => setCount(event.target.value.replace(/[^0-9]/g, '').slice(0, 3))}
              className={cn(input, 'mt-1 tabular-nums')}
            />
          </label>
        )}

        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className={label}>{t('admin.vouchers.amount')}</span>
            <input
              type="number"
              inputMode="numeric"
              min={1}
              required
              value={amount}
              onChange={event => setAmount(event.target.value.replace(/[^0-9]/g, '').slice(0, 8))}
              className={cn(input, 'mt-1 font-semibold tabular-nums')}
            />
          </label>
          <label className="block">
            <span className={label}>{t('admin.vouchers.maxRedemptions')}</span>
            <input
              type="number"
              inputMode="numeric"
              min={1}
              disabled={!!user}
              value={user ? '1' : maxRedemptions}
              onChange={event =>
                setMaxRedemptions(event.target.value.replace(/[^0-9]/g, '').slice(0, 6))
              }
              className={cn(input, 'mt-1 tabular-nums disabled:opacity-50')}
            />
          </label>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <label className="block">
            <span className={label}>{t('admin.vouchers.validFrom')}</span>
            <input
              type="datetime-local"
              value={validFrom}
              onChange={event => setValidFrom(event.target.value)}
              className={cn(input, 'mt-1')}
            />
          </label>
          <label className="block">
            <span className={label}>{t('admin.vouchers.validUntil')}</span>
            <input
              type="datetime-local"
              value={validUntil}
              onChange={event => setValidUntil(event.target.value)}
              className={cn(input, 'mt-1')}
            />
          </label>
        </div>

        {mode === 'single' && (
          <div>
            <span className={label}>{t('admin.vouchers.user')}</span>
            <div className="mt-1">
              <UserPicker value={user} onChange={setUser} />
            </div>
          </div>
        )}

        <label className="block">
          <span className={label}>{t('admin.vouchers.note')}</span>
          <input
            type="text"
            value={note}
            maxLength={CREDITS_NOTE_MAX}
            onChange={event => setNote(event.target.value)}
            className={cn(input, 'mt-1')}
          />
        </label>

        <div>
          <span className={label}>{t('admin.funding.label')}</span>
          <div className="mt-1">
            <CreditsSegmented
              label={t('admin.funding.label')}
              value={funding}
              onChange={setFunding}
              options={fundingOptions}
            />
          </div>
          <p className="mt-1 text-caption text-muted-foreground">
            {t(`admin.funding.${funding}Hint`)}
          </p>
        </div>

        <p className="rounded-2xl bg-foreground/[0.04] px-4 py-3 text-body">
          {t(funding === 'bank' ? 'admin.vouchers.reserveBank' : 'admin.vouchers.reserveMint', {
            value: format(total),
          })}
        </p>

        <button type="submit" disabled={value < 1 || busy} className={primaryButton}>
          {busy && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
          {t(mode === 'batch' ? 'admin.vouchers.createBatch' : 'admin.vouchers.create', {
            count: codes,
          })}
        </button>
      </div>
    </form>
  );
};

// ---- detail --------------------------------------------------------------------------------

const VoucherDetail: React.FC<{ id: string; onBack: () => void }> = ({ id, onBack }) => {
  const { t, i18n } = useTranslation('credits');
  const locale = i18n.resolvedLanguage || i18n.language;
  const format = useCreditsFormat();
  const { voucher, error, reload, update, deactivate } = useCreditVoucher(id);

  useEffect(() => {
    void reload();
  }, [reload]);

  return (
    <div>
      <div className="flex min-w-0 items-center gap-2 px-2 pt-2">
        <button
          type="button"
          onClick={onBack}
          aria-label={t('actions.back')}
          className={creditsIconButton}
        >
          <ArrowLeft className="size-5" aria-hidden="true" />
        </button>
        {voucher && (
          <span className="truncate font-mono text-title font-bold tracking-wider">
            {formatVoucherCode(voucher.code)}
          </span>
        )}
      </div>
      {error && !voucher && (
        <p role="alert" className="px-4 py-8 text-center text-body text-muted-foreground">
          {creditErrorText(t, error)}
        </p>
      )}
      {!voucher && !error && (
        <div className="space-y-2 p-4" aria-busy="true">
          <Skeleton className="h-24 w-full rounded-2xl" />
        </div>
      )}
      {voucher && (
        <>
          <section className="px-4 py-3">
            <div className="flex flex-wrap items-center gap-2">
              <CreditsAmount value={voucher.amount} className="text-display font-extrabold" />
              <StateBadge state={voucher.state} />
            </div>
            <p className="mt-1 text-caption text-muted-foreground">
              {[
                t('admin.vouchers.redeemedOf', {
                  redeemed: voucher.redeemed,
                  max: voucher.maxRedemptions,
                }),
                t('admin.vouchers.reserved', { value: format(voucher.reserved) }),
                t(`admin.funding.${voucher.funding}`),
              ].join(' · ')}
            </p>
            <div className="mt-3 grid grid-cols-2 gap-2 sm:flex">
              <button
                type="button"
                onClick={() =>
                  void copy(
                    formatVoucherCode(voucher.code),
                    t('admin.vouchers.copied'),
                    t('errors.unknown')
                  )
                }
                className={outlineButton}
              >
                <Copy className="size-4" aria-hidden="true" />
                {t('admin.vouchers.copy')}
              </button>
              <button
                type="button"
                onClick={() =>
                  void copy(
                    redeemLink(voucher.code),
                    t('admin.vouchers.copied'),
                    t('errors.unknown')
                  )
                }
                className={outlineButton}
              >
                <Link2 className="size-4" aria-hidden="true" />
                {t('admin.vouchers.copyLink')}
              </button>
            </div>
            <dl className="mt-4 divide-y divide-border/40 text-body">
              {(
                [
                  [
                    'validFrom',
                    voucher.validFrom ? new Date(voucher.validFrom).toLocaleString(locale) : '–',
                  ],
                  [
                    'validUntil',
                    voucher.validUntil ? new Date(voucher.validUntil).toLocaleString(locale) : '–',
                  ],
                  ['user', voucher.user ? `@${voucher.user.alias}` : t('admin.vouchers.everyone')],
                  ['createdBy', voucher.createdBy ? `@${voucher.createdBy.alias}` : '–'],
                  ['note', voucher.note || '–'],
                ] as const
              ).map(([key, value]) => (
                <div key={key} className="flex justify-between gap-4 py-2.5">
                  <dt className="shrink-0 text-muted-foreground">{t(`admin.vouchers.${key}`)}</dt>
                  <dd className="min-w-0 text-right font-semibold break-words">{value}</dd>
                </div>
              ))}
            </dl>
          </section>

          {voucher.state !== 'closed' && voucher.reserved > 0 && (
            <VoucherEdit
              key={`${voucher.amount}-${voucher.validUntil}-${voucher.note}`}
              voucher={voucher}
              update={update}
              deactivate={deactivate}
            />
          )}
        </>
      )}
    </div>
  );
};

const VoucherEdit: React.FC<{
  voucher: ICreditVoucher;
  update: ReturnType<typeof useCreditVoucher>['update'];
  deactivate: ReturnType<typeof useCreditVoucher>['deactivate'];
}> = ({ voucher, update, deactivate }) => {
  const { t } = useTranslation('credits');
  const [amount, setAmount] = useState(String(voucher.amount));
  const [validUntil, setValidUntil] = useState(toLocalInput(voucher.validUntil));
  const [note, setNote] = useState(voucher.note ?? '');
  const [busy, setBusy] = useState<'save' | 'deactivate' | null>(null);
  const [confirming, setConfirming] = useState(false);
  const locked = voucher.redeemed > 0;

  const save = async () => {
    setBusy('save');
    const failed = await update({
      ...(locked ? {} : { amount: Math.trunc(Number(amount)) }),
      validUntil: fromLocalInput(validUntil),
      note,
    });
    setBusy(null);
    if (failed) toast.error(creditErrorText(t, failed));
    else toast.success(t('admin.saved'));
  };

  const stop = async () => {
    setBusy('deactivate');
    const failed = await deactivate();
    setBusy(null);
    setConfirming(false);
    if (failed) toast.error(creditErrorText(t, failed));
    else toast.success(t('admin.vouchers.deactivated'));
  };

  return (
    <section className="space-y-3 border-t border-border/50 px-4 py-4">
      <h2 className="text-title font-bold">{t('admin.vouchers.edit')}</h2>
      <label className="block">
        <span className={label}>{t('admin.vouchers.amount')}</span>
        <input
          type="number"
          inputMode="numeric"
          min={1}
          disabled={locked}
          value={amount}
          onChange={event => setAmount(event.target.value.replace(/[^0-9]/g, '').slice(0, 8))}
          className={cn(input, 'mt-1 font-semibold tabular-nums disabled:opacity-50')}
        />
        {locked && (
          <span className="mt-1 block text-caption text-muted-foreground">
            {t('admin.vouchers.amountLocked')}
          </span>
        )}
      </label>
      <label className="block">
        <span className={label}>{t('admin.vouchers.validUntil')}</span>
        <input
          type="datetime-local"
          value={validUntil}
          onChange={event => setValidUntil(event.target.value)}
          className={cn(input, 'mt-1')}
        />
      </label>
      <label className="block">
        <span className={label}>{t('admin.vouchers.note')}</span>
        <input
          type="text"
          value={note}
          maxLength={CREDITS_NOTE_MAX}
          onChange={event => setNote(event.target.value)}
          className={cn(input, 'mt-1')}
        />
      </label>
      <button type="button" disabled={!!busy} onClick={() => void save()} className={primaryButton}>
        {busy === 'save' ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <Check className="size-4" />
        )}
        {t('admin.save')}
      </button>
      <button
        type="button"
        disabled={!!busy}
        onClick={() => (confirming ? void stop() : setConfirming(true))}
        onBlur={() => setConfirming(false)}
        className={cn(
          'inline-flex h-12 w-full items-center justify-center gap-2 rounded-full text-body font-bold transition-colors disabled:opacity-40',
          creditsFocus,
          confirming ? 'bg-destructive text-white' : 'border border-destructive/50 text-destructive'
        )}
      >
        {busy === 'deactivate' && <Loader2 className="size-4 animate-spin" />}
        {t(confirming ? 'admin.vouchers.deactivateConfirm' : 'admin.vouchers.deactivate')}
      </button>
    </section>
  );
};
