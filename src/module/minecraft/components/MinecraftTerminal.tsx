import { cn } from '@ui/lib';
import { AppDrawer } from '@ui/patterns';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  InputGroupText,
} from '@ui/shad-cn/components/input-group.tsx';
import { ArrowUp, SquareTerminal } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { AdminMinecraftApi } from '../api';
import { useMinecraftConsole } from '../hooks/use-minecraft-console';
import { type ITerminalCommand, matchCommands } from '../terminal-commands';
import { TerminalCommandMenu } from './TerminalCommandMenu';

/** Terminal pro Server: Verlauf (Log + Echo der Befehle) und Eingabe, nur bei laufendem Server. */
export const MinecraftTerminal: React.FC<{
  serverId: string;
  name: string;
  open: boolean;
  canSend: boolean;
  onOpenChange: (open: boolean) => void;
}> = ({ serverId, name, open, canSend, onOpenChange }) => {
  const { t } = useTranslation('minecraft');
  const { lines, refresh } = useMinecraftConsole(serverId, open);
  const [value, setValue] = useState('');
  const [busy, setBusy] = useState(false);
  const history = useRef<string[]>([]);
  const cursor = useRef(-1);
  const box = useRef<HTMLDivElement>(null);
  const stick = useRef(true);
  const [active, setActive] = useState(0);
  const [menuClosed, setMenuClosed] = useState(false);
  const matches = menuClosed ? [] : matchCommands(value);
  const current = Math.min(active, Math.max(matches.length - 1, 0));

  const change = (next: string) => {
    setValue(next);
    setActive(0);
    setMenuClosed(false);
  };
  const pick = (item: ITerminalCommand) => change(`/${item.cmd}${item.args ? ' ' : ''}`);

  useEffect(() => {
    const el = box.current;
    if (el && stick.current) el.scrollTop = el.scrollHeight;
  }, [lines]);

  const send = async (command: string) => {
    const text = command.trim();
    if (!text || busy) return;
    setBusy(true);
    const result = await AdminMinecraftApi.sendCommand(serverId, text);
    setBusy(false);
    if (!result.success) {
      toast.error(
        t(`terminal.error.${result.error ?? 'unknown'}`, {
          defaultValue: t('action.error.unknown'),
        })
      );
      return;
    }
    history.current = [text, ...history.current].slice(0, 50);
    cursor.current = -1;
    change('');
    stick.current = true;
    void refresh();
  };

  const onKey = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (matches.length > 0) {
      if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        event.preventDefault();
        const step = event.key === 'ArrowDown' ? 1 : -1;
        setActive((current + step + matches.length) % matches.length);
        return;
      }
      if (event.key === 'Enter' || event.key === 'Tab') {
        event.preventDefault();
        pick(matches[current]);
        return;
      }
      if (event.key === 'Escape') {
        event.preventDefault();
        event.stopPropagation();
        setMenuClosed(true);
        return;
      }
    }
    if (event.key === 'Enter') void send(value);
    if (event.key !== 'ArrowUp' && event.key !== 'ArrowDown') return;
    event.preventDefault();
    const step = event.key === 'ArrowUp' ? 1 : -1;
    cursor.current = Math.min(Math.max(cursor.current + step, -1), history.current.length - 1);
    change(history.current[cursor.current] ?? '');
  };

  return (
    <AppDrawer
      open={open}
      onOpenChange={onOpenChange}
      title={t('terminal.title', { name })}
      description={t('terminal.description')}
      contentProps={{ className: 'max-w-5xl' }}
      bodyClassName="p-0"
      footer={
        <div className="flex flex-col gap-2">
          {matches.length > 0 && (
            <TerminalCommandMenu items={matches} active={current} onPick={pick} />
          )}
          <InputGroup className="h-12 rounded-full border-border/50 font-mono">
            <InputGroupAddon align="inline-start">
              <InputGroupText>
                <SquareTerminal />
              </InputGroupText>
            </InputGroupAddon>
            <InputGroupInput
              className="h-full text-body"
              value={value}
              disabled={!canSend}
              maxLength={256}
              autoCapitalize="none"
              autoCorrect="off"
              autoComplete="off"
              spellCheck={false}
              placeholder={canSend ? t('terminal.placeholder') : t('terminal.offline')}
              onChange={event => change(event.target.value)}
              onKeyDown={onKey}
            />
            <InputGroupAddon align="inline-end">
              <InputGroupButton
                variant="default"
                size="icon-sm"
                className="size-9 rounded-full"
                aria-label={t('terminal.send')}
                disabled={!canSend || busy || !value.trim()}
                onClick={() => void send(value)}
              >
                <ArrowUp />
              </InputGroupButton>
            </InputGroupAddon>
          </InputGroup>
        </div>
      }
    >
      <div
        ref={box}
        onScroll={event => {
          const el = event.currentTarget;
          stick.current = el.scrollHeight - el.scrollTop - el.clientHeight < 24;
        }}
        className="h-full min-h-0 overflow-y-auto px-4 py-3 font-mono text-caption"
      >
        {lines.length === 0 && <p className="text-muted-foreground">{t('terminal.empty')}</p>}
        {lines.map(line => (
          <div
            key={line.seq}
            className={cn('break-words whitespace-pre-wrap', {
              'font-bold': line.kind === 'in',
              'text-destructive': line.kind === 'err',
              'text-muted-foreground': line.kind === 'out',
            })}
          >
            {line.text}
          </div>
        ))}
      </div>
    </AppDrawer>
  );
};
