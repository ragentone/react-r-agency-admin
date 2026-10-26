import { cn } from '@ui/lib/utils';
import {
  File,
  FileArchive,
  FileAudio,
  FileImage,
  FileSpreadsheet,
  FileText,
  FileVideo,
  Presentation,
} from 'lucide-react';
import React from 'react';

import type { FileKind } from '../types';
import { fileKind } from '../utils';

const ICONS: Record<FileKind, typeof File> = {
  image: FileImage,
  video: FileVideo,
  audio: FileAudio,
  pdf: FileText,
  sheet: FileSpreadsheet,
  slides: Presentation,
  archive: FileArchive,
  text: FileText,
  file: File,
};

export interface IFileKindIconProps {
  mimeType: string;
  extension: string;
  className?: string;
}

/** Square tile with an icon for the file type + the extension underneath. */
export const FileKindIcon: React.FC<IFileKindIconProps> = ({ mimeType, extension, className }) => {
  const Icon = ICONS[fileKind(mimeType, extension)];
  return (
    <span
      aria-hidden="true"
      className={cn(
        'flex size-12 shrink-0 flex-col items-center justify-center gap-0.5 rounded-xl bg-foreground/[0.06] text-foreground',
        className
      )}
    >
      <Icon className="size-5" strokeWidth={1.75} />
      {extension && (
        <span className="max-w-full truncate px-1 text-[0.625rem] leading-none font-bold tracking-wide uppercase opacity-70">
          {extension.slice(0, 4)}
        </span>
      )}
    </span>
  );
};
