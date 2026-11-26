import { LazyHtmlEditor as HtmlEditor } from '@core/editor/html/lazy.html-editor.tsx';
import React, { useId } from 'react';
import { useTranslation } from 'react-i18next';

import type { ITextBlockData } from './types';

/** Rich text editor of the `text` block (also used inside tabs). */
export const TextEditor: React.FC<{
  data: ITextBlockData;
  onChange: (data: ITextBlockData) => void;
  disabled?: boolean;
  /** Default: "Text". */
  label?: string;
  hint?: string;
  minHeight?: number;
}> = ({ data, onChange, disabled, label, hint, minHeight = 180 }) => {
  const { t } = useTranslation('admin');
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-caption font-medium text-foreground">
        {label ?? t('blocks.field.text')}
      </label>
      <HtmlEditor
        id={id}
        value={data.html}
        onChange={html => onChange({ html })}
        placeholder={t('pages.form.contentPlaceholder')}
        headingLevels={[2, 3, 4]}
        features={{
          preset: 'basic',
          emoji: false,
          highlight: true,
          code: true,
          codeBlock: true,
          textAlign: true,
          horizontalRule: true,
        }}
        editable={!disabled}
        minHeight={minHeight}
        stickyToolbar
        className="rounded-xl"
      />
      {hint && <p className="mt-1 text-caption text-muted-foreground">{hint}</p>}
    </div>
  );
};
