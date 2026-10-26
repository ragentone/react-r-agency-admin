import { PageBlockManager } from '@core/blocks/manager.ts';
import type { PageBlockField } from '@core/blocks/types.ts';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { TextEditor } from './BlockEditors.shared';
import {
  ChoiceField,
  ItemsField,
  TextAreaField,
  TextField,
  ToggleField,
  UrlField,
} from './BlockFields';
import { HeroEditor } from './HeroBlockEditor';
import { ImageField } from './ImageField';
import { CountdownEditor, StatsEditor, StepsEditor, TabsEditor } from './LayoutBlockEditors';
import { CardsBlockEditor, ImageBlockEditor, SplitBlockEditor } from './MediaBlockEditors';
import { TableEditor } from './TableBlockEditor';
import {
  emptyFaqItem,
  type IAppBlock,
  isAppBlock,
  type ISitePageBlockDataMap,
  type PageBlock,
  SITE_PAGE_FAQ_MAX,
  type SitePageBlockType,
  videoEmbed,
} from './types';

type EditorProps<T extends SitePageBlockType> = {
  data: ISitePageBlockDataMap[T];
  onChange: (data: ISitePageBlockDataMap[T]) => void;
  disabled?: boolean;
};

/** `set('title')(value)` → new data object. */
const fieldSetter = <T extends object>(data: T, onChange: (data: T) => void) =>
  function set<K extends keyof T>(key: K) {
    return (value: T[K]) => onChange({ ...data, [key]: value });
  };

const NoticeEditor: React.FC<EditorProps<'notice'>> = ({ data, onChange, disabled }) => {
  const { t } = useTranslation('admin');
  const set = fieldSetter(data, onChange);
  return (
    <>
      <ChoiceField
        label={t('blocks.field.tone')}
        value={data.tone}
        options={['info', 'success', 'warning', 'danger'] as const}
        onChange={set('tone')}
        text={value => t(`blocks.notice.tone.${value}`)}
        disabled={disabled}
      />
      <TextField
        label={t('blocks.field.title')}
        value={data.title}
        onChange={set('title')}
        max={150}
        disabled={disabled}
      />
      <TextAreaField
        label={t('blocks.field.text')}
        value={data.text}
        onChange={set('text')}
        max={1000}
        disabled={disabled}
      />
    </>
  );
};

const CtaEditor: React.FC<EditorProps<'cta'>> = ({ data, onChange, disabled }) => {
  const { t } = useTranslation('admin');
  const set = fieldSetter(data, onChange);
  return (
    <>
      <ChoiceField
        label={t('blocks.field.style')}
        value={data.variant}
        options={['brand', 'muted'] as const}
        onChange={set('variant')}
        text={value => t(`blocks.hero.variant.${value}`)}
        disabled={disabled}
      />
      <TextField
        label={t('blocks.field.title')}
        value={data.title}
        onChange={set('title')}
        max={150}
        disabled={disabled}
      />
      <TextAreaField
        label={t('blocks.field.text')}
        value={data.text}
        onChange={set('text')}
        max={500}
        disabled={disabled}
      />
      <TextField
        label={t('blocks.cta.primaryLabel')}
        value={data.primaryLabel}
        onChange={set('primaryLabel')}
        max={60}
        disabled={disabled}
      />
      <UrlField
        label={t('blocks.cta.primaryUrl')}
        value={data.primaryUrl}
        onChange={set('primaryUrl')}
        disabled={disabled}
      />
      <TextField
        label={t('blocks.cta.secondaryLabel')}
        value={data.secondaryLabel}
        onChange={set('secondaryLabel')}
        max={60}
        disabled={disabled}
      />
      <UrlField
        label={t('blocks.cta.secondaryUrl')}
        value={data.secondaryUrl}
        onChange={set('secondaryUrl')}
        disabled={disabled}
      />
    </>
  );
};

