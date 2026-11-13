import { Card, CardContent } from '@ui/shad-cn/components/card.tsx';
import { HardDrive } from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next';

/** Days until the disk is full at the current trend (hidden when not growing / not enough data). */
export const MonitorDiskForecast: React.FC<{ diskFullInDays: number | null }> = ({
  diskFullInDays,
}) => {
  const { t } = useTranslation('admin-monitor');
  if (diskFullInDays === null) return null;
  const soon = diskFullInDays <= 14;
  return (
    <Card
      className={`rounded-xl shadow-none ${soon ? 'border-destructive/40' : 'border-border/50'}`}
    >
      <CardContent className="flex items-center gap-3 p-4">
        <HardDrive
          className={soon ? 'size-5 text-destructive' : 'size-5 text-muted-foreground'}
          aria-hidden="true"
        />
        <p className="text-body">
          {t('history.diskForecast', { days: Math.round(diskFullInDays) })}
        </p>
      </CardContent>
    </Card>
  );
};
