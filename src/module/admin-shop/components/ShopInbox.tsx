import { Input } from '@ui/shad-cn/components/input.tsx';
import { Search } from 'lucide-react';
import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { useShopInbox } from '../hooks/use.shop.request';
import {
  type IShopRequest,
  SHOP_REQUEST_OPEN_STATUSES,
  SHOP_REQUEST_STATUSES,
  type ShopRequestStatus,
} from '../types/request';
import { groupCustomers, matchesRequestSearch, sumCents } from '../utils/request-crm';
import { ShopCustomerDetail } from './ShopCustomerDetail';
import { ShopCustomers } from './ShopCustomers';
import { ShopEmpty } from './ShopEmpty';
import { ShopRequestDeleteDialog } from './ShopRequestDeleteDialog';
import { ShopRequestDetail } from './ShopRequestDetail';
import { ShopRequestFilter, type ShopRequestFilterValue } from './ShopRequestFilter';
import { ShopRequestItem } from './ShopRequestItem';
import { ShopRequestStats } from './ShopRequestStats';

type View = 'requests' | 'customers';

const VIEW_PILL = (active: boolean) =>
  `min-h-9 flex-1 cursor-pointer rounded-full border px-4 text-caption font-bold transition-colors ${
    active
      ? 'border-foreground bg-foreground text-background'
      : 'border-border/50 bg-background text-foreground hover:bg-muted'
  }`;

/** CRM of a page: pipeline of requests and customer list, with search, stats and details. */
export const ShopInbox: React.FC<{ shopId: string }> = ({ shopId }) => {
  const { t, i18n } = useTranslation('admin-shop');
  const { requests, loading, load, setStatus, setValue, remove } = useShopInbox();
  const [view, setView] = useState<View>('requests');
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<ShopRequestFilterValue>('all');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [customerKey, setCustomerKey] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<IShopRequest | null>(null);
  const fallback = t('crm.member');

  useEffect(() => {
    void load(shopId);
  }, [load, shopId]);

  const found = useMemo(
    () => requests.filter(request => matchesRequestSearch(request, search, fallback)),
    [requests, search, fallback]
  );
  const customers = useMemo(() => groupCustomers(found, fallback), [found, fallback]);
  const allCustomers = useMemo(() => groupCustomers(requests, fallback), [requests, fallback]);
  const counts = Object.fromEntries([
    ['all', found.length],
    ...SHOP_REQUEST_STATUSES.map(s => [s, found.filter(r => r.status === s).length]),
  ]) as Record<ShopRequestFilterValue, number>;
  const visible = filter === 'all' ? found : found.filter(r => r.status === filter);
  const selected = requests.find(request => request.id === selectedId) ?? null;
  const customer = allCustomers.find(item => item.key === customerKey) ?? null;

  const change = async (id: string, status: ShopRequestStatus) => {
    if (!(await setStatus(shopId, id, status))) toast.error(t('crm.error'));
  };
  const changeValue = async (id: string, cents: number | null) => {
    const ok = await setValue(shopId, id, cents);
    if (!ok) toast.error(t('crm.error'));
    return ok;
  };
  const deleteRequest = async (id: string) => {
    setDeleting(null);
    if (await remove(shopId, id)) {
      toast.success(t('crm.deleted'));
      setSelectedId(null);
    } else {
      toast.error(t('crm.error'));
    }
  };

  if (!loading && requests.length === 0) {
    return <ShopEmpty title={t('crm.empty')} />;
  }

  return (
    <>
      <div className="space-y-3">
        <ShopRequestStats
          openCents={sumCents(requests.filter(r => SHOP_REQUEST_OPEN_STATUSES.includes(r.status)))}
          wonCents={sumCents(requests.filter(r => r.status === 'won'))}
          language={i18n.language}
        />

        <div className="relative">
          <Search
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            value={search}
            onChange={event => setSearch(event.target.value)}
            placeholder={t('crm.search')}
            aria-label={t('crm.search')}
            className="h-11 rounded-full border-border/50 pl-9"
          />
        </div>

        <div className="flex gap-2" role="group" aria-label={t('crm.viewLabel')}>
          {(['requests', 'customers'] as const).map(item => (
            <button
              key={item}
              type="button"
              aria-pressed={view === item}
              className={VIEW_PILL(view === item)}
              onClick={() => setView(item)}
            >
              {t(`crm.view.${item}`)}
              <span className="ml-1.5 font-normal opacity-70">
                {item === 'requests' ? found.length : customers.length}
              </span>
            </button>
          ))}
        </div>

        {view === 'requests' && (
          <ShopRequestFilter value={filter} counts={counts} onChange={setFilter} />
        )}

        {(view === 'requests' ? visible.length : customers.length) === 0 ? (
          <ShopEmpty title={t('crm.noResults')} />
        ) : view === 'requests' ? (
          <div className="flex flex-col gap-3">
            {visible.map(request => (
              <ShopRequestItem
                key={request.id}
                request={request}
                language={i18n.language}
                onOpen={setSelectedId}
              />
            ))}
          </div>
        ) : (
          <ShopCustomers customers={customers} language={i18n.language} onOpen={setCustomerKey} />
        )}
      </div>

      <ShopRequestDetail
        request={selected}
        onOpenChange={() => setSelectedId(null)}
        onStatus={(id, status) => void change(id, status)}
        onValue={changeValue}
        onDelete={setDeleting}
        onCustomer={request => {
          setSelectedId(null);
          setCustomerKey(
            allCustomers.find(c => c.requests.some(r => r.id === request.id))?.key ?? null
          );
        }}
        language={i18n.language}
      />
      <ShopCustomerDetail
        customer={customer}
        language={i18n.language}
        onOpenChange={() => setCustomerKey(null)}
        onOpenRequest={id => {
          setCustomerKey(null);
          setSelectedId(id);
        }}
      />
      <ShopRequestDeleteDialog
        request={deleting}
        onCancel={() => setDeleting(null)}
        onConfirm={id => void deleteRequest(id)}
      />
    </>
  );
};
