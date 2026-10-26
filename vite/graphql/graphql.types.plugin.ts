import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

import { glob, hasMagic } from 'glob';
import {
  buildClientSchema,
  buildSchema,
  getIntrospectionQuery,
  type GraphQLSchema,
  type IntrospectionQuery,
} from 'graphql';
import type { Plugin, ViteDevServer } from 'vite';

import { generateTypes } from './generator.ts';
import { generateTree } from './tree.ts';
import type { IGraphqlTypesOptions, IResolvedGraphqlTypesOptions } from './types.ts';

const TAG = '--- [GRAPHQL-TYPES]';
const SDL_EXT = /\.(graphql|graphqls|gql)$/i;
const SCHEMA_EXT = /\.(graphql|graphqls|gql|json)$/i;
const isUrl = (source: string) => /^https?:\/\//i.test(source);

function resolveOptions(options: IGraphqlTypesOptions): IResolvedGraphqlTypesOptions {
  const schema = options.schema ?? './generated/schema.graphql';
  return {
    schema: Array.isArray(schema) ? schema : [schema],
    outDir: options.outDir ?? './lib/types',
    headers: options.headers ?? {},
    prefix: options.prefix ?? 'I',
    scalars: options.scalars ?? {},
    defaultScalarType: options.defaultScalarType ?? 'any',
    maybeValue: options.maybeValue ?? 'T | null',
    inputMaybeValue: options.inputMaybeValue ?? 'T | null | undefined',
    optionalInputFields: options.optionalInputFields ?? true,
    optionalOutputFields: options.optionalOutputFields ?? false,
    typename: options.typename ?? false,
    args: options.args ?? true,
    prettier: options.prettier ?? true,
    watch: options.watch ?? true,
    failOnError: options.failOnError ?? false,
    tree:
      options.tree === false
        ? false
        : {
            file: 'SCHEMA.md',
            depth: 3,
            ...(typeof options.tree === 'object' ? options.tree : {}),
          },
  };
}

/**
 * Generates TypeScript interfaces from the GraphQL schema into `outDir` (default `lib/types`):
 * `scalars.ts`, `enums.ts`, `inputs.ts`, `objects.ts`, `args.ts`, an `index.ts` and a Markdown
 * structure tree of the schema (`SCHEMA.md`, option `tree`).
 *
 * Runs on `vite build` / `vite dev` start and – in dev – again whenever a schema file changes.
 * Files are only written when their content actually changed (no needless HMR / git noise).
 */
