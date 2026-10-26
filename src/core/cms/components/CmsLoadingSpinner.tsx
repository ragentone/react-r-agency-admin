import { Spinner } from '@ui/shad-cn/components/spinner.tsx';

const CmsLoadingSpinner = () => {
  return (
    <div className="flex w-full flex-col items-center justify-center gap-1">
      <Spinner className={'size-12'} />
    </div>
  );
};

export { CmsLoadingSpinner };