const FaqEditor: React.FC<EditorProps<'faq'>> = ({ data, onChange, disabled }) => {
  const { t } = useTranslation('admin');
  const set = fieldSetter(data, onChange);
  return (
    <>
      <TextField
        label={t('blocks.field.heading')}
        value={data.title}
        onChange={set('title')}
        max={150}
        disabled={disabled}
      />
      <ItemsField
        label={t('blocks.faq.items')}
        items={data.items}
        onChange={set('items')}
        create={emptyFaqItem}
        max={SITE_PAGE_FAQ_MAX}
        title={item => item.question || t('blocks.faq.item')}
        addLabel={t('blocks.faq.add')}
        disabled={disabled}
        render={(item, update) => (
          <>
            <TextField
              label={t('blocks.faq.question')}
              value={item.question}
              onChange={question => update({ ...item, question })}
              max={300}
              disabled={disabled}
            />
            <TextAreaField
              label={t('blocks.faq.answer')}
              value={item.answer}
              onChange={answer => update({ ...item, answer })}
              max={3000}
              rows={4}
              disabled={disabled}
            />
          </>
        )}
      />
    </>
  );
};

const QuoteEditor: React.FC<EditorProps<'quote'>> = ({ data, onChange, disabled }) => {
  const { t } = useTranslation('admin');
  const set = fieldSetter(data, onChange);
  return (
    <>
      <TextAreaField
        label={t('blocks.quote.text')}
        value={data.text}
        onChange={set('text')}
        max={1000}
        rows={4}
        disabled={disabled}
      />
      <TextField
        label={t('blocks.quote.author')}
        value={data.author}
        onChange={set('author')}
        max={120}
        disabled={disabled}
      />
      <TextField
        label={t('blocks.quote.role')}
        value={data.role}
        onChange={set('role')}
        max={120}
        disabled={disabled}
      />
    </>
  );
};

