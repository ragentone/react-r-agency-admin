import { Button } from '@ui/shad-cn/components/button.tsx';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@ui/shad-cn/components/dropdown-menu.tsx';
import { cn } from '@ui/lib/utils';
import { ListTree } from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next';

import type { IDocSection } from '../sections';

/* Indent and weight per heading level: # strong, ## normal, ### muted and smaller. */
const LEVEL_CLASS: Record<number, string> = {
  1: 'pl-3 font-bold text-foreground',
  2: 'pl-6 text-foreground',
  3: 'pl-9 text-caption text-muted-foreground',
};

export interface IAdminDocSectionsMenuProps {
  sections: IDocSection[];
  /** Section the reader is on right now (highlighted). */
  activeId: string | null;
  onSelect: (id: string) => void;
}

/** Drawer header button: all headings of the open doc; the current one is marked live. */
export const AdminDocSectionsMenu: React.FC<IAdminDocSectionsMenuProps> = ({
  sections,
  activeId,
  onSelect,
}) => {
  const { t } = useTranslation('admin');

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon-lg"
          aria-label={t('docs.sections.open')}
          title={t('docs.sections.open')}
        >
          <ListTree className="size-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="flex max-h-[70dvh] w-80 flex-col overflow-y-auto p-1.5"
      >
        <DropdownMenuLabel className="flex items-center justify-between px-3 py-2 text-caption text-muted-foreground">
          <span className="font-bold text-foreground">{t('docs.sections.title')}</span>
          <span className="tabular-nums">{sections.length}</span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {sections.length === 0 ? (
          <div className="px-3 py-4 text-caption text-muted-foreground">
            {t('docs.sections.none')}
          </div>
        ) : (
          sections.map(section => {
            const current = section.id === activeId;
            return (
              <DropdownMenuItem
                key={section.id}
                onSelect={() => onSelect(section.id)}
                className={cn(
                  'relative min-h-11 cursor-pointer gap-2 rounded-lg pr-3 text-body',
                  LEVEL_CLASS[section.level] ?? LEVEL_CLASS[3],
                  current && 'bg-accent'
                )}
              >
                <span
                  aria-hidden
                  className={cn(
                    'size-1.5 shrink-0 rounded-full',
                    current ? 'bg-foreground' : 'bg-transparent'
                  )}
                />
                <span className="min-w-0 flex-1 truncate">{section.title}</span>
                {current && (
                  <span className="shrink-0 text-micro font-bold text-muted-foreground">
                    {t('docs.sections.current')}
                  </span>
                )}
              </DropdownMenuItem>
            );
          })
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
