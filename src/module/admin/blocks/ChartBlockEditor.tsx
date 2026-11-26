import React from 'react';
import { useTranslation } from 'react-i18next';

import { ChoiceField, ItemsField, NumberField, TextField, ToggleField } from './BlockFields';
import { CHART_KINDS, emptyChartPoint, type IChartBlockData, SITE_PAGE_CHART_MAX } from './types';

interface IProps {
  data: IChartBlockData;
  onChange: (data: IChartBlockData) => void;
  disabled?: boolean;
}

/** One data series (label + value per point); bars, line or pie. */
export const ChartBlockEditor: React.FC<IProps> = ({ data, onChange, disabled }) => {
  const { t } = useTranslation('admin');
  const set =
    <K extends keyof IChartBlockData>(key: K) =>
    (value: IChartBlockData[K]) =>
      onChange({ ...data, [key]: value });
  return (
    <>
      <TextField
        label={t('blocks.field.heading')}
        value={data.title}
        onChange={set('title')}
        max={150}
        disabled={disabled}
      />
      <ChoiceField
        label={t('blocks.chart.kind')}
        value={data.kind}
        options={CHART_KINDS}
        onChange={set('kind')}
        text={value => t(`blocks.chart.kinds.${value}`)}
        disabled={disabled}
      />
      <TextField
        label={t('blocks.chart.unit')}
        hint={t('blocks.chart.unitHint')}
        value={data.unit}
        onChange={set('unit')}
        max={12}
        placeholder="%"
        disabled={disabled}
      />
      <ToggleField
        label={t('blocks.chart.showValues')}
        value={data.showValues}
        onChange={set('showValues')}
        disabled={disabled}
      />
      <ItemsField
        label={t('blocks.chart.items')}
        items={data.items}
        onChange={set('items')}
        create={emptyChartPoint}
        max={SITE_PAGE_CHART_MAX}
        title={item => item.label || t('blocks.chart.item')}
        addLabel={t('blocks.chart.add')}
        disabled={disabled}
        render={(item, update) => (
          <>
            <TextField
              label={t('blocks.chart.label')}
              value={item.label}
              onChange={label => update({ ...item, label })}
              max={40}
              disabled={disabled}
            />
            <NumberField
              label={t('blocks.chart.value')}
              value={item.value}
              onChange={value => update({ ...item, value })}
              min={-1000000000}
              max={1000000000}
              decimals={2}
              disabled={disabled}
            />
          </>
        )}
      />
      <TextField
        label={t('blocks.field.caption')}
        value={data.caption}
        onChange={set('caption')}
        max={300}
        disabled={disabled}
      />
    </>
  );
};
