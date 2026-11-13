import { BarList } from '@ui/patterns/chart';
import { Card, CardContent } from '@ui/shad-cn/components/card.tsx';
import React from 'react';
import { useTranslation } from 'react-i18next';

/** Load of every CPU core as bars (shows a single busy core that the average hides). */
export const MonitorCores: React.FC<{ cores: number[] }> = ({ cores }) => {
  const { t } = useTranslation('admin-monitor');
  if (!cores.length) return null;
  return (
    <Card className="rounded-xl border-border/50 shadow-none">
      <CardContent className="flex flex-col gap-2 p-4">
        <div>
          <h3 className="text-title font-bold">{t('cores.title')}</h3>
          <p className="text-caption text-muted-foreground">{t('cores.text')}</p>
        </div>
        <BarList
          max={100}
          items={cores.map((value, index) => ({
            key: String(index),
            label: t('cores.core', { n: index + 1 }),
            value,
            display: `${value} %`,
          }))}
        />
      </CardContent>
    </Card>
  );
};
