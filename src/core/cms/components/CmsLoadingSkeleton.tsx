import { parseCssWidthOrHeight } from '@core/utils';
import { cn } from '@ui/lib';
import { Skeleton } from '@ui/shad-cn/components/skeleton.tsx';

interface IProps {
  count?: number;
  height?: string | number;
  className?: string;
}

/**
 * CmsLoadingSkeleton is a functional component that renders a skeleton loading placeholder
 * typically used to indicate loading states in a CMS interface.
 */
const CmsLoadingSkeleton = ({ count, height, className }: IProps) => {
  return (
    <div className={cn('flex flex-col items-center justify-center gap-1', className)}>
      {[...Array(count || 3)].map((_, index) => (
        <Skeleton
          style={{
            height: parseCssWidthOrHeight(height, '12px'),
          }}
          key={index}
          className={'w-full'}
        />
      ))}
    </div>
  );
};

export { CmsLoadingSkeleton };