export function graphqlTypesPlugin(userOptions: IGraphqlTypesOptions = {}): Plugin {
  const options = resolveOptions(userOptions);
  let root = process.cwd();
  let isBuild = false;

  /** Last generated schema fingerprint → skip identical runs. */
  let lastSdlHash = '';
  let running: Promise<void> | null = null;
  let queued = false;
  let timer: ReturnType<typeof setTimeout> | undefined;

  const abs = (p: string) => (path.isAbsolute(p) ? p : path.resolve(root, p));
  const fileSources = () => options.schema.filter(s => !isUrl(s));

  async function schemaFiles(): Promise<string[]> {
    const files = await glob(
      fileSources().map(s => abs(s).split(path.sep).join('/')),
      {
        absolute: true,
        nodir: true,
      }
    );
    return files.filter(f => SCHEMA_EXT.test(f)).sort();
  }

  async function loadSchema(): Promise<{ schema: GraphQLSchema; fingerprint: string } | null> {
    const sdlParts: string[] = [];
    const introspections: IntrospectionQuery[] = [];

    for (const file of await schemaFiles()) {
      const content = readFileSync(file, 'utf8');
      if (SDL_EXT.test(file)) {
        sdlParts.push(content);
      } else {
        const json = JSON.parse(content);
        introspections.push(json.data ?? json);
      }
    }

    for (const url of options.schema.filter(isUrl)) {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'content-type': 'application/json', ...options.headers },
        body: JSON.stringify({ query: getIntrospectionQuery({ descriptions: true }) }),
      });
      if (!response.ok) throw new Error(`${url} → HTTP ${response.status}`);
      const json = (await response.json()) as {
        data: IntrospectionQuery;
        errors?: { message: string }[];
      };
      if (json.errors?.length) throw new Error(`${url} → ${json.errors[0].message}`);
      introspections.push(json.data);
    }

    if (sdlParts.length && introspections.length) {
      throw new Error('Mixing SDL files and introspection sources is not supported.');
    }
    if (introspections.length > 1) {
      throw new Error('Only one introspection source (json file / url) is supported.');
    }

    if (introspections.length) {
      const fingerprint = JSON.stringify(introspections[0]);
      return { schema: buildClientSchema(introspections[0]), fingerprint };
    }
    if (sdlParts.length) {
      const sdl = sdlParts.join('\n\n');
      return { schema: buildSchema(sdl, { assumeValidSDL: false }), fingerprint: sdl };
    }
    return null;
  }

  async function format(code: string, file: string): Promise<string> {
    if (!options.prettier) return code;
    try {
      const prettier = await import('prettier');
      const config = (await prettier.resolveConfig(file)) ?? {};
      return await prettier.format(code, { ...config, filepath: file });
    } catch {
      return code;
    }
  }

  async function generate(reason: string, force = false): Promise<void> {
    const started = Date.now();
    const outDir = abs(options.outDir);
    try {
      const loaded = await loadSchema();
      if (!loaded) {
        console.warn(`${TAG} no schema found (${options.schema.join(', ')}) – skipped`);
        return;
      }
      const fingerprint = `${loaded.fingerprint.length}:${hash(loaded.fingerprint)}`;
      if (!force && fingerprint === lastSdlHash) return;

      const files = generateTypes(loaded.schema, options);
      if (options.tree) {
        const source = options.schema
          .map(s => (isUrl(s) ? s : path.relative(root, abs(s)) || s))
          .join(', ');
        files[options.tree.file] = generateTree(loaded.schema, options, source);
      }
      if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });

      const written: string[] = [];
      for (const [name, raw] of Object.entries(files)) {
        const file = path.join(outDir, name);
        const code = await format(raw, file);
        const current = existsSync(file) ? readFileSync(file, 'utf8') : null;
        if (current !== code) {
          writeFileSync(file, code, 'utf8');
          written.push(name);
        }
      }
      lastSdlHash = fingerprint;

      const rel = path.relative(root, outDir) || '.';
      const count = Object.keys(loaded.schema.getTypeMap()).filter(n => !n.startsWith('__')).length;
      console.log(
        `${TAG} ${count} types → ${rel} (${reason}, ${Date.now() - started}ms` +
          (written.length ? `, updated: ${written.join(', ')})` : ', unchanged)')
      );
    } catch (e) {
      const message = `${TAG} ${(e as Error).message}`;
      if (isBuild && options.failOnError) throw new Error(message);
      console.error(message);
    }
  }

  /** Serialises runs: a change during a run triggers exactly one follow-up run. */
  function run(reason: string, force = false): Promise<void> {
    if (running) {
      queued = true;
      return running;
    }
    running = generate(reason, force).finally(() => {
      running = null;
      if (queued) {
        queued = false;
        void run('queued');
      }
    });
    return running;
  }

  function setupWatcher(server: ViteDevServer) {
    const sources = fileSources().map(abs);
    if (!sources.length) return;

    // Watch the files themselves, or for globs the static base directory.
    const watchTargets = sources.map(s => (hasMagic(s) ? globBase(s) : s));
    server.watcher.add(watchTargets);

    const onEvent = async (file: string) => {
      if (!SCHEMA_EXT.test(file)) return;
      const inside = watchTargets.some(t => file === t || file.startsWith(t + path.sep));
      if (!inside) return;
      if (!sources.includes(file) && !(await schemaFiles()).includes(file)) return;
      clearTimeout(timer);
      timer = setTimeout(() => void run(`${path.basename(file)} changed`), 150);
    };
    server.watcher.on('add', onEvent);
    server.watcher.on('change', onEvent);
    server.watcher.on('unlink', onEvent);
  }

  return {
    name: 'r-agency:graphql-types',
    configResolved(config) {
      root = config.root;
      isBuild = config.command === 'build';
    },
    async buildStart() {
      await run('start', true);
    },
    configureServer(server) {
      if (options.watch) setupWatcher(server);
    },
  };
}

/** Static directory part of a glob: `/a/b/**\/*.graphql` → `/a/b` */
function globBase(pattern: string): string {
  const parts = pattern.split(path.sep);
  const idx = parts.findIndex(p => hasMagic(p));
  return parts.slice(0, idx === -1 ? parts.length : idx).join(path.sep) || path.sep;
}

/** Small, dependency-free string hash (FNV-1a). */
function hash(input: string): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0).toString(16);
}
