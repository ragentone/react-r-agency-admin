import { usePageBlockRegistry } from '@core/blocks/use.page.blocks.ts';
import { cn } from '@ui/lib/utils';
import {
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  Info,
  OctagonAlert,
  Play,
  Quote,
} from 'lucide-react';
import React, { Suspense, useEffect, useId, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { SitePageHtml } from '../components/SitePageHtml';
import { BlockLink } from './BlockLink';
import { HeroBlock } from './HeroBlock';
import { isFullWidthBlock, isInsetBlock, SITE_PAGE_COLUMN, SITE_PAGE_INSET } from './layout';
import { CardsBlock, ImageBlock, SplitBlock } from './MediaBlocks';
import {
  type IAppBlock,
  type ICountdownBlockData,
  type ICtaBlockData,
  type IDividerBlockData,
  type IFaqBlockData,
  type INoticeBlockData,
  type IQuoteBlockData,
  isAppBlock,
  type IStatsBlockData,
  type IStepsBlockData,
  type ITableBlockData,
  type ITabsBlockData,
  type IVideoBlockData,
  type PageBlock,
  TABLE_CELL_KEYS,
  videoEmbed,
} from './types';

export { BlockLink } from './BlockLink';

const BUTTON =
  'inline-flex h-11 items-center justify-center gap-2 rounded-full px-5 text-body font-bold transition-opacity hover:opacity-85';

/* ---------------------------------------------------------------- notice */

const NOTICE = {
  info: {
    icon: Info,
    className: 'border-sky-500/30 bg-sky-500/10 [&_svg]:text-sky-600 dark:[&_svg]:text-sky-400',
  },
  success: {
    icon: CheckCircle2,
    className:
      'border-emerald-500/30 bg-emerald-500/10 [&_svg]:text-emerald-600 dark:[&_svg]:text-emerald-400',
  },
  warning: {
    icon: AlertTriangle,
    className:
      'border-amber-500/40 bg-amber-500/10 [&_svg]:text-amber-600 dark:[&_svg]:text-amber-400',
  },
  danger: {
    icon: OctagonAlert,
    className: 'border-destructive/40 bg-destructive/10 [&_svg]:text-destructive',
  },
};

const NoticeBlock: React.FC<{ data: INoticeBlockData }> = ({ data }) => {
  const { icon: Icon, className } = NOTICE[data.tone] ?? NOTICE.info;
  if (!data.title && !data.text) return null;
  return (
    <aside role="note" className={cn('flex gap-3 rounded-2xl border p-4', className)}>
      <Icon className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
      <div className="min-w-0">
        {data.title && <p className="font-bold text-foreground">{data.title}</p>}
        {data.text && (
          <p
            className={cn(
              'text-body whitespace-pre-line text-foreground/85',
              data.title && 'mt-0.5'
            )}
          >
            {data.text}
          </p>
        )}
      </div>
    </aside>
  );
};

/* ---------------------------------------------------------------- cta */

const CtaBlock: React.FC<{ data: ICtaBlockData }> = ({ data }) => {
  const brand = data.variant === 'brand';
  return (
    <section
      className={cn(
        'flex flex-col items-start gap-3 rounded-3xl p-6 sm:p-8',
        brand ? 'bg-primary text-primary-foreground' : 'bg-foreground/[0.05] text-foreground'
      )}
    >
      {data.title && <h2 className="text-2xl font-bold tracking-tight">{data.title}</h2>}
      {data.text && <p className="text-base whitespace-pre-line opacity-85">{data.text}</p>}
      {((data.primaryLabel && data.primaryUrl) || (data.secondaryLabel && data.secondaryUrl)) && (
        <div className="flex w-full flex-col gap-2 pt-2 min-[420px]:w-auto min-[420px]:flex-row">
          {data.primaryLabel && data.primaryUrl && (
            <BlockLink
              href={data.primaryUrl}
              className={cn(
                BUTTON,
                brand ? 'bg-primary-foreground text-primary' : 'bg-foreground text-background'
              )}
            >
              {data.primaryLabel}
            </BlockLink>
          )}
          {data.secondaryLabel && data.secondaryUrl && (
            <BlockLink
              href={data.secondaryUrl}
              className={cn(
                BUTTON,
                'border',
                brand ? 'border-primary-foreground/40' : 'border-border'
              )}
            >
              {data.secondaryLabel}
            </BlockLink>
          )}
        </div>
      )}
    </section>
  );
};

/* ---------------------------------------------------------------- faq */

const FaqBlock: React.FC<{ data: IFaqBlockData }> = ({ data }) => {
  const items = data.items.filter(item => item.question);
  if (!items.length) return null;
  return (
    <section>
      {data.title && <h2 className="mb-3 text-xl font-bold tracking-tight">{data.title}</h2>}
      <div className="divide-y divide-border/60 rounded-2xl border border-border/60">
        {items.map((item, index) => (
          <details key={index} className="group">
            <summary className="flex min-h-13 cursor-pointer list-none items-center gap-3 px-4 py-3 font-semibold [&::-webkit-details-marker]:hidden">
              <span className="min-w-0 flex-1">{item.question}</span>
              <ChevronDown
                className="size-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180"
                aria-hidden="true"
              />
            </summary>
            {item.answer && (
              <p className="px-4 pb-4 text-body whitespace-pre-line text-muted-foreground">
                {item.answer}
              </p>
            )}
          </details>
        ))}
      </div>
    </section>
  );
};

/* ---------------------------------------------------------------- quote */

const QuoteBlock: React.FC<{ data: IQuoteBlockData }> = ({ data }) => {
  if (!data.text) return null;
  return (
    <figure className="rounded-3xl bg-foreground/[0.04] p-6 sm:p-8">
      <Quote className="size-7 text-muted-foreground/60" aria-hidden="true" />
      <blockquote className="mt-3 text-lg leading-relaxed font-medium whitespace-pre-line sm:text-xl">
        {data.text}
      </blockquote>
      {(data.author || data.role) && (
        <figcaption className="mt-4 text-body">
          {data.author && <span className="font-bold">{data.author}</span>}
          {data.role && (
            <span className="text-muted-foreground">
              {data.author ? ' · ' : ''}
              {data.role}
            </span>
          )}
        </figcaption>
      )}
    </figure>
  );
};

/* ---------------------------------------------------------------- video */

/** Two-click embed: nothing is loaded from YouTube / Vimeo before the visitor taps play. */
const VideoBlock: React.FC<{ data: IVideoBlockData }> = ({ data }) => {
  const { t } = useTranslation('admin');
  const [active, setActive] = useState(false);
  const embed = videoEmbed(data.url);
  if (!embed) return null;
  const provider = embed.provider === 'youtube' ? 'YouTube' : 'Vimeo';
  return (
    <figure>
      <div className="relative aspect-video overflow-hidden rounded-2xl bg-neutral-900">
        {active ? (
          <iframe
            src={embed.src}
            title={data.caption || provider}
            allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
            className="absolute inset-0 size-full"
          />
        ) : (
          <button
            type="button"
            onClick={() => setActive(true)}
            className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6 text-center text-white"
          >
            <span className="grid size-16 place-items-center rounded-full bg-white/15 backdrop-blur transition-transform hover:scale-105">
              <Play className="size-7 translate-x-0.5 fill-current" aria-hidden="true" />
            </span>
            <span className="max-w-xs text-caption text-white/75">
              {t('blocks.video.consent', { provider })}
            </span>
          </button>
        )}
      </div>
      {data.caption && (
        <figcaption className="mt-2 text-caption text-muted-foreground">{data.caption}</figcaption>
      )}
    </figure>
  );
};

/* ---------------------------------------------------------------- stats */

const StatsBlock: React.FC<{ data: IStatsBlockData }> = ({ data }) => {
  const items = data.items.filter(item => item.value || item.label);
  if (!items.length) return null;
  return (
    <section>
      {data.title && <h2 className="mb-4 text-xl font-bold tracking-tight">{data.title}</h2>}
      <dl
        className={cn(
          'grid grid-cols-2 gap-3',
          items.length === 3 && 'sm:grid-cols-3',
          items.length >= 4 && 'sm:grid-cols-4'
        )}
      >
        {items.map((item, index) => (
          <div key={index} className="rounded-2xl bg-foreground/[0.04] p-4 sm:p-5">
            <dd className="text-3xl font-bold tracking-tight tabular-nums sm:text-4xl">
              {item.value}
            </dd>
            <dt className="mt-1 text-caption text-muted-foreground">{item.label}</dt>
          </div>
        ))}
      </dl>
    </section>
  );
};

/* ---------------------------------------------------------------- steps */

/** Numbered steps on a vertical line. */
const StepsBlock: React.FC<{ data: IStepsBlockData }> = ({ data }) => {
  const items = data.items.filter(item => item.title || item.text);
  if (!items.length) return null;
  return (
    <section>
      {data.title && <h2 className="mb-5 text-xl font-bold tracking-tight">{data.title}</h2>}
      <ol className="relative space-y-6 before:absolute before:top-2 before:bottom-2 before:left-4 before:w-px before:bg-border">
        {items.map((item, index) => (
          <li key={index} className="relative flex gap-4">
            <span className="relative z-10 grid size-8 shrink-0 place-items-center rounded-full bg-foreground text-caption font-bold text-background tabular-nums">
              {index + 1}
            </span>
            <div className="min-w-0 pt-1">
              {item.title && <h3 className="font-bold">{item.title}</h3>}
              {item.text && (
                <p className="mt-0.5 text-body whitespace-pre-line text-muted-foreground">
                  {item.text}
                </p>
              )}
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
};

/* ---------------------------------------------------------------- tabs */

const TabsBlock: React.FC<{ data: ITabsBlockData }> = ({ data }) => {
  const items = data.items.filter(item => item.label);
  const [active, setActive] = useState(0);
  const baseId = useId();
  if (!items.length) return null;
  const current = Math.min(active, items.length - 1);
  return (
    <section>
      {data.title && <h2 className="mb-4 text-xl font-bold tracking-tight">{data.title}</h2>}
      <div
        role="tablist"
        aria-label={data.title || undefined}
        className="-mx-4 flex gap-1.5 overflow-x-auto px-4 pb-1 scrollbar-hide sm:mx-0 sm:px-0"
      >
        {items.map((item, index) => (
          <button
            key={index}
            id={`${baseId}-tab-${index}`}
            type="button"
            role="tab"
            aria-selected={index === current}
            aria-controls={`${baseId}-panel-${index}`}
            onClick={() => setActive(index)}
            className={cn(
              'h-10 shrink-0 rounded-full px-4 text-body font-semibold transition-colors',
              index === current
                ? 'bg-foreground text-background'
                : 'border border-border/70 text-muted-foreground hover:text-foreground'
            )}
          >
            {item.label}
          </button>
        ))}
      </div>
      <div
        id={`${baseId}-panel-${current}`}
        role="tabpanel"
        aria-labelledby={`${baseId}-tab-${current}`}
        className="mt-4"
      >
        <SitePageHtml html={items[current].html} />
      </div>
    </section>
  );
};

/* ---------------------------------------------------------------- countdown */

const remaining = (target: number) => {
  const ms = Math.max(0, target - Date.now());
  return {
    done: ms === 0,
    days: Math.floor(ms / 86400000),
    hours: Math.floor(ms / 3600000) % 24,
    minutes: Math.floor(ms / 60000) % 60,
    seconds: Math.floor(ms / 1000) % 60,
  };
};

const CountdownBlock: React.FC<{ data: ICountdownBlockData }> = ({ data }) => {
  const { t, i18n } = useTranslation('admin');
  const target = new Date(data.target).getTime();
  const [, tick] = useState(0);
  const valid = Number.isFinite(target);
  const left = remaining(valid ? target : 0);

  useEffect(() => {
    if (!valid || left.done) return;
    const timer = window.setInterval(() => tick(value => value + 1), 1000);
    return () => window.clearInterval(timer);
  }, [valid, left.done]);

  if (!valid) return null;
  const date = new Intl.DateTimeFormat(i18n.language, {
    dateStyle: 'full',
    timeStyle: 'short',
  }).format(target);
  const parts = [
    ['days', left.days],
    ['hours', left.hours],
    ['minutes', left.minutes],
    ['seconds', left.seconds],
  ] as const;

  return (
    <section className="rounded-3xl bg-foreground/[0.04] p-6 text-center sm:p-8">
      {data.title && <h2 className="text-xl font-bold tracking-tight sm:text-2xl">{data.title}</h2>}
      <p className="mt-1 text-caption text-muted-foreground">{date}</p>
      {left.done ? (
        <p className="mt-5 text-lg font-bold">{data.doneText || t('blocks.countdown.done')}</p>
      ) : (
        <div className="mt-5 grid grid-cols-4 gap-2 sm:gap-3" role="timer" aria-live="off">
          {parts.map(([unit, value]) => (
            <div key={unit} className="rounded-2xl bg-background p-2 sm:p-3">
              <div className="text-2xl font-bold tabular-nums sm:text-4xl">
                {String(value).padStart(unit === 'days' ? 1 : 2, '0')}
              </div>
              <div className="text-[11px] text-muted-foreground sm:text-caption">
                {t(`blocks.countdown.${unit}`, { count: value })}
              </div>
            </div>
          ))}
        </div>
      )}
      {data.buttonLabel && data.buttonUrl && (
        <div className="mt-5">
          <BlockLink href={data.buttonUrl} className={cn(BUTTON, 'bg-foreground text-background')}>
            {data.buttonLabel}
          </BlockLink>
        </div>
      )}
    </section>
  );
};

/* ---------------------------------------------------------------- table */

const TABLE_ALIGN = { left: 'text-left', center: 'text-center', right: 'text-right tabular-nums' };

const TABLE_ROW = {
  striped: 'even:bg-foreground/[0.035]',
  lines: 'border-t border-border/60 first:border-t-0',
  grid: 'border-t border-border/60 first:border-t-0',
} as const;

/** Rows with content, cells cut to the column count. */
const tableContent = (data: ITableBlockData) => {
  const columns = data.columns.slice(0, TABLE_CELL_KEYS.length);
  const rows = data.rows
    .map(row => TABLE_CELL_KEYS.slice(0, columns.length).map(key => row[key] ?? ''))
    .filter(cells => cells.some(Boolean));
  return { columns, rows, hasHead: columns.some(column => column.label) };
};

/** Phones (`stack`): one card per row, every cell labelled with its column head. */
const TableCards: React.FC<{ data: ITableBlockData }> = ({ data }) => {
  const { columns, rows } = tableContent(data);
  return (
    <ul className="space-y-2.5 sm:hidden">
      {rows.map((cells, rowIndex) => {
        const [first, ...rest] = cells;
        const titled = data.firstColumn;
        const entries = (titled ? rest : cells)
          .map((value, index) => ({ value, column: columns[titled ? index + 1 : index] }))
          .filter(entry => entry.value);
        return (
          <li key={rowIndex} className="rounded-2xl border border-border/60 bg-card p-4">
            {titled && first && <p className="mb-1.5 font-bold text-foreground">{first}</p>}
            <dl className="space-y-1.5">
              {entries.map(({ value, column }, index) => (
                <div key={index} className="flex items-baseline justify-between gap-4">
                  {column?.label && (
                    <dt className="shrink-0 text-caption text-muted-foreground">{column.label}</dt>
                  )}
                  <dd
                    className={cn(
                      'min-w-0 text-body whitespace-pre-line break-words',
                      column?.label ? 'text-right font-medium' : 'text-foreground',
                      column?.align === 'right' && 'tabular-nums'
                    )}
                  >
                    {value}
                  </dd>
                </div>
              ))}
            </dl>
          </li>
        );
      })}
    </ul>
  );
};

const TableBlock: React.FC<{ data: ITableBlockData }> = ({ data }) => {
  const { t } = useTranslation('admin');
  const { columns, rows, hasHead } = tableContent(data);
  const titleId = useId();
  if (!columns.length || (!rows.length && !hasHead)) return null;
  const variant = data.variant in TABLE_ROW ? data.variant : 'striped';
  const grid = variant === 'grid';
  const stack = data.mobile === 'stack';
  const cell = (index: number) =>
    cn(
      'px-4 py-3 align-top whitespace-pre-line',
      TABLE_ALIGN[columns[index]?.align] ?? TABLE_ALIGN.left,
      grid && 'border-l border-border/60 first:border-l-0'
    );
  return (
    <figure className="m-0">
      {data.title && (
        <h2 id={titleId} className="mb-4 text-xl font-bold tracking-tight">
          {data.title}
        </h2>
      )}
      {stack && <TableCards data={data} />}
      <div
        // Scrollable region: reachable + scrollable with the keyboard.
        role="region"
        tabIndex={0}
        aria-labelledby={data.title ? titleId : undefined}
        aria-label={data.title ? undefined : t('blocks.type.table.label')}
        className={cn(
          'overflow-x-auto overscroll-x-contain rounded-2xl border border-border/60 bg-card focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none',
          stack && 'hidden sm:block'
        )}
      >
        <table className="w-full min-w-max border-collapse text-body sm:min-w-full">
          {hasHead && (
            <thead className="bg-foreground/[0.04]">
              <tr>
                {columns.map((column, index) => (
                  <th
                    key={index}
                    scope="col"
                    className={cn(
                      cell(index),
                      'border-b border-border/70 py-2.5 text-caption font-bold text-muted-foreground'
                    )}
                  >
                    {column.label}
                  </th>
                ))}
              </tr>
            </thead>
          )}
          <tbody>
            {rows.map((cells, rowIndex) => (
              <tr key={rowIndex} className={TABLE_ROW[variant]}>
                {cells.map((value, index) =>
                  index === 0 && data.firstColumn ? (
                    <th
                      key={index}
                      scope="row"
                      className={cn(cell(index), 'font-semibold text-foreground')}
                    >
                      {value}
                    </th>
                  ) : (
                    <td key={index} className={cn(cell(index), 'text-foreground/85')}>
                      {value}
                    </td>
                  )
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {data.caption && (
        <figcaption className="mt-2 text-caption whitespace-pre-line text-muted-foreground">
          {data.caption}
        </figcaption>
      )}
    </figure>
  );
};

/* ---------------------------------------------------------------- divider */

const DividerBlock: React.FC<{ data: IDividerBlockData }> = ({ data }) => {
  const space = { sm: 'py-2', md: 'py-5', lg: 'py-10' }[data.size];
  return (
    <div className={space} aria-hidden={data.variant === 'space'}>
      {data.variant === 'line' && <hr className="border-border/70" />}
    </div>
  );
};

/* ---------------------------------------------------------------- app blocks */

/** Block of an app (`Core.blocks`) – nothing when the app isn't loaded. */
const AppBlockView: React.FC<{ block: IAppBlock; first: boolean }> = ({ block, first }) => {
  const registry = usePageBlockRegistry();
  const definition = registry.get(block.type);
  if (!definition) return null;
  const Render = definition.render;
  return (
    <Suspense fallback={<div className="h-40 animate-pulse rounded-2xl bg-foreground/[0.05]" />}>
      <Render data={block.data} id={block.id} first={first} />
    </Suspense>
  );
};

/* ---------------------------------------------------------------- list */

export const SitePageBlockView: React.FC<{ block: PageBlock; first?: boolean }> = ({
  block,
  first = false,
}) => {
  if (isAppBlock(block)) return <AppBlockView block={block} first={first} />;
  switch (block.type) {
    case 'hero':
      return <HeroBlock data={block.data} first={first} />;
    case 'text':
      return <SitePageHtml html={block.data.html} />;
    case 'image':
      return <ImageBlock data={block.data} first={first} />;
    case 'split':
      return <SplitBlock data={block.data} first={first} />;
    case 'cards':
      return <CardsBlock data={block.data} />;
    case 'notice':
      return <NoticeBlock data={block.data} />;
    case 'cta':
      return <CtaBlock data={block.data} />;
    case 'faq':
      return <FaqBlock data={block.data} />;
    case 'quote':
      return <QuoteBlock data={block.data} />;
    case 'video':
      return <VideoBlock data={block.data} />;
    case 'divider':
      return <DividerBlock data={block.data} />;
    case 'stats':
      return <StatsBlock data={block.data} />;
    case 'steps':
      return <StepsBlock data={block.data} />;
    case 'tabs':
      return <TabsBlock data={block.data} />;
    case 'countdown':
      return <CountdownBlock data={block.data} />;
    case 'table':
      return <TableBlock data={block.data} />;
    default:
      return null;
  }
};

/** All blocks of a page, mobile first: reading column, banners edge to edge. */
export const SitePageBlocks: React.FC<{ blocks: PageBlock[]; className?: string }> = ({
  blocks,
  className,
}) => {
  // Re-render when an app registers its block later (lazy app chunks).
  usePageBlockRegistry();
  return (
    <div data-slot="site-page-blocks" className={cn('flex flex-col gap-8', className)}>
      {blocks.map((block, index) => (
        <div
          key={block.id}
          data-block={block.type}
          className={cn(
            'min-w-0',
            isFullWidthBlock(block) ? 'w-full' : SITE_PAGE_COLUMN,
            isInsetBlock(block) && SITE_PAGE_INSET,
            isInsetBlock(block) && index === 0 && 'pt-3 sm:pt-6'
          )}
        >
          <SitePageBlockView block={block} first={index === 0} />
        </div>
      ))}
    </div>
  );
};
