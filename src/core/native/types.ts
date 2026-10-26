export type NativePlatform = 'android' | 'ios' | 'macos' | (string & {});
export type ClientPlatform = 'android' | 'ios' | 'macos' | 'web';

export interface INativeAppInfo {
  platform: NativePlatform;
  osVersion: string;
  locale: string;
  debug: boolean;
  bridgeVersion: number;
  methods: string[];
}

export type NativeHapticStyle = 'light' | 'medium' | 'heavy' | 'selection' | 'vibrate';

export type NativeLifecycleState = 'resumed' | 'inactive' | 'hidden' | 'paused' | 'detached';

export interface INativeNotification {
  title: string;
  body?: string;
  id?: number;
  data?: unknown;
  silent?: boolean;
  /** Bundles notifications of the same group (Android `groupKey`, iOS/macOS thread). */
  group?: string;
}

export interface INativeNotificationTap {
  id: number | null;
  data: unknown;
}

export interface INativeMethods {
  'app.info': { params: void; result: INativeAppInfo };
  'app.openExternal': { params: { url: string }; result: null };
  'app.reload': { params: null; result: null };
  /** Number on the app icon (iOS home screen, macOS dock). Android: `supported: false`. */
  'app.setBadge': { params: { count: number }; result: { supported: boolean } };
  'haptics.impact': { params: { style?: NativeHapticStyle }; result: null };
  'clipboard.write': { params: { text: string }; result: null };
  'clipboard.read': { params: void; result: { text: string | null } };
  'notifications.requestPermission': { params: void; result: { granted: boolean } };
  'notifications.show': { params: INativeNotification; result: { id: number } };
  'notifications.cancel': { params: { id: number }; result: null };
  'notifications.cancelAll': { params: void; result: null };
  'notifications.takeLaunchTap': { params: void; result: INativeNotificationTap | null };
  'background.status': { params: void; result: { supported: boolean; enabled: boolean } };
  'background.enable': { params: void; result: { enabled: boolean } };
  'background.disable': { params: void; result: { enabled: boolean } };
  'auth.google': { params: { url: string }; result: { hash: string } };
  /** Incoming call: system ringtone + vibration in a loop (respects silent / vibrate mode). */
  'call.ring.start': { params: void; result: null };
  'call.ring.stop': { params: void; result: null };
}

/** Flutter → React: Event → Daten. */
export interface INativeEvents {
  'bridge.ready': INativeAppInfo;
  'app.lifecycle': { state: NativeLifecycleState };
  'notification.tap': INativeNotificationTap;
}

export type NativeMethod = keyof INativeMethods;
export type NativeEvent = keyof INativeEvents;
export type NativeParams<M extends NativeMethod> = INativeMethods[M]['params'];
export type NativeResult<M extends NativeMethod> = INativeMethods[M]['result'];

export type NativeErrorCode =
  | 'NOT_NATIVE'
  | 'TIMEOUT'
  | 'FORBIDDEN'
  | 'NOT_IMPLEMENTED'
  | 'INVALID_PARAMS'
  | 'CANCELED'
  | 'AUTH_FAILED'
  | 'PERMISSION_DENIED'
  | 'NOT_SUPPORTED'
  | 'INTERNAL'
  | (string & {});
