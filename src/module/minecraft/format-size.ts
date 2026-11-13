/** Dateigröße lesbar: unter 1 KB in B, unter 1 MB in KB, sonst in MB (Dezimalpunkt je Sprache). */
export function formatSize(bytes: number): string {
  if (bytes < 1000) return `${bytes} B`;
  if (bytes < 1e6) return `${Math.round(bytes / 1e3)} KB`;
  return `${(bytes / 1e6).toLocaleString(undefined, { maximumFractionDigits: 1 })} MB`;
}
