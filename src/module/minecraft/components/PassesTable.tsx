import { Badge } from '@ui/shad-cn/components/badge.tsx';
import { Button } from '@ui/shad-cn/components/button.tsx';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@ui/shad-cn/components/table.tsx';
import { Ban, CircleCheck, Trash2 } from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next';

import type { IMinecraftPass } from '../types';

/** Passes as a table: gamertag, alias, last seen, status, actions (alias / last seen from `sm`). */
export const PassesTable: React.FC<{
  passes: IMinecraftPass[];
  onToggleBlock: (pass: IMinecraftPass) => void;
  onDelete: (pass: IMinecraftPass) => void;
}> = ({ passes, onToggleBlock, onDelete }) => {
  const { t } = useTranslation('minecraft');
  return (
    <Table>
      <TableHeader>
        <TableRow className="border-border/50">
          <TableHead>{t('pass.table.gamertag')}</TableHead>
          <TableHead className="hidden sm:table-cell">{t('pass.table.alias')}</TableHead>
          <TableHead className="hidden sm:table-cell">{t('pass.table.lastSeen')}</TableHead>
          <TableHead>{t('pass.table.status')}</TableHead>
          <TableHead className="w-0" />
        </TableRow>
      </TableHeader>
      <TableBody>
        {passes.map(pass => {
          const lastSeen = pass.lastSeenAt
            ? new Date(pass.lastSeenAt).toLocaleString()
            : t('pass.never');
          const blocked = pass.status === 'blocked';
          return (
            <TableRow key={pass.id} className="border-border/50">
              <TableCell className="max-w-40 sm:max-w-none">
                <p className="truncate font-bold">{pass.gamertag}</p>
                <p className="truncate text-caption text-muted-foreground sm:hidden">
                  {pass.alias} · {lastSeen}
                </p>
              </TableCell>
              <TableCell className="hidden text-muted-foreground sm:table-cell">
                {pass.alias}
              </TableCell>
              <TableCell className="hidden whitespace-nowrap text-muted-foreground sm:table-cell">
                {lastSeen}
              </TableCell>
              <TableCell>
                <Badge variant={pass.status === 'active' ? 'default' : 'secondary'}>
                  {t(`pass.status.${pass.status}`)}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex items-center justify-end gap-1">
                  <Button
                    variant="outline"
                    size="icon-md"
                    aria-label={blocked ? t('pass.unblock') : t('pass.block')}
                    onClick={() => onToggleBlock(pass)}
                  >
                    {blocked ? <CircleCheck /> : <Ban />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-md"
                    aria-label={t('pass.delete')}
                    onClick={() => onDelete(pass)}
                  >
                    <Trash2 />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
};
