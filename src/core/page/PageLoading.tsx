import { Spinner } from '@ui/shad-cn/components/spinner.tsx';

/** Shown while a lazily loaded page chunk is being fetched. */
export const PageLoading = () => (
  <div className={'relative w-full h-full min-h-48 flex justify-center items-center'}>
    <Spinner className={'size-10 opacity-60'} />
  </div>
);
