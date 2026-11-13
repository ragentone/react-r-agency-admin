import { cn } from '@ui/lib';
import React from 'react';
import { useTranslation } from 'react-i18next';

import type { ITerminalCommand } from '../terminal-commands';

/** Dropdown über dem Eingabefeld: Befehle zum Slash, Auswahl per Klick oder Tastatur. */
export const TerminalCommandMenu: React.FC<{
  items: ITerminalCommand[];
  active: number;
  onPick: (item: ITerminalCommand) => void;
}> = ({ items, active, onPick }) => {
  const { t } = useTranslation('minecraft');
  return (
    <div
      role="listbox"
      className="max-h-52 overflow-y-auto rounded-2xl border border-border/50 bg-popover p-1"
    >
      {items.map((item, index) => (
        <button
          key={item.cmd}
          type="button"
          role="option"
          aria-selected={index === active}
          // mousedown statt click: das Eingabefeld behält den Fokus.
          onMouseDown={event => {
            event.preventDefault();
            onPick(item);
          }}
          className={cn(
            'flex w-full flex-col items-start gap-0.5 rounded-xl px-3 py-2 text-left',
            index === active ? 'bg-muted' : 'hover:bg-muted/60'
          )}
        >
          <span className="font-mono text-caption font-bold">
            /{item.cmd} <span className="font-normal text-muted-foreground">{item.args}</span>
          </span>
          <span className="text-caption text-muted-foreground">
            {t(`terminal.commands.${item.key}`)}
          </span>
        </button>
      ))}
    </div>
  );
};
