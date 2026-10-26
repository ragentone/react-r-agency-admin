/** Options "bank" / "from nothing" of the funding controls. */
export const useFundingOptions = (t: (key: string) => string) => [
  { value: 'bank' as const, label: t('admin.funding.bank') },
  { value: 'mint' as const, label: t('admin.funding.mint') },
];
