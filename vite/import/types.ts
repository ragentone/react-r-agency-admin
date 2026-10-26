export interface IOptions {
  targetDir?: string | string[];
  exclude?: string[];
}

/** `config.json` of a module / app (next to its entry files). */
export interface IConfig {
  active: boolean;
  name: string;
  entries: string[];
  sortOrder: number;
  /**
   * Vite modes this module is built in, e.g. `["development"]` = never deployed to prod.
   * Omitted or empty → every mode.
   */
  modes?: string[];
  dir: string;
}

export interface IGlobalModeConfig {
  /** Module names left out in this mode (wins over the module's own `modes`). */
  disabled?: string[];
}

/** `build.config.json` in the project root – central switch board. */
export interface IGlobalBuildConfig {
  /** Module names left out in every mode. */
  disabled?: string[];
  /** Per vite mode, e.g. `{ "production": { "disabled": ["app-love"] } }`. */
  modes?: Record<string, IGlobalModeConfig>;
}