const VideoEditor: React.FC<EditorProps<'video'>> = ({ data, onChange, disabled }) => {
  const { t } = useTranslation('admin');
  const set = fieldSetter(data, onChange);
  const invalid = Boolean(data.url.trim()) && !videoEmbed(data.url);
  return (
    <>
      <div>
        <TextField
          label={t('blocks.video.url')}
          value={data.url}
          onChange={set('url')}
          max={500}
          placeholder="https://www.youtube.com/watch?v=…"
          disabled={disabled}
        />
        <p
          className={
            invalid
              ? 'mt-1 text-caption text-destructive'
              : 'mt-1 text-caption text-muted-foreground'
          }
        >
          {invalid ? t('blocks.video.invalid') : t('blocks.video.hint')}
        </p>
      </div>
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

const DividerEditor: React.FC<EditorProps<'divider'>> = ({ data, onChange, disabled }) => {
  const { t } = useTranslation('admin');
  const set = fieldSetter(data, onChange);
  return (
    <>
      <ChoiceField
        label={t('blocks.field.style')}
        value={data.variant}
        options={['line', 'space'] as const}
        onChange={set('variant')}
        text={value => t(`blocks.divider.variant.${value}`)}
        disabled={disabled}
      />
      <ChoiceField
        label={t('blocks.field.spacing')}
        value={data.size}
        options={['sm', 'md', 'lg'] as const}
        onChange={set('size')}
        text={value => t(`blocks.size.${value}`)}
        disabled={disabled}
      />
    </>
  );
};

/** One editor field of an app block (declared in `Core.blocks.register({ fields })`). */
const AppField: React.FC<{
  field: PageBlockField;
  value: unknown;
  onChange: (value: unknown) => void;
  disabled?: boolean;
}> = ({ field, value, onChange, disabled }) => {
  const { t } = useTranslation('admin');
  const label = t(field.label, { defaultValue: field.label });
  const text = typeof value === 'string' ? value : '';
  switch (field.kind) {
    case 'text':
      return (
        <TextField
          label={label}
          hint={field.hint ? t(field.hint, { defaultValue: field.hint }) : undefined}
          value={text}
          onChange={onChange}
          max={field.max}
          placeholder={field.placeholder}
          disabled={disabled}
        />
      );
    case 'textarea':
      return (
        <TextAreaField
          label={label}
          hint={field.hint ? t(field.hint, { defaultValue: field.hint }) : undefined}
          value={text}
          onChange={onChange}
          max={field.max}
          rows={field.rows}
          disabled={disabled}
        />
      );
    case 'url':
      return <UrlField label={label} value={text} onChange={onChange} disabled={disabled} />;
    case 'image':
      return (
        <ImageField
          label={label}
          hint={field.hint ? t(field.hint, { defaultValue: field.hint }) : undefined}
          value={text}
          onChange={onChange}
          disabled={disabled}
        />
      );
    case 'choice': {
      const options = field.options.map(option => option.value);
      return (
        <ChoiceField
          label={label}
          value={options.includes(text) ? text : (options[0] ?? '')}
          options={options}
          onChange={onChange}
          text={option => {
            const entry = field.options.find(item => item.value === option);
            return entry ? t(entry.label, { defaultValue: entry.label }) : option;
          }}
          disabled={disabled}
        />
      );
    }
    case 'toggle':
      return (
        <ToggleField
          label={label}
          hint={field.hint ? t(field.hint, { defaultValue: field.hint }) : undefined}
          value={value === true}
          onChange={onChange}
          disabled={disabled}
        />
      );
    default:
      return null;
  }
};

/** Settings of an app block – generic form from its registered `fields`. */
const AppBlockEditor: React.FC<{
  block: IAppBlock;
  onChange: (block: IAppBlock) => void;
  disabled?: boolean;
}> = ({ block, onChange, disabled }) => {
  const { t } = useTranslation('admin');
  const definition = PageBlockManager.get(block.type);
  if (!definition) {
    return <p className="text-caption text-muted-foreground">{t('blocks.appMissing')}</p>;
  }
  if (!definition.fields.length) {
    return <p className="text-caption text-muted-foreground">{t('blocks.appNoSettings')}</p>;
  }
  return (
    <>
      {definition.fields.map(field => (
        <AppField
          key={field.key}
          field={field}
          value={block.data[field.key]}
          onChange={value => onChange({ ...block, data: { ...block.data, [field.key]: value } })}
          disabled={disabled}
        />
      ))}
    </>
  );
};

/** Form of one block (fields depend on its type). */
export const BlockEditor: React.FC<{
  block: PageBlock;
  onChange: (block: PageBlock) => void;
  disabled?: boolean;
}> = ({ block, onChange, disabled }) => {
  const props = { disabled };
  if (isAppBlock(block)) {
    return <AppBlockEditor block={block} onChange={onChange} disabled={disabled} />;
  }
  switch (block.type) {
    case 'hero':
      return (
        <HeroEditor {...props} data={block.data} onChange={data => onChange({ ...block, data })} />
      );
    case 'text':
      return (
        <TextEditor {...props} data={block.data} onChange={data => onChange({ ...block, data })} />
      );
    case 'image':
      return (
        <ImageBlockEditor
          {...props}
          data={block.data}
          onChange={data => onChange({ ...block, data })}
        />
      );
    case 'split':
      return (
        <SplitBlockEditor
          {...props}
          data={block.data}
          onChange={data => onChange({ ...block, data })}
        />
      );
    case 'cards':
      return (
        <CardsBlockEditor
          {...props}
          data={block.data}
          onChange={data => onChange({ ...block, data })}
        />
      );
    case 'notice':
      return (
        <NoticeEditor
          {...props}
          data={block.data}
          onChange={data => onChange({ ...block, data })}
        />
      );
    case 'cta':
      return (
        <CtaEditor {...props} data={block.data} onChange={data => onChange({ ...block, data })} />
      );
    case 'faq':
      return (
        <FaqEditor {...props} data={block.data} onChange={data => onChange({ ...block, data })} />
      );
    case 'quote':
      return (
        <QuoteEditor {...props} data={block.data} onChange={data => onChange({ ...block, data })} />
      );
    case 'video':
      return (
        <VideoEditor {...props} data={block.data} onChange={data => onChange({ ...block, data })} />
      );
    case 'divider':
      return (
        <DividerEditor
          {...props}
          data={block.data}
          onChange={data => onChange({ ...block, data })}
        />
      );
    case 'stats':
      return (
        <StatsEditor {...props} data={block.data} onChange={data => onChange({ ...block, data })} />
      );
    case 'steps':
      return (
        <StepsEditor {...props} data={block.data} onChange={data => onChange({ ...block, data })} />
      );
    case 'tabs':
      return (
        <TabsEditor {...props} data={block.data} onChange={data => onChange({ ...block, data })} />
      );
    case 'table':
      return (
        <TableEditor {...props} data={block.data} onChange={data => onChange({ ...block, data })} />
      );
    case 'countdown':
      return (
        <CountdownEditor
          {...props}
          data={block.data}
          onChange={data => onChange({ ...block, data })}
        />
      );
    default:
      return null;
  }
};
