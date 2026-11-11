import type * as React from 'react';
import type { PluginServiceInput, PluginServiceNameAny, PluginServiceOutput } from './plugin.service';
import type { IPluginUserState, PluginClientPlatform } from './plugin.user';

/**
 * Slots a plugin can render into. Must match the backend list `PLUGIN_SLOTS`
 * (`runtime/src/shared/plugin/plugin.manifest.ts`).
 */
export const PLUGIN_SLOT_NAMES = ['home.widget', 'header.widget', 'menu_before.widget', 'menu_after.widget', 'footer_before.widget', 'footer_after.widget', 'page_before.widget', 'page_after.widget', 'profile.header.actions', 'profile.menu', 'profile.card.widget', 'profile.info.widget', 'profile.empty.widget'] as const;

export type PluginSlotName = (typeof PLUGIN_SLOT_NAMES)[number] | string;

/** Which app a plugin runs in. Missing in the manifest = `frontend`. Matches `x-mesh-app-scope` on the request. */
export type PluginScope = 'frontend' | 'admin';

/** Languages a plugin can be translated into. Same list as the host. */
export type PluginLocale = 'de' | 'en' | 'ru';

/** Component a plugin registers for a slot. Gets the plugin id as prop. */
/** Props of a slot component: the plugin id and the `context` the slot was given (`PluginSlot context`). */
export interface IPluginSlotProps<TContext = unknown> {
  pluginId: string;
  context?: TContext;
}

/** Component a plugin registers for a slot. The plugin types its own `context` via `registerSlot<TContext>`. */
export type PluginSlotComponent<TContext = unknown> = React.ComponentType<IPluginSlotProps<TContext>>;

/** Options for `api.registerSlot`. */
export interface IPluginSlotOptions {
  /** Position inside the slot. Lower first. Default 100. Equal values keep a stable order by plugin id. */
  sortOrder?: number;
  /** `true`: the component is registered but not rendered. Default false. */
  disabled?: boolean;
}

/** Lucide icon component the host provides, e.g. `api.icons.Info`. */
export type PluginIcon = React.ComponentType<
  React.SVGProps<SVGSVGElement> & { strokeWidth?: number }
>;

