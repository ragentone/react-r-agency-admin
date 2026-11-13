import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@ui/shad-cn/components/empty.tsx';
import { Clock } from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next';

/** No job registered / nothing matches the filter. */
export const CronEmpty: React.FC<{ filtered: boolean }> = ({ filtered }) => {
  const { t } = useTranslation('admin-cron');
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia>
          <Clock className="size-6" />
        </EmptyMedia>
        <EmptyTitle>{t(filtered ? 'empty.filtered' : 'empty.title')}</EmptyTitle>
        <EmptyDescription>{t(filtered ? 'empty.filteredText' : 'empty.text')}</EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
};
