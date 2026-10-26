import type { FileKind } from './types';

/** 1536 → "1,5 KB" (UI language). */
export const formatBytes = (bytes: number, lang?: string): string => {
  if (!Number.isFinite(bytes) || bytes <= 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / 1024 ** index;
  const formatted = new Intl.NumberFormat(lang, {
    maximumFractionDigits: index === 0 || value >= 100 ? 0 : 1,
  }).format(value);
  return `${formatted} ${units[index]}`;
};

/** Date in the UI language ("12. Okt. 2026"). */
export const formatDate = (value: string | null | undefined, lang?: string): string => {
  if (!value) return '';
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? ''
    : new Intl.DateTimeFormat(lang, { day: '2-digit', month: 'short', year: 'numeric' }).format(
        date
      );
};

const EXTENSION_KIND: Record<string, FileKind> = {
  pdf: 'pdf',
  xls: 'sheet',
  xlsx: 'sheet',
  ods: 'sheet',
  csv: 'sheet',
  ppt: 'slides',
  pptx: 'slides',
  odp: 'slides',
  zip: 'archive',
  rar: 'archive',
  '7z': 'archive',
  gz: 'archive',
  tar: 'archive',
  doc: 'text',
  docx: 'text',
  odt: 'text',
  rtf: 'text',
  txt: 'text',
  md: 'text',
  json: 'text',
};

/** Rough kind of a file (icon) from mime type / extension. */
export const fileKind = (mimeType: string, extension: string): FileKind => {
  const ext = extension.toLowerCase();
  if (EXTENSION_KIND[ext]) return EXTENSION_KIND[ext];
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType.startsWith('video/')) return 'video';
  if (mimeType.startsWith('audio/')) return 'audio';
  if (mimeType.startsWith('text/')) return 'text';
  return 'file';
};

/** "report.final.PDF" → "pdf" */
export const fileExtension = (name: string): string => {
  const index = name.lastIndexOf('.');
  return index > 0 ? name.slice(index + 1).toLowerCase() : '';
};

/** Title suggestion from a file name: "quarterly_report-2026.pdf" → "quarterly report 2026". */
export const titleFromFileName = (name: string): string => {
  const index = name.lastIndexOf('.');
  return (index > 0 ? name.slice(0, index) : name).replace(/[_-]+/g, ' ').trim();
};

/** Copies text – falls back to a hidden textarea where the clipboard API isn't allowed. */
export const copyText = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const area = document.createElement('textarea');
    area.value = text;
    area.setAttribute('readonly', '');
    area.style.position = 'fixed';
    area.style.opacity = '0';
    document.body.appendChild(area);
    area.select();
    const ok = document.execCommand('copy');
    area.remove();
    return ok;
  }
};
