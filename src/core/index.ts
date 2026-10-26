// `Core` and `CoreVariables` live in their own files. Inside src/core and the apps import them
// directly (`@core/core.api.ts`, `@core/core.variables.ts`) – this barrel pulls in every module
// and creates import cycles that break Fast Refresh.
export * from './account';
export * from './admin';
export * from './app';
export * from './auth';
export * from './components';
export * from './cookie';
export { Core } from './core.api.ts';
export { CoreVariables } from './core.variables.ts';
export * from './developer';
export * from './error';
export * from './event';
export * from './hooks';
export * from './i18n';
export * from './layout';
export * from './media';
export * from './menu';
export * from './mesh';
export * from './page';
export * from './pages';
export * from './profile';
export * from './provider';
export * from './types';
export * from './utils';
