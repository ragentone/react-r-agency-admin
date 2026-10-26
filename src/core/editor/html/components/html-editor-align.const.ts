import { AlignCenterIcon, AlignJustifyIcon, AlignLeftIcon, AlignRightIcon } from 'lucide-react';

export const HTML_EDITOR_ALIGNMENTS = ['left', 'center', 'right', 'justify'] as const;
export type HtmlEditorAlignment = (typeof HTML_EDITOR_ALIGNMENTS)[number];

export const HTML_EDITOR_ALIGN_ICONS = {
  left: AlignLeftIcon,
  center: AlignCenterIcon,
  right: AlignRightIcon,
  justify: AlignJustifyIcon,
};

export const HTML_EDITOR_ALIGN_SHORTCUTS = {
  left: 'Mod-Shift-L',
  center: 'Mod-Shift-E',
  right: 'Mod-Shift-R',
  justify: 'Mod-Shift-J',
};

export const alignLabelKey = (align: HtmlEditorAlignment) =>
  `html.toolbar.align${align[0].toUpperCase()}${align.slice(1)}`;
