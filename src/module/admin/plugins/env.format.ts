/** Runtime env files at the root of a plugin project. */
export const ENV_FILE_PATHS = ['.env', '.env.dev', '.env.prod'];

export const isEnvPath = (path: string): boolean => ENV_FILE_PATHS.includes(path);

export interface IEnvRow {
  key: string;
  value: string;
}

const LINE = /^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/;

const unquote = (raw: string): string => {
  const value = raw.trim();
  const quote = value[0];
  if (value.length >= 2 && (quote === '"' || quote === "'") && value.endsWith(quote)) {
    const inner = value.slice(1, -1);
    return quote === '"' ? inner.replace(/\\"/g, '"').replace(/\\\\/g, '\\') : inner;
  }
  return value.replace(/\s+#.*$/, '').trim();
};

/** Key/value lines of an env file. Comments and other lines are not kept. */
export const parseEnv = (content: string): IEnvRow[] =>
  content.split(/\r?\n/).flatMap(line => {
    const match = LINE.exec(line);
    return match ? [{ key: match[1], value: unquote(match[2]) }] : [];
  });

const quote = (value: string): string =>
  /[\s#"'\\]/.test(value) ? `"${value.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"` : value;

/** Writes the rows back as env lines. Rows without a key are skipped. */
export const serializeEnv = (rows: IEnvRow[]): string => {
  const lines = rows
    .filter(row => row.key.trim() !== '')
    .map(row => `${row.key.trim()}=${quote(row.value)}`);
  return lines.length > 0 ? lines.join('\n') + '\n' : '';
};
