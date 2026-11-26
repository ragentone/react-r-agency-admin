import React from 'react';
import { useTranslation } from 'react-i18next';

import { AmountField } from './AmountField';
import { TextEditor } from './BlockEditors.shared';
import { ChoiceField, TextField, ToggleField, UrlField } from './BlockFields';
import { ItemsCarouselField } from './ItemsCarouselField';
import { formatPlanPrice } from './pricing.utils';
import { emptyPlan, type IPricingBlockData, PLAN_CURRENCIES, SITE_PAGE_PLANS_MAX } from './types';

interface IProps {
  data: IPricingBlockData;
  onChange: (data: IPricingBlockData) => void;
  disabled?: boolean;
}

/** 1–3 plans: name, price, points (one per line), highlight and button. */
export const PricingBlockEditor: React.FC<IProps> = ({ data, onChange, disabled }) => {
  const { t, i18n } = useTranslation('admin');
  return (
    <>
      <TextField
        label={t('blocks.field.heading')}
        value={data.title}
        onChange={title => onChange({ ...data, title })}
        max={150}
        disabled={disabled}
      />
      <ItemsCarouselField
        label={t('blocks.pricing.items')}
        items={data.items}
        onChange={items => onChange({ ...data, items })}
        create={emptyPlan}
        max={SITE_PAGE_PLANS_MAX}
        title={plan =>
          [
            plan.name,
            plan.showPrice &&
              formatPlanPrice(plan, i18n.language, {
                free: t('blocks.pricing.free'),
                from: t('blocks.pricing.from'),
              }),
          ]
            .filter(Boolean)
            .join(' · ')
        }
        addLabel={t('blocks.pricing.add')}
        disabled={disabled}
        render={(plan, update) => (
          <>
            <TextField
              label={t('blocks.pricing.name')}
              value={plan.name}
              onChange={name => update({ ...plan, name })}
              max={60}
              disabled={disabled}
            />
            <ToggleField
              label={t('blocks.pricing.showPrice')}
              value={plan.showPrice}
              onChange={showPrice => update({ ...plan, showPrice })}
              disabled={disabled}
            />
            {plan.showPrice && (
              <>
                <AmountField
                  label={t('blocks.pricing.price')}
                  hint={t('blocks.pricing.priceHint')}
                  value={plan.price}
                  onChange={price => update({ ...plan, price })}
                  currency={plan.currency}
                  disabled={disabled}
                />
                <ChoiceField
                  label={t('blocks.pricing.currency')}
                  value={plan.currency}
                  options={PLAN_CURRENCIES}
                  onChange={currency => update({ ...plan, currency })}
                  text={value => value}
                  disabled={disabled}
                />
                <ToggleField
                  label={t('blocks.pricing.from')}
                  hint={t('blocks.pricing.fromHint')}
                  value={plan.from}
                  onChange={from => update({ ...plan, from })}
                  disabled={disabled}
                />
                <TextField
                  label={t('blocks.pricing.period')}
                  value={plan.period}
                  onChange={period => update({ ...plan, period })}
                  max={30}
                  placeholder="/ Monat"
                  disabled={disabled}
                />
              </>
            )}
            <TextEditor
              label={t('blocks.pricing.description')}
              data={{ html: plan.description }}
              onChange={({ html }) => update({ ...plan, description: html })}
              minHeight={120}
              disabled={disabled}
            />
            <TextEditor
              label={t('blocks.pricing.features')}
              hint={t('blocks.pricing.featuresHint')}
              data={{ html: plan.features }}
              onChange={({ html }) => update({ ...plan, features: html })}
              minHeight={140}
              disabled={disabled}
            />
            <ToggleField
              label={t('blocks.pricing.highlight')}
              value={plan.highlight}
              onChange={highlight => update({ ...plan, highlight })}
              disabled={disabled}
            />
            {plan.highlight && (
              <TextField
                label={t('blocks.pricing.badge')}
                value={plan.badge}
                onChange={badge => update({ ...plan, badge })}
                max={30}
                placeholder={t('blocks.pricing.badgePlaceholder')}
                disabled={disabled}
              />
            )}
            <TextField
              label={t('blocks.field.buttonLabel')}
              value={plan.buttonLabel}
              onChange={buttonLabel => update({ ...plan, buttonLabel })}
              max={60}
              disabled={disabled}
            />
            <UrlField
              label={t('blocks.field.buttonUrl')}
              value={plan.buttonUrl}
              onChange={buttonUrl => update({ ...plan, buttonUrl })}
              disabled={disabled}
            />
          </>
        )}
      />
    </>
  );
};
