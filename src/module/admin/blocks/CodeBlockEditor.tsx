import {
  CodeEditor,
  CodeEditorContent,
  CodeEditorCopyButton,
  CodeEditorHeader,
  CodeEditorTitle,
} from '@ui/shad-cn/components/code-editor';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { ChoiceField, TextField } from './BlockFields';
import type { ICodeBlockData } from './types';

/** Same list as the backend schema (`code` block). */
const LANGUAGES = ['plain', 'javascript', 'typescript', 'json', 'html', 'css', 'bash', 'sql'];

export interface ICodeBlockEditorProps {
  data: ICodeBlockData;
  onChange: (data: ICodeBlockData) => void;
  disabled?: boolean;
}

/** Title, language and code of a code block. The code is highlighted while typing. */
export const CodeBlockEditor: React.FC<ICodeBlockEditorProps> = ({ data, onChange, disabled }) => {
  const { t } = useTranslation('admin');
  const set =
    <K extends keyof ICodeBlockData>(key: K) =>
    (value: ICodeBlockData[K]) =>
      onChange({ ...data, [key]: value });
  return (
    <>
      <TextField
        label={t('blocks.code.title')}
        value={data.title}
        onChange={set('title')}
        max={150}
        disabled={disabled}
      />
      <ChoiceField<string>
        label={t('blocks.code.language')}
        value={data.language}
        options={LANGUAGES}
        onChange={set('language')}
        text={value => value}
        disabled={disabled}
      />
      <div>
        <p className="mb-1.5 text-caption font-medium text-foreground">{t('blocks.code.code')}</p>
        {/* The editor needs a height: its text area fills the space left under the header. */}
        <CodeEditor
          value={data.code}
          language={data.language === 'plain' ? 'plaintext' : data.language}
          onValueChange={set('code')}
          className="h-64"
        >
          <CodeEditorHeader>
            <CodeEditorTitle>{data.title || data.language}</CodeEditorTitle>
            <CodeEditorCopyButton />
          </CodeEditorHeader>
          <CodeEditorContent
            label={t('blocks.code.code')}
            placeholder={t('blocks.code.code')}
            lineNumbers
          />
        </CodeEditor>
      </div>
    </>
  );
};
