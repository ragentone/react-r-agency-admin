import { Button } from '@ui/shad-cn/components/button.tsx';
import { Skeleton } from '@ui/shad-cn/components/skeleton.tsx';
import { TriangleAlert } from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next';

/** Placeholder while a list or a chart loads. */
export const StatsSkeleton: React.FC<{ tiles?: number; variant?: 'charts' | 'list' }> = ({
  tiles = 0,
  variant = 'list',
}) => (
  <div className="space-y-4 px-4 py-4" aria-busy="true">
    {variant === 'charts' && tiles > 0 && (
      <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
        {Array.from({ length: tiles }, (_, index) => (
          <Skeleton key={index} className="h-28 rounded-2xl" />
        ))}
      </div>
    )}
    {variant === 'charts' ? (
      <Skeleton className="h-56 rounded-2xl" />
    ) : (
      Array.from({ length: tiles || 3 }, (_, index) => (
        <Skeleton key={index} className="h-16 rounded-2xl" />
      ))
    )}
  </div>
);

/** Load failed – with a retry button. */
export const StatsError: React.FC<{ onRetry: () => void }> = ({ onRetry }) => {
  const { t } = useTranslation('admin');
  return (
    <div role="alert" className="flex flex-col items-center gap-3 px-4 py-12 text-center">
      <TriangleAlert className="size-8 text-muted-foreground" aria-hidden="true" />
      <p className="text-body font-bold">{t('stats.error.title')}</p>
      <p className="text-caption text-muted-foreground">{t('stats.error.text')}</p>
      <Button variant="outline" className="rounded-full" onClick={onRetry}>
        {t('retry')}
      </Button>
    </div>
  );
};

/** Nothing to show yet. */
export const StatsEmpty: React.FC<{ title: string; text?: string; icon?: React.ReactNode }> = ({
  title,
  text,
  icon,
}) => (
  <div className="flex flex-col items-center gap-2 px-4 py-12 text-center">
    {icon}
    <p className="text-body font-bold">{title}</p>
    {text && <p className="text-caption text-muted-foreground">{text}</p>}
  </div>
);
