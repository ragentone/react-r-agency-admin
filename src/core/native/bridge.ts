import type {
  INativeEvents,
  NativeErrorCode,
  NativeEvent,
  NativeMethod,
  NativeParams,
  NativeResult,
} from './types';

/** Muss zu `applicationNameForUserAgent` in flutter-app/lib/config.dart passen. */
export const NATIVE_USER_AGENT_TOKEN = 'r-agency-app';
/** Muss zu `NativeBridge.handlerName` / `jsEventName` in native_bridge.dart passen. */
const HANDLER_NAME = 'native';
const EVENT_NAME = 'r-agency-native';
const READY_TIMEOUT_MS = 10_000;

interface IInAppWebView {
  callHandler: (name: string, ...args: unknown[]) => Promise<unknown>;
}

type RawResponse =
  { ok: true; result: unknown } | { ok: false; error: { code: NativeErrorCode; message: string } };

export class NativeBridgeError extends Error {
  readonly code: NativeErrorCode;

  constructor(code: NativeErrorCode, message: string) {
    super(message);
    this.name = 'NativeBridgeError';
    this.code = code;
  }
}

/** Läuft die Seite in der Flutter-App? */
export const isNativeApp = (): boolean =>
  typeof navigator !== 'undefined' && navigator.userAgent.includes(NATIVE_USER_AGENT_TOKEN);

const getRawBridge = (): IInAppWebView | undefined =>
  (window as unknown as { flutter_inappwebview?: IInAppWebView }).flutter_inappwebview;

let readyPromise: Promise<IInAppWebView> | null = null;

/** Wartet, bis die WebView-Bridge bereit ist (nur in der App). */
export const whenNativeReady = (): Promise<IInAppWebView> => {
  if (!isNativeApp()) {
    return Promise.reject(new NativeBridgeError('NOT_NATIVE', 'Not running inside the native app'));
  }
  const existing = getRawBridge();
  if (existing?.callHandler) return Promise.resolve(existing);

  readyPromise ??= new Promise<IInAppWebView>((resolve, reject) => {
    const timer = window.setTimeout(() => {
      readyPromise = null;
      reject(new NativeBridgeError('TIMEOUT', 'Native bridge did not become ready'));
    }, READY_TIMEOUT_MS);
    window.addEventListener(
      'flutterInAppWebViewPlatformReady',
      () => {
        window.clearTimeout(timer);
        const raw = getRawBridge();
        if (raw) resolve(raw);
        else reject(new NativeBridgeError('NOT_NATIVE', 'Native bridge missing'));
      },
      { once: true }
    );
  });
  return readyPromise;
};

/**
 * Ruft eine Flutter-Methode auf.
 * @example const info = await callNative('app.info');
 * @example await callNative('haptics.impact', { style: 'light' });
 */
export async function callNative<M extends NativeMethod>(
  method: M,
  ...args: NativeParams<M> extends void ? [] : [params: NativeParams<M>]
): Promise<NativeResult<M>> {
  const raw = await whenNativeReady();
  const response = (await raw.callHandler(HANDLER_NAME, {
    method,
    params: args[0] ?? {},
  })) as RawResponse | null;

  if (!response) throw new NativeBridgeError('INTERNAL', `No response for ${method}`);
  if (!response.ok) throw new NativeBridgeError(response.error.code, response.error.message);
  return response.result as NativeResult<M>;
}

/**
 * Hört auf Events aus Flutter. Gibt eine Abmelde-Funktion zurück.
 * @example const off = onNativeEvent('app.lifecycle', ({ state }) => …);
 */
export function onNativeEvent<E extends NativeEvent>(
  event: E,
  callback: (data: INativeEvents[E]) => void
): () => void {
  const listener = (e: Event) => {
    const detail = (e as CustomEvent<{ event: string; data: unknown }>).detail;
    if (detail?.event === event) callback(detail.data as INativeEvents[E]);
  };
  window.addEventListener(EVENT_NAME, listener);
  return () => window.removeEventListener(EVENT_NAME, listener);
}

/** Kurzform: `native.call(...)`, `native.on(...)`, `native.isApp()`. */
export const native = {
  isApp: isNativeApp,
  ready: whenNativeReady,
  call: callNative,
  on: onNativeEvent,
};
