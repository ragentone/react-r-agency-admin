import {
  getNamedType,
  type GraphQLArgument,
  type GraphQLField,
  type GraphQLInputField,
  type GraphQLNamedType,
  type GraphQLObjectType,
  type GraphQLSchema,
  type GraphQLType,
  isEnumType,
  isInputObjectType,
  isInterfaceType,
  isObjectType,
  isScalarType,
  isUnionType,
} from 'graphql';

import { createNameRegistry, type INameEntry, schemaTypes } from './generator.ts';
import type { IResolvedGraphqlTypesOptions } from './types.ts';

interface INode {
  label: string;
  children: INode[];
}

type TreeField = GraphQLField<unknown, unknown> | GraphQLInputField | GraphQLArgument;

const KIND_LABEL: Record<string, string> = {
  object: 'Object',
  interface: 'Interface',
  union: 'Union',
  input: 'Input',
  enum: 'Enum',
  scalar: 'Scalar',
};

function kindOf(type: GraphQLNamedType): keyof typeof KIND_LABEL {
  if (isObjectType(type)) return 'object';
  if (isInterfaceType(type)) return 'interface';
  if (isUnionType(type)) return 'union';
  if (isInputObjectType(type)) return 'input';
  if (isEnumType(type)) return 'enum';
  return 'scalar';
}

/** GitHub-style heading anchor. */
const anchor = (text: string) =>
  text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');

/** First sentence, max. 80 chars, safe for a table cell. */
const shortDescription = (text: string) => {
  const flat = text.replace(/\s+/g, ' ').trim();
  const sentence = flat.split(/(?<=\.)\s/)[0];
  const short = sentence.length > 80 ? `${sentence.slice(0, 79).trimEnd()}…` : sentence;
  return short.replace(/\|/g, '\\|');
};

/** Renders nodes as an ASCII tree (`├──`, `└──`, `│`). */
function renderNodes(nodes: INode[], prefix = ''): string[] {
  return nodes.flatMap((node, i) => {
    const last = i === nodes.length - 1;
    return [
      `${prefix}${last ? '└── ' : '├── '}${node.label}`,
      ...renderNodes(node.children, prefix + (last ? '    ' : '│   ')),
    ];
  });
}

/**
 * Builds a Markdown file with the structure of the schema:
 * - one tree per root type (Query / Mutation / Subscription): operation → `$arguments` → result fields
 * - a tree of all input types
 * - an index table GraphQL type → kind → generated TS name → file
 */
