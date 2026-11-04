import type * as React from 'react';
import type { IPluginUserState } from './plugin.user';

/**
 * Slots a plugin can render into. Must match the backend list `PLUGIN_SLOTS`
 * (`runtime/src/shared/plugin/plugin.manifest.ts`).
 */
export const PLUGIN_SLOT_NAMES = ['home.widget', 'header.widget'] as const;

export type PluginSlotName = (typeof PLUGIN_SLOT_NAMES)[number] | string;

/** Which app a plugin runs in. Missing in the manifest = `frontend`. Matches `x-mesh-app-scope` on the request. */
export type PluginScope = 'frontend' | 'admin';

/** Languages a plugin can be translated into. Same list as the host. */
export type PluginLocale = 'de' | 'en' | 'ru';

/** Component a plugin registers for a slot. Gets the plugin id as prop. */
export type PluginSlotComponent = React.ComponentType<{ pluginId: string }>;

/** Lucide icon component the host provides, e.g. `api.icons.Info`. */
export type PluginIcon = React.ComponentType<
  React.SVGProps<SVGSVGElement> & { strokeWidth?: number }
>;

/** Names of the icons the host provides (`api.icons.<Name>`). Keep in sync with the host. */
export const PLUGIN_ICON_NAMES = [
  'Bell',
  'Bookmark',
  'Box',
  'Calendar',
  'Camera',
  'Clock',
  'Compass',
  'Download',
  'FileText',
  'Flag',
  'Folder',
  'Gamepad2',
  'Gift',
  'Globe',
  'Heart',
  'House',
  'Image',
  'Info',
  'LayoutGrid',
  'Link',
  'List',
  'Lock',
  'Mail',
  'MessageCircle',
  'Music',
  'Package',
  'Pencil',
  'Plus',
  'Puzzle',
  'Search',
  'Settings',
  'Share2',
  'Shield',
  'ShoppingBag',
  'Sparkles',
  'Star',
  'Trash2',
  'Trophy',
  'Upload',
  'User',
  'Users',
  'Zap',
] as const;

export type PluginIconName = (typeof PLUGIN_ICON_NAMES)[number];

/** Entry in the main menu. Opens one of the plugin's pages. */
export interface IPluginMenuEntry {
  /** Page of this plugin, e.g. `info` → `/plugin/<id>/info`. */
  page: string;
  /** Plain text for all languages, or one text per language (English is the fallback). */
  label: string | Partial<Record<PluginLocale, string>>;
  /** Lucide icon, e.g. `api.icons.Info`. Default: `api.icons.Puzzle`. */
  icon?: PluginIcon;
  /** Who sees the entry: everyone (default), only logged-in users, or only guests. */
  audience?: 'all' | 'user' | 'guest';
  /** Roles that may see the entry (any of them). Implies a logged-in user. The page itself is protected by its `roles` in plugin.json. */
  roles?: string[];
  /** `main` (default) or `apps` (inside the apps drawer). */
  section?: 'main' | 'apps' | 'games';
  /** Lower first. Default 100. */
  sortOrder?: number;
}

/** Hooks a plugin can subscribe to. `router.beforeNavigate` may redirect; the others only observe. */
export const PLUGIN_HOOK_NAMES = [
  'user.login',
  'user.logout',
  'router.navigate',
  'router.beforeNavigate',
  'homeWidget.mount',
  'homeWidget.unmount',
] as const;

export type PluginHookName = (typeof PLUGIN_HOOK_NAMES)[number];

/** Payload per hook. Tokens and other secrets are never passed to a plugin. */
export interface IPluginHookPayloads {
  'user.login': { success: boolean; userId: string | null };
  'user.logout': { success: boolean; userId: string | null };
  'router.navigate': { pathname: string; search: Record<string, unknown> };
  'router.beforeNavigate': { pathname: string; search: Record<string, unknown> };
  'homeWidget.mount': { pluginId: string };
  'homeWidget.unmount': { pluginId: string };
}

export interface IPluginHookOptions {
  /** Milliseconds an intervening hook may take before the app continues. Default 2000. */
  timeoutMs?: number;
}

/** What an observing hook gets. */
export interface IPluginHookEvent<P> {
  payload: P;
}

/** What an intervening hook gets. `redirect` sends the navigation to another absolute path. */
export interface IPluginInterveneEvent<P> extends IPluginHookEvent<P> {
  redirect(to: string): void;
}