/** Names of the icons the host provides (`api.icons.<Name>`). Keep in sync with the host. */
export const PLUGIN_ICON_NAMES = [
  'ArrowRight',
  'Coffee',
  'Laptop',
  'Moon',
  'PartyPopper',
  'Smartphone',
  'Sun',
  'Sunrise',
  'Sunset',
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
  /** Page of this plugin, e.g. `info` → `/plugin/<id>/info`. Optional: without it the entry runs `onClick`. */
  page?: string;
  /** Runs when the entry is tapped. Without `page` it needs an `id`. */
  onClick?: () => void;
  /** Unique name of an entry without `page`. */
  id?: string;
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

/** Props of `ui.ConfirmPopoverButton`: a trigger button that opens a small confirm popover. */
export interface IPluginConfirmPopoverButtonProps {
  children?: React.ReactNode;
  title?: React.ReactNode;
  description?: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  confirmVariant?: 'default' | 'destructive';
  onConfirm: () => void | Promise<void>;
  side?: 'top' | 'right' | 'bottom' | 'left';
  align?: 'start' | 'center' | 'end';
  variant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'destructive' | 'destructive-outline' | 'link';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'icon-xs' | 'icon-sm' | 'icon-md' | 'icon-lg' | 'icon-xl';
  fullWidth?: boolean;
  isLoading?: boolean;
  disabled?: boolean;
  className?: string;
  'aria-label'?: string;
}

/** Props the host adds to every drawer component, on top of the options' `props`. */
export interface IPluginDrawerInjectedProps {
  /** Closes the drawer. */
  close: () => void;
}

/** A plugin component shown in the host drawer (`api.openDrawer`). */
export type IPluginDrawerComponent = React.ComponentType<IPluginDrawerInjectedProps & Record<string, unknown>>;

/** Options for `api.openDrawer`. */
export interface IPluginDrawerOptions {
  title: string;
  description?: string;
  /** Side the drawer slides in from. Default: `bottom`. */
  position?: 'top' | 'bottom' | 'left' | 'right';
  /** `full` (default) almost full height, `auto` fits the content, `fullscreen` covers the viewport. */
  size?: 'full' | 'auto' | 'fullscreen';
  /** Passed to the component as props (`close` is added by the host). */
  props?: Record<string, unknown>;
}

/** Props the host adds to every dialog component (`api.openDialog`), on top of the options' `props`. */
export interface IPluginDialogInjectedProps {
  /** Closes the dialog. Does nothing visible while the user is blocked by the loading overlay. */
  close: () => void;
  /** Shows a fullscreen loading overlay in the dialog (`true`), or hides it (`false`). Text is optional. */
  loading: (state: boolean, options?: { text?: string; backdrop?: 'blur' | 'dim' }) => void;
}

/** A plugin component shown in the host dialog (`api.openDialog`). */
export type IPluginDialogComponent = React.ComponentType<IPluginDialogInjectedProps & Record<string, unknown>>;

/** Options for `api.openDialog`. */
export interface IPluginDialogOptions {
  title: string;
  description?: string;
  /** Width from tablet on. On phones the dialog is always full screen. Default: `md`. `fullscreen` covers the whole screen, also from tablet on (ignores `rounded`). */
  size?: 'sm' | 'md' | 'lg' | 'fullscreen';
  /** Fixed area at the bottom. Gets the same props as the dialog (`props`, `close`, `loading`). */
  footer?: IPluginDialogComponent;
  /** Left of the title in the header (same props as the dialog). */
  headerStart?: IPluginDialogComponent;
  /** Right of the title, before the close button (same props as the dialog). */
  headerEnd?: IPluginDialogComponent;
  /** Browser / Android back closes the dialog. Default: `false`. */
  backClose?: boolean;
  /** Rounded corners from tablet on. Default: `false`. */
  rounded?: boolean;
  /** Passed to the component as props (`close` and `loading` are added by the host). */
  props?: Record<string, unknown>;
}

/** Who sent an event (`api.subscribe`). */
export interface IPluginEventMeta {
  /** Plugin id of the sender. */
  from: string;
  name: string;
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

/** Who may open a page: everyone (default), only logged-in users, or only guests. */
export type PluginPageAudience = 'all' | 'user' | 'guest';

export interface IPluginPageOptions {
  /** Default `route`. */
  display?: PluginPageDisplay;
  /** Only for `route`. Default `default`. */
  width?: PluginPageWidth;
  /** Only for `route`: the page scrolls itself (instead of its content). Default `false`. */
  scrollable?: boolean;
  /** Default `all`. When the user does not match, the host shows an error message instead of the page. */
  audience?: PluginPageAudience;
  /** Roles that may open the page (any of them). Implies a logged-in user. A host check, not a security boundary: protect data with `roles` on actions. */
  userRoles?: string[];
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

/** Gemeinsames Seitenlayout: fixer Header (Zurück, Titel, Untertitel, rechter Slot), scrollbarer Inhalt, fixer Footer. */
export interface IPluginPageLayoutProps {
  title: string;
  subtitle?: React.ReactNode;
  /** Zurück-Button links. Ohne Angabe wird keiner angezeigt. */
  onBack?: () => void;
  /** Accessible name of the back button. */
  backLabel?: string;
  /** Rechter Bereich des Headers, z. B. Buttons. */
  actions?: React.ReactNode;
  /** Fester Bereich unten. */
  footer?: React.ReactNode;
  children?: React.ReactNode;
}

/** Balkendiagramm (`api.ui.BarChart`): eine Säule pro Eintrag. Wird vom Host mit Recharts gezeichnet. */
export interface IPluginBarChartProps {
  data: { label: string; value: number }[];
  /** Formats values in the axis and the tooltip, e.g. file sizes. */
  formatValue?: (value: number) => string;
  /** Height in pixels. Default 240. */
  height?: number;
  /** Text for screen readers. */
  ariaLabel?: string;
}

/** Liniendiagramm (`api.ui.LineChart`). Eine Linie pro Serie; die erste durchgezogen, weitere gestrichelt. */
export interface IPluginLineChartProps {
  /** One object per x value. Keys of `series` are the value keys. */
  data: Record<string, string | number>[];
  /** Key in `data` for the x axis, e.g. a date label. */
  xKey: string;
  series: { key: string; label: string }[];
  /** Formats values in the axis and the tooltip. */
  formatValue?: (value: number) => string;
  /** Height in pixels. Default 240. */
  height?: number;
  ariaLabel?: string;
}

/** Flächendiagramm (`api.ui.AreaChart`). Gleiche Props wie das Liniendiagramm. */
export type IPluginAreaChartProps = IPluginLineChartProps;

/** Kreisdiagramm (`api.ui.PieChart`). Eine Scheibe pro Eintrag, optional als Donut. */
export interface IPluginPieChartProps {
  data: { label: string; value: number }[];
  formatValue?: (value: number) => string;
  /** Hole in the middle. */
  donut?: boolean;
  height?: number;
  ariaLabel?: string;
}

/** Props of `ui.AppDrawer`: the host bottom sheet. Back closes it. */
export interface IPluginAppDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: React.ReactNode;
  description?: string;
  size?: 'full' | 'auto' | 'fullscreen';
  direction?: 'up' | 'down' | 'left' | 'right';
  onBack?: () => void;
  backLabel?: string;
  locked?: boolean;
  action?: React.ReactNode;
  subHeader?: React.ReactNode;
  footer?: React.ReactNode;
  hideHeader?: boolean;
  backClose?: boolean;
  children?: React.ReactNode;
}

/** Props of `ui.AppDialog`: centered card from tablet on, full screen on phones. Back closes it. */
export interface IPluginAppDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: React.ReactNode;
  hideTitle?: boolean;
  description?: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  backClose?: boolean;
  className?: string;
  bodyClassName?: string;
  children?: React.ReactNode;
}

export interface IPluginUi {
  PageLayout: React.ComponentType<IPluginPageLayoutProps>;
  BarChart: React.ComponentType<IPluginBarChartProps>;
  LineChart: React.ComponentType<IPluginLineChartProps>;
  AreaChart: React.ComponentType<IPluginAreaChartProps>;
  PieChart: React.ComponentType<IPluginPieChartProps>;
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
  ToggleGroup: React.ComponentType<
    UiDiv & {
      type: 'single' | 'multiple';
      value?: string | string[];
      defaultValue?: string | string[];
      onValueChange?: (value: string | string[]) => void;
      variant?: 'default' | 'outline';
      size?: 'default' | 'sm' | 'lg';
      orientation?: 'horizontal' | 'vertical';
      disabled?: boolean;
    }
  >;
  ToggleGroupItem: React.ComponentType<
    UiButton & { value: string; variant?: 'default' | 'outline'; size?: 'default' | 'sm' | 'lg' }
  >;
  Accordion: React.ComponentType<{
    value?: unknown[];
    defaultValue?: unknown[];
    onValueChange?: (value: unknown[]) => void;
    multiple?: boolean;
    disabled?: boolean;
    children?: React.ReactNode;
  }>;
  AccordionItem: React.ComponentType<UiDiv & { value: unknown; disabled?: boolean }>;
  AccordionTrigger: React.ComponentType<UiButton>;
  AccordionContent: React.ComponentType<UiDiv>;
  ButtonGroup: React.ComponentType<UiDiv & { orientation?: 'horizontal' | 'vertical' }>;
  ButtonGroupSeparator: React.ComponentType<UiDiv & { orientation?: 'horizontal' | 'vertical' }>;
  ButtonGroupText: React.ComponentType<UiDiv & { asChild?: boolean }>;
  Slider: React.ComponentType<{
    value?: number[];
    defaultValue?: number[];
    onValueChange?: (value: number[]) => void;
    onValueCommit?: (value: number[]) => void;
    min?: number;
    max?: number;
    step?: number;
    name?: string;
    orientation?: 'horizontal' | 'vertical';
    disabled?: boolean;
    className?: string;
  }>;
  Tooltip: React.ComponentType<{
    open?: boolean;
    defaultOpen?: boolean;
    onOpenChange?: (open: boolean) => void;
    delayDuration?: number;
    children?: React.ReactNode;
  }>;
  TooltipProvider: React.ComponentType<{ delayDuration?: number; children?: React.ReactNode }>;
  TooltipTrigger: React.ComponentType<UiButton & { asChild?: boolean }>;
  TooltipContent: React.ComponentType<
    UiDiv & {
      side?: 'top' | 'right' | 'bottom' | 'left';
      align?: 'start' | 'center' | 'end';
      sideOffset?: number;
    }
  >;
  Popover: React.ComponentType<{
    open?: boolean;
    defaultOpen?: boolean;
    onOpenChange?: (open: boolean) => void;
    modal?: boolean;
    children?: React.ReactNode;
  }>;
  PopoverTrigger: React.ComponentType<UiButton & { asChild?: boolean }>;
  PopoverAnchor: React.ComponentType<UiDiv & { asChild?: boolean }>;
  PopoverContent: React.ComponentType<
    UiDiv & {
      side?: 'top' | 'right' | 'bottom' | 'left';
      align?: 'start' | 'center' | 'end';
      sideOffset?: number;
    }
  >;
  ConfirmPopoverButton: React.ComponentType<IPluginConfirmPopoverButtonProps>;
  DropdownMenu: React.ComponentType<{
    open?: boolean;
    defaultOpen?: boolean;
    onOpenChange?: (open: boolean) => void;
    modal?: boolean;
    children?: React.ReactNode;
  }>;
  DropdownMenuTrigger: React.ComponentType<UiButton & { asChild?: boolean }>;
  DropdownMenuContent: React.ComponentType<
    UiDiv & {
      side?: 'top' | 'right' | 'bottom' | 'left';
      align?: 'start' | 'center' | 'end';
      sideOffset?: number;
    }
  >;
  DropdownMenuGroup: React.ComponentType<UiDiv>;
  DropdownMenuLabel: React.ComponentType<UiDiv & { inset?: boolean }>;
  DropdownMenuItem: React.ComponentType<
    UiDiv & {
      variant?: 'default' | 'destructive';
      inset?: boolean;
      disabled?: boolean;
      onSelect?: (event: Event) => void;
    }
  >;
  DropdownMenuSeparator: React.ComponentType<UiDiv>;
  Carousel: React.ComponentType<
    UiDiv & {
      opts?: {
        align?: 'start' | 'center' | 'end';
        loop?: boolean;
        dragFree?: boolean;
        skipSnaps?: boolean;
        startIndex?: number;
        containScroll?: 'trimSnaps' | 'keepSnaps' | false;
      };
      orientation?: 'horizontal' | 'vertical';
      setApi?: (api: {
        scrollPrev(): void;
        scrollNext(): void;
        scrollTo(index: number): void;
        canScrollPrev(): boolean;
        canScrollNext(): boolean;
        selectedScrollSnap(): number;
        on(event: 'select' | 'reInit', handler: () => void): void;
      }) => void;
    }
  >;
  CarouselContent: React.ComponentType<UiDiv>;
  CarouselItem: React.ComponentType<UiDiv>;
  CarouselPrevious: React.ComponentType<UiButton>;
  CarouselNext: React.ComponentType<UiButton>;
  Table: React.ComponentType<React.TableHTMLAttributes<HTMLTableElement>>;
  TableHeader: React.ComponentType<React.HTMLAttributes<HTMLTableSectionElement>>;
  TableBody: React.ComponentType<React.HTMLAttributes<HTMLTableSectionElement>>;
  TableFooter: React.ComponentType<React.HTMLAttributes<HTMLTableSectionElement>>;
  TableHead: React.ComponentType<React.ThHTMLAttributes<HTMLTableCellElement>>;
  TableRow: React.ComponentType<React.HTMLAttributes<HTMLTableRowElement>>;
  TableCell: React.ComponentType<React.TdHTMLAttributes<HTMLTableCellElement>>;
  TableCaption: React.ComponentType<React.HTMLAttributes<HTMLTableCaptionElement>>;
  Calendar: React.ComponentType<{
    mode?: 'single' | 'range' | 'multiple';
    value?: Date | { from: Date | undefined; to: Date | undefined } | Date[];
    defaultValue?: Date | { from: Date | undefined; to: Date | undefined } | Date[];
    onChange?: (value: Date | { from: Date | undefined; to: Date | undefined } | Date[] | undefined) => void;
    minDate?: Date;
    maxDate?: Date;
    disabledDates?: Date[];
    disableWeekends?: boolean;
    disablePastDates?: boolean;
    disableFutureDates?: boolean;
    weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
    showTodayButton?: boolean;
    showClearButton?: boolean;
    size?: 'sm' | 'md' | 'lg';
    className?: string;
  }>;
  DatePicker: React.ComponentType<{
    value?: Date;
    onChange?: (value: Date | undefined) => void;
    title: string;
    placeholder?: string;
    disabled?: boolean;
    minDate?: Date;
    maxDate?: Date;
    className?: string;
  }>;
  HtmlEditor: React.ComponentType<{
    value?: string;
    defaultValue?: string;
    onChange?: (html: string) => void;
    onBlur?: (html: string) => void;
    placeholder?: string;
    editable?: boolean;
    autoFocus?: boolean;
    minHeight?: number | string;
    maxHeight?: number | string;
    showToolbar?: boolean;
    stickyToolbar?: boolean;
    features?: 'none' | 'minimal' | 'basic' | 'full' | ({ preset?: 'none' | 'minimal' | 'basic' | 'full' } & Partial<Record<'history' | 'heading' | 'bold' | 'italic' | 'underline' | 'strike' | 'code' | 'highlight' | 'textColor' | 'backgroundColor' | 'bulletList' | 'orderedList' | 'blockquote' | 'codeBlock' | 'textAlign' | 'link' | 'image' | 'horizontalRule' | 'emoji' | 'dateTime' | 'clearFormatting' | 'source' | 'characterCount' | 'clear', boolean>>);
    invalid?: boolean;
    id?: string;
    name?: string;
    className?: string;
  }>;
  ColorPicker: React.ComponentType<{
    value?: string | null;
    onChange?: (color: string) => void;
    onChangeComplete?: (color: string, source: 'swatch' | 'custom') => void;
    palette?: string[][];
    swatchSize?: number;
    showCustom?: boolean;
    customOpen?: boolean;
    showRecent?: boolean;
    maxRecent?: number;
    persist?: boolean;
    fluid?: boolean;
    className?: string;
  }>;
  EmojiPicker: React.ComponentType<{
    onSelect: (emoji: { id: string; native: string; name: string; skin: 0 | 1 | 2 | 3 | 4 | 5 }) => void;
    emojiSize?: number;
    columns?: number;
    height?: number;
    categories?: Array<'people' | 'nature' | 'foods' | 'activity' | 'places' | 'objects' | 'symbols' | 'flags'>;
    maxVersion?: number;
    showSearch?: boolean;
    className?: string;
  }>;
  DateTimePicker: React.ComponentType<{
    value?: Date | null;
    onChange: (date: Date) => void;
    mode?: 'date' | 'time' | 'datetime';
    min?: Date;
    max?: Date;
    minuteStep?: number;
    weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
    hourCycle?: 'h12' | 'h23';
    locale?: string;
    showToday?: boolean;
    defaultViewDate?: Date;
    className?: string;
  }>;
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
  /** Host bottom sheet (title bar, body, sticky footer). Back closes it. */
  AppDrawer: React.ComponentType<IPluginAppDrawerProps>;
  /** Host dialog card. Back closes it. */
  AppDialog: React.ComponentType<IPluginAppDialogProps>;
}

/** What the host hands to a plugin in `register(api)`. */
export interface IPluginApi {
  /** Scope der App, in der das Plugin läuft: `frontend` oder `admin`. */
  readonly scope: PluginScope;
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
  registerSlot<TContext = unknown>(
    slot: PluginSlotName,
    component: PluginSlotComponent<TContext>,
    options?: IPluginSlotOptions
  ): void;
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
   * Opens a drawer from the host and shows a component of the plugin in it. The component gets
   * its `props` plus `close()`. Only one drawer is open at a time; a new call replaces it.
   */
  openDrawer(component: IPluginDrawerComponent, options: IPluginDrawerOptions): void;
  /**
   * Opens a dialog from the host (full screen on phones, centered card from tablet). The component
   * gets its `props`, `close()` and `loading(state, text?)`. Only one dialog at a time; a new call replaces it.
   */
  openDialog(component: IPluginDialogComponent, options: IPluginDialogOptions): void;
  /** Shows a fullscreen loading overlay over the whole app (`true`), or hides it (`false`). Text is optional. */
  /** Options: `text` (optional message), `backdrop` (`blur` default, or `dim` darkened). */
  loading(state: boolean, options?: { text?: string; backdrop?: 'blur' | 'dim' }): void;
  /**
   * Sends an event to plugins that listen for it. Only names from `emits` in plugin.json, with this
   * plugin's id as prefix (e.g. `demo.orderPlaced`). Delivery is asynchronous.
   */
  emit(name: string, payload?: unknown): void;
  /**
   * Listens to an event of another plugin (`<plugin-id>.<name>`), only if it is in `listens` in
   * plugin.json. Returns a function that removes the subscription.
   */
  subscribe(name: string, handler: (payload: unknown, meta: IPluginEventMeta) => void | Promise<void>): () => void;
  /** Receives a live push of this plugin's backend (`api.publish` there), only for topics in `live` of plugin.json. */
  onLive<T = unknown>(topic: string, handler: (payload: T) => void): () => void;
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

  /** Client platform: Android, iOS or macOS app, otherwise web. Hook: call it in a component. */
  usePlatform(): PluginClientPlatform;

  /** Path and query of the current page. Hook: re-renders on navigation. */
  useRoute(): IPluginRoute;

  /** Breakpoint and mobile/desktop flags. Hook: re-renders on change. Mobile first: `isMobile` below `md`. */
  useViewport(): IPluginViewport;

  /** Light or dark mode in use. Hook: re-renders on change. */
  useTheme(): IPluginTheme;

  /** Read-only facts about the running build. */
  readonly appInfo: IPluginAppInfo;

  /**
   * Registers a cleanup function. The host calls it when the plugin is unloaded, before a hot reload
   * and when it is removed. Returns a function that drops it again.
   */
  onDispose(fn: () => void): () => void;

  /**
   * Answers requests of other plugins for `<plugin-id>.<name>`. The name must be in `emits` in plugin.json.
   * One handler per name; a later call replaces it. Returns a function that removes it.
   */
  handle(name: string, handler: IPluginRequestHandler): () => void;

  /**
   * Asks the plugin that handles `name`. The name must be in `listens` in plugin.json. Never throws:
   * check `ok` and `error`.
   */
  request<T = unknown>(name: string, payload?: unknown, options?: IPluginRequestOptions): Promise<IPluginRequestResult<T>>;

  /** Calls a host service, e.g. `api.host.call('route.current')`. Never throws. */
  host: {
    call<K extends PluginServiceNameAny>(
      service: K,
      payload?: PluginServiceInput<K>
    ): Promise<IPluginRequestResult<PluginServiceOutput<K>>>;
  };
}

/** Breakpoints of the host (min-width, same values as the host's layout). */
export type PluginBreakpoint = 'sm' | 'md' | 'lg' | 'xl' | '2xl';

/** Path and query of the current page (`api.useRoute`). */
export interface IPluginRoute {
  pathname: string;
  search: Record<string, unknown>;
}

/** Breakpoint and flags (`api.useViewport`). `isMobile` is true below `md`. */
export interface IPluginViewport {
  /** Largest breakpoint that matches, `null` below `sm`. */
  breakpoint: PluginBreakpoint | null;
  isMobile: boolean;
  isDesktop: boolean;
}

/** Light or dark mode in use, and the user's setting (`api.useTheme`). */
export interface IPluginTheme {
  mode: 'light' | 'dark';
  preference: 'light' | 'dark' | 'system';
}

/** Read-only facts about the running build (`api.appInfo`). */
export interface IPluginAppInfo {
  environment: 'development' | 'production';
}

/** Result of `api.request` and `api.host.call`. Never thrown, always this shape. */
export interface IPluginRequestResult<T = unknown> {
  ok: boolean;
  data: T | null;
  /** `no_handler`, `timeout`, `handler_error`, `not_listening`, `unknown_service`, `not_granted`, `service_error`. */
  error: string | null;
}

export interface IPluginRequestOptions {
  /** Default 2000 ms. */
  timeoutMs?: number;
}

/** Answers a request of another plugin. The return value (or a resolved promise) is the answer. */
export type IPluginRequestHandler = (payload: unknown, meta: IPluginEventMeta) => unknown | Promise<unknown>;

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

/** Host API areas a plugin may use (from `capabilities` in plugin.json). */
export const PLUGIN_CAPABILITIES = ['drawer', 'dialog', 'loading', 'confirm', 'navigate', 'toast', 'user'] as const;
export type PluginCapability = (typeof PLUGIN_CAPABILITIES)[number];

/** What the host grants a plugin, read from plugin.json. `capabilities: null` = no list (everything). */
export interface IPluginGrants {
  emits: string[];
  listens: string[];
  live: string[];
  capabilities: PluginCapability[] | null;
}

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
  /** Events this plugin may send (from plugin.json). */
  emits: string[];
  /** Events this plugin listens for (from plugin.json). */
  listens: string[];
  /** Capabilities from plugin.json. `null` = no list, everything allowed. */
  capabilities: PluginCapability[] | null;
  /** Live topics from plugin.json (`onLive`). */
  live: string[];
  /** Public configuration values (fields with `public: true`). */
  config?: Record<string, PluginConfigPrimitive>;
  /** Present for a development plugin in a non-production environment: enables hot reload. */
  dev?: IPluginDevRef;
}