export function generateTree(
  schema: GraphQLSchema,
  options: IResolvedGraphqlTypesOptions,
  source: string
): string {
  const depth = options.tree ? options.tree.depth : 3;
  const registry = createNameRegistry(schema, options);
  const types = schemaTypes(schema);

  const tsHint = (type: GraphQLNamedType) => {
    const entry: INameEntry | undefined = registry.get(type.name);
    return entry && !isScalarType(type) ? `  ‹${entry.tsName}›` : '';
  };

  const fieldFlags = (field: TreeField) => {
    const flags: string[] = [];
    if ('defaultValue' in field && field.defaultValue !== undefined) {
      flags.push(`= ${JSON.stringify(field.defaultValue)}`);
    }
    if (field.deprecationReason != null) flags.push('⚠ deprecated');
    return flags.length ? `  ${flags.join('  ')}` : '';
  };

  /** Children of a (named) type, expanded up to `depth`, cycles marked with ↻. */
  function expand(type: GraphQLNamedType, level: number, path: string[]): INode[] {
    if (isEnumType(type) || isScalarType(type)) return [];
    if (path.includes(type.name)) return [{ label: `↻ ${type.name} (recursive)`, children: [] }];
    if (level >= depth) return [{ label: '…', children: [] }];
    const nextPath = [...path, type.name];

    if (isUnionType(type)) {
      return type.getTypes().map(member => ({
        label: `… on ${member.name}${tsHint(member)}`,
        children: expand(member, level + 1, nextPath),
      }));
    }
    if (isObjectType(type) || isInterfaceType(type) || isInputObjectType(type)) {
      return Object.values(type.getFields()).map(field =>
        fieldNode(field, field.name, level + 1, nextPath)
      );
    }
    return [];
  }

  function typeLabel(type: GraphQLType): string {
    const named = getNamedType(type);
    const values = isEnumType(named)
      ? `  (${named
          .getValues()
          .map(v => v.name)
          .join(' | ')})`
      : '';
    return `${String(type)}${values}${tsHint(named)}`;
  }

  function fieldNode(field: TreeField, name: string, level: number, path: string[]): INode {
    const args: INode[] =
      'args' in field ? field.args.map(arg => fieldNode(arg, `$${arg.name}`, level, path)) : [];
    return {
      label: `${name}: ${typeLabel(field.type)}${fieldFlags(field)}`,
      children: [...args, ...expand(getNamedType(field.type), level, path)],
    };
  }

  // ---------------------------------------------------------------- sections
  const roots = [
    schema.getQueryType(),
    schema.getMutationType(),
    schema.getSubscriptionType(),
  ].filter((t): t is GraphQLObjectType => !!t);
  const rootNames = new Set(roots.map(r => r.name));
  const inputs = types.filter(isInputObjectType);

  const count = (kind: string) =>
    types.filter(t => kindOf(t) === kind && !rootNames.has(t.name)).length;

  const lines: string[] = [
    '# GraphQL Schema – Struktur',
    '',
    `> Automatisch generiert von \`vite/graphql\` (graphqlTypesPlugin) aus \`${source}\`.`,
    '> Nicht von Hand bearbeiten – die Datei wird bei jeder Schema-Änderung neu geschrieben.',
    '',
    '**Legende:** `$arg` = Argument · `‹IName›` = generiertes TS-Interface · `!` = Pflichtfeld · ' +
      '`[T]` = Liste · `↻` = rekursiver Typ · `…` = Tiefe erreicht ' +
      `(\`tree.depth\` = ${depth})`,
    '',
    '| Bereich | Anzahl |',
    '| --- | ---: |',
    ...roots.map(r => `| [${r.name}](#${anchor(r.name)}) | ${Object.keys(r.getFields()).length} |`),
    `| Object-Types | ${count('object')} |`,
    `| Interfaces | ${count('interface')} |`,
    `| Unions | ${count('union')} |`,
    `| [Inputs](#inputs) | ${count('input')} |`,
    `| Enums | ${count('enum')} |`,
    `| Scalars | ${count('scalar')} |`,
    '',
  ];

  for (const root of roots) {
    const fields = Object.values(root.getFields()).sort((a, b) => a.name.localeCompare(b.name));
    lines.push(
      `## ${root.name}`,
      '',
      '```text',
      `${root.name}${tsHint(root)}`,
      ...renderNodes(fields.map(f => fieldNode(f, f.name, 0, [root.name]))),
      '```',
      ''
    );
  }

  if (inputs.length) {
    lines.push(
      '## Inputs',
      '',
      '```text',
      'Inputs',
      ...renderNodes(
        inputs.map(input => ({
          label: `${input.name}${tsHint(input)}`,
          children: expand(input, 0, []),
        }))
      ),
      '```',
      ''
    );
  }

  lines.push(
    '## Typen-Index',
    '',
    '| GraphQL | Art | TypeScript | Datei | Beschreibung |',
    '| --- | --- | --- | --- | --- |',
    ...types.map(type => {
      const entry = registry.get(type.name);
      const ts = entry ? `\`${entry.tsName}\`` : '–';
      const file = entry ? `\`${entry.file}.ts\`` : 'built-in';
      return `| \`${type.name}\` | ${KIND_LABEL[kindOf(type)]} | ${ts} | ${file} | ${shortDescription(type.description ?? '')} |`;
    }),
    ''
  );

  return lines.join('\n');
}
