export interface IGraphqlTypesOptions {
  /**
   * Where the schema comes from. Any mix of:
   * - SDL files or globs (`.graphql`, `.graphqls`, `.gql`), relative to the Vite root
   * - introspection results (`.json`, `{ data: { __schema } }` or `{ __schema }`)
   * - an http(s) GraphQL endpoint (introspection query is sent)
   *
   * Default: `./generated/schema.graphql` (written by the mesh plugin).
   */
  schema?: string | string[];
  /** Target directory for the generated files, relative to the Vite root. Default: `./lib/types` */
  outDir?: string;
  /** Extra headers for an http(s) schema source (e.g. Authorization). */
  headers?: Record<string, string>;
  /** Prefix for generated interfaces (object, input, interface types). Default: `I` */
  prefix?: string;
  /** Scalar → TS type. Merged over the defaults (ID → string, JSON → any, Upload → File | Blob …). */
  scalars?: Record<string, string>;
  /** TS type for unknown custom scalars. Default: `any` */
  defaultScalarType?: string;
  /** Nullable output fields. Default: `T | null` (same as the mesh plugin's `maybeValue`). */
  maybeValue?: string;
  /** Nullable input fields / arguments. Default: `T | null | undefined` */
  inputMaybeValue?: string;
  /** Nullable input fields / arguments become optional (`field?:`). Default: `true` */
  optionalInputFields?: boolean;
  /** Nullable output fields become optional (`field?:`) – handy for partial selections. Default: `false` */
  optionalOutputFields?: boolean;
  /** Add `__typename?: 'Name'` to object types. Default: `false` */
  typename?: boolean;
  /** Generate `I<Type><Field>Args` interfaces for field arguments (Query/Mutation …). Default: `true` */
  args?: boolean;
  /** Format the output with the project's prettier config (if prettier is installed). Default: `true` */
  prettier?: boolean;
  /** Regenerate when the schema changes during `vite dev`. Default: `true` */
  watch?: boolean;
  /**
   * Additionally write a Markdown structure tree of the schema into `outDir`.
   * `true` → `{ file: 'SCHEMA.md', depth: 3 }`, `false` → off. Default: `true`
   * - `file`: file name inside `outDir`
   * - `depth`: how many type levels are expanded below each operation / input
   */
  tree?: boolean | { file?: string; depth?: number };
  /** Fail the build if the schema can't be loaded (otherwise only a warning). Default: `false` */
  failOnError?: boolean;
}

export type IResolvedGraphqlTypesOptions = Required<
  Omit<IGraphqlTypesOptions, 'schema' | 'tree'>
> & {
  schema: string[];
  tree: false | { file: string; depth: number };
};

/** File name (inside `outDir`) → file content. */
export type IGeneratedFiles = Record<string, string>;
