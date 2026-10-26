import { useCallback, useRef, useState } from 'react';

import { creditsAdminAction } from '../api.ts';
import type {
  CreditError,
  ICreditResult,
  ICreditVoucher,
  ICreditVoucherCreateValues,
} from '../types.ts';

export type CreditVoucherFilter = 'open' | 'closed' | 'all';

interface IListResult extends ICreditResult {
  vouchers?: ICreditVoucher[];
  hasMore?: boolean;
}
interface IDetailResult extends ICreditResult {
  voucher?: ICreditVoucher;
}
interface ICreateResult extends ICreditResult {
  vouchers?: ICreditVoucher[];
  batchId?: string | null;
}

const PAGE = 50;

/** Voucher list of the admin area – call `load()` on mount (component effect). */
export const useCreditsVouchers = () => {
  const [vouchers, setVouchers] = useState<ICreditVoucher[]>([]);
  const [hasMore, setHasMore] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<CreditError | null>(null);
  const request = useRef(0);

  const load = useCallback(async (filter: CreditVoucherFilter, query: string, offset = 0) => {
    const id = ++request.current;
    const result = await creditsAdminAction<IListResult>('vouchers', {
      state: filter,
      query,
      offset,
      limit: PAGE,
    });
    if (id !== request.current) return;
    setLoaded(true);
    if (!result.success) {
      setError(result.error ?? 'unknown');
      return;
    }
    setError(null);
    const page = result.vouchers ?? [];
    setVouchers(current => (offset ? [...current, ...page] : page));
    setHasMore(Boolean(result.hasMore));
  }, []);

  return { vouchers, hasMore, loaded, error, load };
};

export const createCreditVouchers = (values: ICreditVoucherCreateValues) =>
  creditsAdminAction<ICreateResult>('voucherCreate', { values: values as never });

/** One voucher (who redeemed it stays private) – call `reload()` on mount. */
export const useCreditVoucher = (id: string) => {
  const [voucher, setVoucher] = useState<ICreditVoucher | null>(null);
  const [error, setError] = useState<CreditError | null>(null);

  const apply = (result: IDetailResult) => {
    if (result.success && result.voucher) {
      setVoucher(result.voucher);
      setError(null);
      return null;
    }
    return result.error ?? 'unknown';
  };

  const reload = useCallback(async () => {
    const failed = apply(await creditsAdminAction<IDetailResult>('voucher', { id }));
    if (failed) setError(failed);
  }, [id]);

  const update = useCallback(
    async (values: { amount?: number; validUntil?: string | null; note?: string }) =>
      apply(await creditsAdminAction<IDetailResult>('voucherUpdate', { id, values })),
    [id]
  );

  const deactivate = useCallback(
    async () => apply(await creditsAdminAction<IDetailResult>('voucherDeactivate', { id })),
    [id]
  );

  return { voucher, error, reload, update, deactivate };
};
