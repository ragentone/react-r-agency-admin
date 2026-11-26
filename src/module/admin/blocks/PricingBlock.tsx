import { cn } from '@ui/lib/utils';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { SitePageHtml } from '../components/SitePageHtml';
import { BlockLink } from './BlockLink';
import { formatPlanPrice } from './pricing.utils';
import type { IPlanItem, IPricingBlockData } from './types';

/** Empty editor HTML (`<p></p>`) counts as empty. */
const hasText = (html: string) => html.replace(/<[^>]*>|&nbsp;|\s/g, '') !== '';

/** Phones: stacked; from tablet width side by side (as many columns as plans). */
const COLUMNS: Record<number, string> = {
  1: '',
  2: 'sm:grid-cols-2',
  3: 'md:grid-cols-3',
};

const Plan: React.FC<{ plan: IPlanItem }> = ({ plan }) => {
  const { t, i18n } = useTranslation('admin');
  const button = plan.buttonLabel && plan.buttonUrl;
  return (
    <div
      className={cn(
        'relative flex flex-col rounded-2xl border p-5',
        plan.highlight ? 'border-2 border-foreground' : 'border-border/50'
      )}
    >
      {plan.highlight && plan.badge && (
        <span className="absolute -top-3 left-5 rounded-full bg-foreground px-3 py-0.5 text-caption font-bold text-background">
          {plan.badge}
        </span>
      )}
      {plan.name && <h3 className="text-lg font-bold tracking-tight">{plan.name}</h3>}
      {plan.showPrice && (
        <p className="mt-2 flex flex-wrap items-baseline gap-x-1.5">
          <span className="text-3xl font-bold tracking-tight tabular-nums">
            {formatPlanPrice(plan, i18n.language, {
              free: t('blocks.pricing.free'),
              from: t('blocks.pricing.from'),
            })}
          </span>
          {plan.period && <span className="text-body text-muted-foreground">{plan.period}</span>}
        </p>
      )}
      {hasText(plan.description) && (
        <SitePageHtml
          html={plan.description}
          className="mt-2 text-body leading-6 text-muted-foreground sm:text-body"
        />
      )}
      {hasText(plan.features) && (
        <SitePageHtml
          html={plan.features}
          className="mt-4 text-body leading-6 sm:text-body [&_li]:marker:text-muted-foreground"
        />
      )}
      {button && (
        <div className="mt-auto pt-5">
          <BlockLink
            href={plan.buttonUrl}
            className={cn(
              'inline-flex h-11 w-full items-center justify-center rounded-full px-5 text-body font-bold transition-opacity hover:opacity-85',
              plan.highlight
                ? 'bg-foreground text-background'
                : 'border border-border/50 text-foreground hover:bg-foreground/[0.04]'
            )}
          >
            {plan.buttonLabel}
          </BlockLink>
        </div>
      )}
    </div>
  );
};

/** Plans / prices as cards – the recommended one is framed and labelled. */
export const PricingBlock: React.FC<{ data: IPricingBlockData }> = ({ data }) => {
  const plans = data.items.filter(plan => plan.name || plan.showPrice || hasText(plan.features));
  if (!plans.length) return null;
  return (
    <section>
      {data.title && <h2 className="mb-5 text-xl font-bold tracking-tight">{data.title}</h2>}
      <div className={cn('grid gap-5 pt-2', COLUMNS[Math.min(plans.length, 3)])}>
        {plans.map((plan, index) => (
          <Plan key={index} plan={plan} />
        ))}
      </div>
    </section>
  );
};
