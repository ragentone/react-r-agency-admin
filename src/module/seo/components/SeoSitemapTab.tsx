import { Alert, AlertDescription, AlertTitle } from '@ui/shad-cn/components/alert.tsx';
import { Badge } from '@ui/shad-cn/components/badge.tsx';
import { Button } from '@ui/shad-cn/components/button.tsx';
import { Separator } from '@ui/shad-cn/components/separator.tsx';
import { ToggleGroup, ToggleGroupItem } from '@ui/shad-cn/components/toggle-group.tsx';
import { Check, Copy, ExternalLink, Map as MapIcon, RefreshCw, TriangleAlert } from 'lucide-react';
import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import type { ISeoSitemapStatus } from '../types';
import type { SeoAdmin } from '../use.seo.admin';
import { formatAgo } from '../utils';

/** Tab "Sitemap": what Google gets (`/sitemap.xml`), rebuild now, where each link comes from. */
export const SeoSitemapTab: React.FC<{
  admin: SeoAdmin;
  sitemap: ISeoSitemapStatus;
  indexing: boolean;
}> = ({ admin, sitemap, indexing }) => {
  const { t, i18n } = useTranslation('seo');
  const [source, setSource] = useState('all');
  const [copied, setCopied] = useState(false);

  const sources = useMemo(() => {
    const counts = new Map<string, number>();
    sitemap.entries.forEach(entry => counts.set(entry.source, (counts.get(entry.source) ?? 0) + 1));
    return [...counts.entries()].sort((a, b) => b[1] - a[1]);
  }, [sitemap.entries]);

  const visible = useMemo(
    () =>
      sitemap.entries
        .filter(entry => source === 'all' || entry.source === source)
        .sort((a, b) => b.priority - a.priority || a.url.localeCompare(b.url)),
    [sitemap.entries, source]
  );

  const sourceLabel = (value: string) => t(`sitemap.source.${value}`, { defaultValue: value });

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(sitemap.url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error(t('sitemap.copyFailed'));
    }
  };

  const rebuild = async () => {
    const result = await admin.rebuildSitemap();
    if (result.ok)
      toast.success(t('toast.sitemapBuilt', { count: result.data?.entries.length ?? 0 }));
    else toast.error(t('toast.sitemapFailed'));
  };

  return (
    <>
      <section className="space-y-4 px-4 py-4">
        <div className="flex items-start gap-3">
          <span
            aria-hidden="true"
            className="grid size-12 shrink-0 place-items-center rounded-full bg-foreground text-background [&>svg]:size-6"
          >
            <MapIcon />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-2xl font-extrabold tabular-nums">
              {t('sitemap.count', { count: sitemap.entries.length })}
            </p>
            <p className="text-caption text-muted-foreground">
              {t('sitemap.generated', {
                ago: formatAgo(sitemap.generatedAt, i18n.language, t('sitemap.justNow')),
              })}
            </p>
          </div>
        </div>

        {!indexing && (
          <Alert variant="destructive" className="rounded-xl">
            <TriangleAlert aria-hidden="true" />
            <AlertTitle>{t('settings.indexingOffTitle')}</AlertTitle>
            <AlertDescription>{t('sitemap.indexingOff')}</AlertDescription>
          </Alert>
        )}
        {sitemap.error && (
          <Alert variant="destructive" className="rounded-xl">
            <TriangleAlert aria-hidden="true" />
            <AlertTitle>{t('sitemap.errorTitle')}</AlertTitle>
            <AlertDescription className="break-words">{sitemap.error}</AlertDescription>
          </Alert>
        )}

        <div className="flex h-12 items-center gap-1 rounded-xl border border-border/60 pr-1 pl-3">
          <span className="min-w-0 flex-1 truncate font-mono text-caption">{sitemap.url}</span>
          <Button
            type="button"
            variant="ghost"
            size="icon-md"
            onClick={() => void copy()}
            aria-label={t('sitemap.copy')}
          >
            {copied ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}
          </Button>
          <Button variant="ghost" size="icon-md" asChild>
            <a
              href={sitemap.url}
              target="_blank"
              rel="noreferrer noopener"
              aria-label={t('sitemap.open')}
            >
              <ExternalLink aria-hidden="true" />
            </a>
          </Button>
        </div>

        <Button
          variant="outline"
          size="lg"
          fullWidth
          className="font-bold"
          onClick={() => void rebuild()}
          isLoading={admin.building}
          disabled={admin.building}
        >
          {!admin.building && <RefreshCw aria-hidden="true" />}
          {admin.building ? t('sitemap.building') : t('sitemap.rebuild')}
        </Button>
        <p className="text-caption text-muted-foreground">{t('sitemap.hint')}</p>
      </section>

      <Separator className="bg-border/50" />

      {sitemap.entries.length > 0 && (
        <div className="overflow-x-auto px-4 py-3 [scrollbar-width:none]">
          <ToggleGroup
            type="single"
            value={source}
            onValueChange={value => value && setSource(value)}
            aria-label={t('sitemap.filter')}
            className="w-max justify-start gap-2"
          >
            {[['all', sitemap.entries.length] as [string, number], ...sources].map(
              ([value, count]) => (
                <ToggleGroupItem
                  key={value}
                  value={value}
                  className="h-8 shrink-0 rounded-full border border-border/70 px-3 text-caption font-semibold text-muted-foreground data-[state=on]:border-foreground data-[state=on]:bg-foreground data-[state=on]:text-background"
                >
                  {value === 'all' ? t('sitemap.all') : sourceLabel(value)}
                  <span className="ml-1 tabular-nums opacity-70">{count}</span>
                </ToggleGroupItem>
              )
            )}
          </ToggleGroup>
        </div>
      )}

      {sitemap.entries.length === 0 ? (
        <p className="px-8 py-14 text-center text-body text-muted-foreground">
          {t('sitemap.empty')}
        </p>
      ) : (
        <ul className="divide-y divide-border/50" aria-label={t('sitemap.listLabel')}>
          {visible.map(entry => (
            <li key={entry.url} className="flex items-center gap-3 px-4 py-3">
              <div className="min-w-0 flex-1">
                <p className="truncate font-mono text-body font-semibold">{entry.url}</p>
                <p className="text-caption text-muted-foreground">
                  {t(`changefreq.${entry.changefreq}`)} · {t('sitemap.priority')}{' '}
                  <span className="tabular-nums">{entry.priority.toFixed(1)}</span>
                </p>
              </div>
              <Badge variant="secondary" className="shrink-0 rounded-full">
                {sourceLabel(entry.source)}
              </Badge>
            </li>
          ))}
        </ul>
      )}
    </>
  );
};
