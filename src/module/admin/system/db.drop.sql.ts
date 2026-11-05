import type { IDbUsageTable } from './types';

/** Backtick-quoted identifier; a backtick inside the name is doubled. */
const quote = (name: string) => `\`${name.replace(/`/g, '``')}\``;

/** `DROP TABLE` statements for the candidate tables. Only generated, never executed here. */
export const buildDropSql = (
  candidates: IDbUsageTable[],
  options: { database: string; generatedAt: string; header: string[] }
): string => {
  const lines = [
    `-- Datenbank: ${options.database}`,
    `-- Stand: ${options.generatedAt}`,
    ...options.header.map(line => `-- ${line}`),
    '',
  ];
  for (const table of candidates) {
    lines.push(`-- ${table.name} (${table.rows} Zeilen)`);
    lines.push(`DROP TABLE IF EXISTS ${quote(table.name)};`, '');
  }
  return lines.join('\n');
};