/**
 * Options for `api.confirm`. Resolves `true` on confirm, `false` on cancel, Escape or a click outside.
 * Use `variant: 'destructive'` only for irreversible actions (e.g. deleting).
 */
export interface IPluginConfirmOptions {
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'default' | 'destructive';
}

/** Options for `api.toast`. */
export interface IPluginToastOptions {
  type?: 'success' | 'error' | 'info' | 'warning';
  description?: string;
}

/**
 * The Formik object `api.useForm` returns (the host's own Formik, described here so the plugin needs no
 * Formik package to type it).
 */
export interface IPluginForm<V extends Record<string, unknown>> {
  values: V;
  initialValues: V;
  errors: Partial<Record<keyof V, string>>;
  touched: Partial<Record<keyof V, boolean>>;
  isSubmitting: boolean;
  isValid: boolean;
  dirty: boolean;
  handleChange(
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ): void;
  handleBlur(
    event: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ): void;
  handleSubmit(event?: React.FormEvent<HTMLFormElement>): void;
  setFieldValue(field: keyof V & string, value: unknown, shouldValidate?: boolean): void;
  setFieldTouched(field: keyof V & string, touched?: boolean, shouldValidate?: boolean): void;
  setFieldError(field: keyof V & string, message: string | undefined): void;
  setValues(values: V): void;
  setErrors(errors: Partial<Record<keyof V, string>>): void;
  setSubmitting(value: boolean): void;
  resetForm(): void;
  submitForm(): Promise<void>;
  validateForm(): Promise<unknown>;
}

/** One validation rule of a field. `message` replaces the built-in text (translate it in the plugin). */
export interface IPluginFieldRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  email?: boolean;
  pattern?: RegExp;
  message?: string;
}

/**
 * Options for `api.useForm`. Validation with `rules` (the host shows the messages in the user's language)
 * and/or `validate` (synchronous, returns `{ field: message }`). Server errors go to `helpers.setErrors`.
 */
export interface IPluginFormConfig<V extends Record<string, unknown>> {
  initialValues: V;
  rules?: { [K in keyof V]?: IPluginFieldRule };
  validate?: (values: V) => Partial<Record<keyof V, string>>;
  onSubmit: (
    values: V,
    helpers: {
      resetForm: () => void;
      setSubmitting: (value: boolean) => void;
      setErrors: (errors: Record<string, string>) => void;
    }
  ) => void | Promise<void>;
  enableReinitialize?: boolean;
}

/** Query parameters of a plugin page or navigation. */
export type PluginSearch = Record<string, string | number | boolean>;

/** Options for `api.navigate`. */
export interface IPluginNavigateOptions {
  /** Segments after the page, e.g. `['abc', 'details']` → `/plugin/<id>/<page>/abc/details`. */
  path?: string[];
  /** Query parameters, e.g. `{ tab: 'x' }` → `?tab=x`. */
  search?: PluginSearch;
  /** Replace the current history entry instead of adding one. */
  replace?: boolean;
}

/** How a plugin page is shown: inside the app shell (`route`) or over the whole screen (`fullscreen`). */
export type PluginPageDisplay = 'route' | 'fullscreen';

/** Width of a `route` page inside the app shell. */
export type PluginPageWidth = 'narrow' | 'default' | 'wide' | 'full';

export interface IPluginPageOptions {
  /** Default `route`. */
  display?: PluginPageDisplay;
  /** Only for `route`. Default `default`. */
  width?: PluginPageWidth;
  /** Only for `route`: the page scrolls itself (instead of its content). Default `false`. */
  scrollable?: boolean;
}

/** Props a plugin page gets: the plugin id, the path segments after the page and the query parameters. */
export interface IPluginPageProps {
  pluginId: string;
  path: string[];
  search: Record<string, unknown>;
}

/** Component of a plugin page (`/plugin/<id>/<page>/…`). */
export type PluginPageComponent = React.ComponentType<IPluginPageProps>;

/** Router link for plugins: `<api.Link to="/plugin/<id>/<page>">…</api.Link>`. Same behaviour as the app's links. */
export type PluginLinkComponent = React.ComponentType<{
  to: string;
  className?: string;
  children?: React.ReactNode;
}>;

/** Result of a call to `POST /plugin/<id>/<action>`. */
export interface IPluginCallResult<T = unknown> {
  ok: boolean;
  /** HTTP status, 0 = no connection. */
  status: number;
  data: T | null;
  /** Error code from the backend (`Unauthorized`, `Forbidden`, `Action not found`, …). */
  error: string | null;
  /** Field errors of a validation (HTTP 422): `{ field: message }`. */
  errors?: Record<string, string> | null;
}

