import React, { useMemo } from 'react';

import { renderDocHtml } from '../markdown';
import type { IAdminDoc } from '../types';

/* Typography for the rendered Markdown – only the defined text sizes, black/white tokens. */
const PROSE = [
  'w-full pb-6 text-body text-foreground',
  '[&_h1]:mt-2 [&_h1]:mb-3 [&_h1]:text-display [&_h1]:font-bold',
  '[&_h2]:mt-6 [&_h2]:mb-2 [&_h2]:text-title [&_h2]:font-bold',
  '[&_h3]:mt-4 [&_h3]:mb-1 [&_h3]:font-bold',
  '[&_h4]:mt-4 [&_h4]:mb-1 [&_h4]:font-bold',
  '[&_p]:my-3 [&_ul]:my-3 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:my-3 [&_ol]:list-decimal [&_ol]:pl-5',
  '[&_li]:my-1 [&_strong]:font-bold',
  '[&_a]:underline [&_a]:underline-offset-4 [&_a]:break-words',
  '[&_code]:rounded [&_code]:bg-muted [&_code]:px-1 [&_code]:text-caption',
  '[&_pre]:my-3 [&_pre]:overflow-x-auto [&_pre]:rounded-xl [&_pre]:border [&_pre]:border-border [&_pre]:bg-muted [&_pre]:p-3 [&_pre]:text-caption',
  '[&_pre_code]:bg-transparent [&_pre_code]:p-0',
  '[&_table]:my-3 [&_table]:block [&_table]:w-full [&_table]:overflow-x-auto [&_table]:text-caption',
  '[&_th]:border [&_th]:border-border [&_th]:px-2 [&_th]:py-1 [&_th]:text-left [&_th]:font-bold',
  '[&_td]:border [&_td]:border-border [&_td]:px-2 [&_td]:py-1 [&_td]:align-top',
  '[&_blockquote]:my-3 [&_blockquote]:border-l-2 [&_blockquote]:border-border [&_blockquote]:pl-3 [&_blockquote]:text-muted-foreground',
  '[&_hr]:my-6 [&_hr]:border-border',
].join(' ');

/** One doc rendered as Markdown (inside the drawer). */
export const AdminDocView: React.FC<{ doc: IAdminDoc }> = ({ doc }) => {
  const html = useMemo(() => renderDocHtml(doc.content), [doc.content]);
  return <article className={PROSE} dangerouslySetInnerHTML={{ __html: html }} />;
};
