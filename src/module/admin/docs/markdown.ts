import DOMPurify from 'dompurify';
import { marked } from 'marked';

/** Markdown of a runtime doc → sanitized HTML (headings, lists, tables, code, links). */
export const renderDocHtml = (content: string): string =>
  DOMPurify.sanitize(marked.parse(content, { async: false, gfm: true }) as string);