/**
 * Fertige Bausteine des Hosts (shadcn, Schwarz/Weiß, Mobile First). Nutzen statt eigener Styles.
 * Muss zu `Dev/plugin-sdk/src/index.ts` passen.
 */
/** Props per component, mirroring the host's shadcn components (variants, sizes and the native props). */
type UiDiv = React.HTMLAttributes<HTMLDivElement>;
type UiParagraph = React.HTMLAttributes<HTMLParagraphElement>;
type UiButton = React.ButtonHTMLAttributes<HTMLButtonElement>;
/** Root of Drawer and Dialog: controlled (`open` + `onOpenChange`) or uncontrolled (`defaultOpen`). */
type UiOverlayRoot = {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  children?: React.ReactNode;
};
/** Triggers and close buttons: a button, or another element through `render` (base-ui). */
type UiTrigger = UiButton & { render?: React.ReactElement };

export interface IPluginUi {
  Alert: React.ComponentType<UiDiv & { variant?: 'default' | 'destructive' }>;
  AlertTitle: React.ComponentType<UiDiv>;
  AlertDescription: React.ComponentType<UiDiv>;
  Avatar: React.ComponentType<UiDiv>;
  AvatarImage: React.ComponentType<React.ImgHTMLAttributes<HTMLImageElement>>;
  AvatarFallback: React.ComponentType<UiDiv>;
  Badge: React.ComponentType<
    UiDiv & { variant?: 'default' | 'secondary' | 'destructive' | 'outline' }
  >;
  Button: React.ComponentType<
    UiButton & {
      variant?:
        | 'default'
        | 'outline'
        | 'secondary'
        | 'ghost'
        | 'destructive'
        | 'destructive-outline'
        | 'link';
      size?:
        | 'xs'
        | 'sm'
        | 'md'
        | 'lg'
        | 'xl'
        | '2xl'
        | 'icon-xs'
        | 'icon-sm'
        | 'icon-md'
        | 'icon-lg'
        | 'icon-xl';
      fullWidth?: boolean;
      isLoading?: boolean;
      pill?: boolean;
      clickEffect?: boolean;
    }
  >;
  Card: React.ComponentType<UiDiv>;
  CardHeader: React.ComponentType<UiDiv>;
  CardTitle: React.ComponentType<UiDiv>;
  CardDescription: React.ComponentType<UiDiv>;
  CardContent: React.ComponentType<UiDiv>;
  CardFooter: React.ComponentType<UiDiv>;
  Checkbox: React.ComponentType<{
    checked?: boolean | 'indeterminate';
    defaultChecked?: boolean;
    onCheckedChange?: (checked: boolean | 'indeterminate') => void;
    disabled?: boolean;
    required?: boolean;
    name?: string;
    value?: string;
    id?: string;
    className?: string;
    'aria-label'?: string;
    'aria-invalid'?: boolean;
  }>;
  Empty: React.ComponentType<UiDiv>;
  EmptyHeader: React.ComponentType<UiDiv>;
  EmptyMedia: React.ComponentType<UiDiv & { variant?: 'default' | 'icon' }>;
  EmptyTitle: React.ComponentType<UiDiv>;
  EmptyDescription: React.ComponentType<UiParagraph>;
  EmptyContent: React.ComponentType<UiDiv>;
  Input: React.ComponentType<
    React.InputHTMLAttributes<HTMLInputElement> & { size?: 'sm' | 'md' | 'lg' }
  >;
  Item: React.ComponentType<
    UiDiv & { variant?: 'default' | 'outline' | 'muted'; size?: 'default' | 'sm' }
  >;
  ItemMedia: React.ComponentType<UiDiv & { variant?: 'default' | 'icon' | 'image' }>;
  ItemContent: React.ComponentType<UiDiv>;
  ItemTitle: React.ComponentType<UiDiv>;
  ItemDescription: React.ComponentType<UiDiv>;
  ItemActions: React.ComponentType<UiDiv>;
  Label: React.ComponentType<React.LabelHTMLAttributes<HTMLLabelElement>>;
  Progress: React.ComponentType<UiDiv & { value?: number }>;
  Select: React.ComponentType<{
    value?: string;
    defaultValue?: string;
    onValueChange?: (value: string) => void;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    disabled?: boolean;
    required?: boolean;
    name?: string;
    children?: React.ReactNode;
  }>;
  SelectTrigger: React.ComponentType<UiButton & { id?: string }>;
  SelectValue: React.ComponentType<{ placeholder?: string; children?: React.ReactNode }>;
  SelectContent: React.ComponentType<{
    position?: 'item-aligned' | 'popper';
    align?: 'start' | 'center' | 'end';
    sideOffset?: number;
    children?: React.ReactNode;
  }>;
  SelectItem: React.ComponentType<{
    value: string;
    disabled?: boolean;
    children?: React.ReactNode;
  }>;
  Separator: React.ComponentType<{
    orientation?: 'horizontal' | 'vertical';
    decorative?: boolean;
    className?: string;
  }>;
  Skeleton: React.ComponentType<UiDiv>;
  Spinner: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  Switch: React.ComponentType<{
    checked?: boolean;
    disabled?: boolean;
    onCheckedChange?: (checked: boolean) => void;
    id?: string;
    'aria-label'?: string;
  }>;
  Tabs: React.ComponentType<{
    value?: string;
    defaultValue?: string;
    onValueChange?: (value: string) => void;
    orientation?: 'horizontal' | 'vertical';
    className?: string;
    children?: React.ReactNode;
  }>;
  TabsList: React.ComponentType<UiDiv>;
  TabsTrigger: React.ComponentType<UiButton & { value: string; disabled?: boolean }>;
  TabsContent: React.ComponentType<UiDiv & { value: string }>;
  Textarea: React.ComponentType<React.TextareaHTMLAttributes<HTMLTextAreaElement>>;
  Field: React.ComponentType<
    UiDiv & { orientation?: 'vertical' | 'horizontal' | 'responsive'; 'data-invalid'?: boolean }
  >;
  FieldSet: React.ComponentType<React.FieldsetHTMLAttributes<HTMLFieldSetElement>>;
  FieldLegend: React.ComponentType<UiDiv & { variant?: 'legend' | 'label' }>;
  FieldGroup: React.ComponentType<UiDiv>;
  FieldContent: React.ComponentType<UiDiv>;
  FieldLabel: React.ComponentType<React.LabelHTMLAttributes<HTMLLabelElement>>;
  FieldTitle: React.ComponentType<UiDiv>;
  FieldDescription: React.ComponentType<React.HTMLAttributes<HTMLParagraphElement>>;
  FieldSeparator: React.ComponentType<UiDiv>;
  FieldError: React.ComponentType<UiDiv & { errors?: Array<{ message?: string } | undefined> }>;
  /** shadcn Drawer. On phones it comes from below. Mobile-first overlay, see the design rules. */
  Drawer: React.ComponentType<
    UiOverlayRoot & {
      direction?: 'up' | 'down' | 'left' | 'right';
      modal?: boolean;
      showSwipeHandle?: boolean;
      swipeDirection?: 'up' | 'down' | 'left' | 'right';
      backClose?: boolean;
    }
  >;
  DrawerTrigger: React.ComponentType<UiTrigger>;
  DrawerClose: React.ComponentType<UiTrigger>;
  DrawerContent: React.ComponentType<UiDiv & { layerClassName?: string }>;
  DrawerHeader: React.ComponentType<UiDiv>;
  DrawerFooter: React.ComponentType<UiDiv>;
  DrawerTitle: React.ComponentType<UiDiv>;
  DrawerDescription: React.ComponentType<UiParagraph>;
  /** shadcn Dialog (centered on tablet and up, full screen on phones). */
  Dialog: React.ComponentType<UiOverlayRoot & { backClose?: boolean }>;
  DialogTrigger: React.ComponentType<UiTrigger>;
  DialogClose: React.ComponentType<UiTrigger>;
  DialogContent: React.ComponentType<
    UiDiv & { showCloseButton?: boolean; overlayClassName?: string }
  >;
  DialogHeader: React.ComponentType<UiDiv>;
  DialogFooter: React.ComponentType<UiDiv>;
  DialogTitle: React.ComponentType<UiDiv>;
  DialogDescription: React.ComponentType<UiParagraph>;
}

