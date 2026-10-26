import { LazyHtmlEditor as HtmlEditor } from '@core/editor/html/lazy.html-editor.tsx';
import React, { useId } from 'react';
import { useTranslation } from 'react-i18next';

import type { ITextBlockData } from './types';

/** Rich text editor of the `text` block (also used inside tabs). */
export const TextEditor: React.FC<{
  data: ITextBlockData;
  onChange: (data: ITextBlockData) => void;
  disabled?: boolean;
}> = ({ data, onChange, disabled }) => {
  const { t } = useTranslation('admin');
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-caption font-medium text-foreground">
        {t('blocks.field.text')}
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
        minHeight={180}
        stickyToolbar
        className="rounded-xl"
      />
    </div>
  );
};
