import { Badge } from '@ui/shad-cn/components/badge.tsx';
import React from 'react';
import { useTranslation } from 'react-i18next';

import type { IMinecraftQuest } from '../types.quest';

/** Eine Aufgabe in der Liste: Tipp öffnet den Fortschritt, `children` = Menü rechts. */
export const QuestRow: React.FC<{
  quest: IMinecraftQuest;
  onOpen: () => void;
  children: React.ReactNode;
}> = ({ quest, onOpen, children }) => {
  const { t } = useTranslation('minecraft');
  return (
    <div className="flex items-center gap-2 border-b border-border/50 px-4 py-3 last:border-b-0">
      <button type="button" className="min-w-0 flex-1 text-left" onClick={onOpen}>
        <span className="flex items-center gap-2">
          <span className="truncate font-bold">{quest.title}</span>
          <Badge variant={quest.status === 'active' ? 'default' : 'secondary'}>
            {t(`quest.status.${quest.status}`)}
          </Badge>
        </span>
        <span className="block truncate text-caption text-muted-foreground">
          {t('quest.summary', {
            steps: quest.steps.length,
            players: quest.players,
            finished: quest.finished,
          })}
        </span>
      </button>
      {children}
    </div>
  );
};