/** What the host hands to a plugin in `register(api)`. */
export interface IPluginApi {
  /** Fertige Bausteine des Hosts, siehe `IPluginUi`. */
  ui: IPluginUi;
  /**
   * The host's React instance. Plugins build elements with `api.React.createElement`,
   * so the bundle does not ship its own React (two copies would break hooks).
   */
  React: typeof React;
  /** Public configuration values (fields with `public: true`), as delivered with the plugin list. */
  config: {
    get(): Record<string, PluginConfigPrimitive | undefined>;
  };
  /** Calls a named action of this plugin with the current user's token. */
  call<T = unknown>(action: string, body?: Record<string, unknown>): Promise<IPluginCallResult<T>>;
  /** URL of a file in the plugin's `assets/` folder (images only). */
  assetUrl(path: string): string;
  /** Registers a component for a slot. Slots not listed in the manifest are rejected. */
  registerSlot(slot: PluginSlotName, component: PluginSlotComponent): void;
  /**
   * Page under `/plugin/<id>/<path>`. The path must be declared under `pages` in plugin.json.
   * A page the current user may not open is skipped.
   */
  registerPage(path: string, component: PluginPageComponent, options?: IPluginPageOptions): void;
  /** Lucide icon components from the host, e.g. `api.icons.Info`. */
  icons: Record<PluginIconName, PluginIcon>;
  /** Navigates inside the app, with an absolute path, e.g. `api.navigate('/plugin/develop/info')`. */
  navigate(to: string, options?: IPluginNavigateOptions): void;
  /** Adds an entry to the main menu that opens one of this plugin's pages. Skipped if the user may not open the page. */
  registerMenuEntry(entry: IPluginMenuEntry): void;
  /**
   * Formik's own hook, provided by the host (React hooks cannot come from the plugin bundle).
   * Returns the raw Formik object: values, errors, touched, handleChange, handleBlur, handleSubmit, isSubmitting …
   */
  useForm<V extends Record<string, unknown>>(config: IPluginFormConfig<V>): IPluginForm<V>;
  /** Short message at the bottom of the screen. */
  toast(message: string, options?: IPluginToastOptions): void;
  /**
   * Asks the user to confirm (alert dialog from the host). Resolves `true` if confirmed,
   * otherwise `false`. A new call closes the open one with `false`.
   */
  confirm(options: IPluginConfirmOptions): Promise<boolean>;
  /**
   * Subscribes to a host event. Only `router.beforeNavigate` can intervene, and only if the plugin
   * declares it in `intervene` in plugin.json. Returns a function that removes the subscription.
   */
  on<K extends 'router.beforeNavigate'>(
    name: K,
    handler: (event: IPluginInterveneEvent<IPluginHookPayloads[K]>) => void | Promise<void>,
    options?: IPluginHookOptions
  ): () => void;
  on<K extends Exclude<PluginHookName, 'router.beforeNavigate'>>(
    name: K,
    handler: (event: IPluginHookEvent<IPluginHookPayloads[K]>) => void | Promise<void>,
    options?: IPluginHookOptions
  ): () => void;
  /** Router link to an absolute path inside the app (no page reload). */
  Link: PluginLinkComponent;
  /**
   * Current UI language. Hook: call it in a component. The component re-renders when the user
   * switches the language.
   */
  useLocale(): PluginLocale;

