import { Button } from '@ui/shad-cn/components/button.tsx';
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@ui/shad-cn/components/empty.tsx';
import { Skeleton } from '@ui/shad-cn/components/skeleton.tsx';
import { RotateCcw } from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next';

/** Loading state of a plugin list: three rows in the shape of the real rows. */
export const PluginListLoading: React.FC = () => (
  <div className="flex flex-col gap-3 px-4 py-4" aria-busy="true">
    {[0, 1, 2].map(index => (
      <Skeleton key={index} className="h-16 w-full" />
    ))}
  </div>
);

interface IPluginListErrorProps {
  onRetry: () => void;
}

/** Load failed: a short message and one retry button. */
export const PluginListError: React.FC<IPluginListErrorProps> = ({ onRetry }) => {
  const { t } = useTranslation('admin');
  return (
    <Empty>
      <EmptyHeader>
        <EmptyTitle>{t('plugins.error.title')}</EmptyTitle>
      </EmptyHeader>
      <EmptyContent>
        <Button variant="outline" size="lg" onClick={onRetry}>
          <RotateCcw className="size-4" />
          {t('plugins.error.retry')}
        </Button>
      </EmptyContent>
    </Empty>
  );
};

interface IPluginEmptyProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  /** Optional single next step, e.g. a button to create a plugin. */
  action?: React.ReactNode;
}

/** Empty list: icon, what is missing, and at most one action. */
export const PluginEmpty: React.FC<IPluginEmptyProps> = ({ icon, title, description, action }) => (
  <Empty>
    <EmptyHeader>
      <EmptyMedia>{icon}</EmptyMedia>
      <EmptyTitle>{title}</EmptyTitle>
      <EmptyDescription>{description}</EmptyDescription>
    </EmptyHeader>
    {action && <EmptyContent>{action}</EmptyContent>}
  </Empty>
);
