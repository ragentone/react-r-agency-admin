import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@ui/shad-cn/components/table.tsx';
import { ChevronRight, FileText } from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { sitePagePath } from '../const';
import type { ISitePage } from '../types';
import { formatDate } from '../utils';
import { SitePageStatus } from './AdminPageItem';

/** From `md`: pages as a table (title + path · status · updated). The whole row opens the editor. */
export const AdminPagesTable: React.FC<{
  pages: ISitePage[];
  onOpen: (page: ISitePage) => void;
}> = ({ pages, onOpen }) => {
  const { t, i18n } = useTranslation('admin');
  return (
    <div className="hidden md:block">
      <Table>
        <TableHeader>
          <TableRow className="border-border/50 hover:bg-transparent">
            <TableHead className="px-4 text-caption">{t('pages.col.title')}</TableHead>
            <TableHead className="text-caption">{t('pages.col.status')}</TableHead>
            <TableHead className="text-caption">{t('pages.col.updated')}</TableHead>
            <TableHead className="w-10" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {pages.map(page => (
            <TableRow
              key={page.id}
              onClick={() => onOpen(page)}
              className="cursor-pointer border-border/50"
            >
              <TableCell className="px-4 py-3">
                <button
                  type="button"
                  aria-label={t('pages.open', { title: page.title })}
                  onClick={event => {
                    event.stopPropagation();
                    onOpen(page);
                  }}
                  className="flex items-center gap-3 rounded-md text-left focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                >
                  <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-muted">
                    <FileText className="size-4" aria-hidden="true" />
                  </span>
                  <span className="min-w-0">
                    <span className="block max-w-80 truncate text-body font-bold">
                      {page.title}
                    </span>
                    <span className="block max-w-80 truncate text-caption text-muted-foreground">
                      {sitePagePath(page.slug)}
                    </span>
                  </span>
                </button>
              </TableCell>
              <TableCell>
                <SitePageStatus published={page.published} />
              </TableCell>
              <TableCell className="text-muted-foreground tabular-nums">
                {formatDate(page.updatedAt, i18n.language)}
              </TableCell>
              <TableCell className="pr-4">
                <ChevronRight className="size-4 text-muted-foreground" aria-hidden="true" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