  /**
   * Login state of the current user. Hook: call it in a component. Re-renders on login and logout.
   * `status` is `loading` until the state is known, so do not show guest content in that phase.
   */
  useUser(): IPluginUserState;
}

/** Default export of a plugin bundle. */
export interface IPluginModule {
  id: string;
  register(api: IPluginApi): void;
}

/** Development only: where to ask for a new dev build. Set only outside production. */
export interface IPluginDevRef {
  /** `GET` URL that returns `{ revision }`. Changes with every dev build. */
  revisionUrl: string;
  /** Revision of the bundle that was loaded. */
  revision: string;
}

/** What the host knows about an installed, active plugin before loading its bundle. */
/** Value of one configuration field. */
export type PluginConfigPrimitive = string | number | boolean;

export interface IPluginRef {
  id: string;
  slots: PluginSlotName[];
  /** URL of the built frontend bundle (ESM). */
  bundleUrl: string;
  /** Base URL of this plugin version's `assets/` folder (ends with "/"). */
  assetBaseUrl: string;
  /** Pages of this plugin the current user may open (paths, e.g. `info`). */
  pages: string[];
  /** Hooks this plugin may intervene in (from plugin.json). */
  intervene: string[];
  /** Public configuration values (fields with `public: true`). */
  config?: Record<string, PluginConfigPrimitive>;
  /** Present for a development plugin in a non-production environment: enables hot reload. */
  dev?: IPluginDevRef;
}
