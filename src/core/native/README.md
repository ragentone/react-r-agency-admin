# core/native – Bridge zur Flutter-App

Läuft die Seite in der Flutter-App (`/Volumes/Dev/flutter-app`, User-Agent enthält
`r-agency-app`), stehen native Funktionen zur Verfügung. Im Browser ist `isNativeApp()` false
und `callNative` wirft `NativeBridgeError('NOT_NATIVE')`.

```ts
import {
  callNative,
  isNativeApp,
  NativeBridgeError,
  useNativeApp,
  useNativeEvent,
} from '@core/native';

if (isNativeApp()) {
  await callNative('haptics.impact', { style: 'light' });
  await callNative('clipboard.write', { text: 'Hallo' });
  await callNative('app.openExternal', { url: 'https://example.com' });
}

const { isApp, info } = useNativeApp(); // info.platform: 'android' | 'ios' | 'macos'
useNativeEvent('app.lifecycle', ({ state }) => {}); // 'resumed' | 'paused' | …

try {
  await callNative('auth.google', { url });
} catch (e) {
  if (e instanceof NativeBridgeError && e.code === 'CANCELED') {
    /* abgebrochen */
  }
}
```

## Benachrichtigungen

```ts
import { showNotification, useNotificationTap } from '@core/native';

// App: native System-Notification · Browser: Web Notifications API (Fallback)
const id = await showNotification({
  title: 'Neue Nachricht',
  body: 'Anna: Hallo! 👋',
  data: { url: '/chat/123' }, // kommt beim Tippen zurück
}); // null = nicht erlaubt

// Tipp auf eine Benachrichtigung – auch wenn die App dadurch gestartet wurde
useNotificationTap(({ data }) => {
  const { url } = data as { url: string };
  void navigate({ to: url });
});
```

Weitere: `requestNotificationPermission()`, `cancelNotification(id)`, `cancelAllNotifications()`.
Beim ersten `showNotification` fragt die App automatisch nach der Berechtigung.

> Lokale Benachrichtigungen funktionieren, solange die App/WebView läuft. Für Nachrichten bei
> geschlossener App braucht es Push (Firebase Cloud Messaging / APNs) vom Server.

## Hintergrund-Betrieb

Die App hält die React-App im Hintergrund am Laufen (WebSocket, Timer, Benachrichtigungen):

- **Android:** Foreground-Service mit dauerhafter Benachrichtigung „r-agency läuft im Hintergrund“.
  Standardmäßig an; per `callNative('background.disable')` abschaltbar (z. B. Nutzer-Einstellung).
- **macOS:** immer an – App Nap aus, Fenster schließen blendet nur aus (Cmd+Q beendet).
- **iOS:** von Apple nicht erlaubt – die App wird nach ~30 s pausiert. Dafür Push (APNs) nutzen.

Den Zustand bekommst du über `app.lifecycle` (`paused`/`hidden` = im Hintergrund).

## Methoden

| Methode                           | Parameter                                                      | Ergebnis                                                                  |
| --------------------------------- | -------------------------------------------------------------- | ------------------------------------------------------------------------- |
| `app.info`                        | –                                                              | Plattform, OS-Version, Locale, Debug, Bridge-Version, verfügbare Methoden |
| `app.openExternal`                | `{ url }`                                                      | – (öffnet im System-Browser / passender App)                              |
| `app.setBadge`                    | `{ count }`                                                    | `{ supported }` – Zahl am App-Icon (iOS, macOS; Android: false)           |
| `haptics.impact`                  | `{ style?: light \| medium \| heavy \| selection \| vibrate }` | –                                                                         |
| `clipboard.write`                 | `{ text }`                                                     | –                                                                         |
| `clipboard.read`                  | –                                                              | `{ text }`                                                                |
| `auth.google`                     | `{ url }`                                                      | `{ hash }` – Google-OAuth im System-Anmeldefenster                        |
| `notifications.requestPermission` | –                                                              | `{ granted }`                                                             |
| `notifications.show`              | `{ title, body?, id?, data?, silent?, group? }`                | `{ id }` (sonst `PERMISSION_DENIED`)                                      |
| `notifications.cancel`            | `{ id }`                                                       | –                                                                         |
| `notifications.cancelAll`         | –                                                              | –                                                                         |
| `notifications.takeLaunchTap`     | –                                                              | `{ id, data }` oder `null`                                                |
| `background.status`               | –                                                              | `{ supported, enabled }`                                                  |
| `background.enable`               | –                                                              | `{ enabled }` (iOS: `NOT_SUPPORTED`)                                      |
| `background.disable`              | –                                                              | `{ enabled }`                                                             |

## Events (Flutter → React)

| Event              | Daten                                                            |
| ------------------ | ---------------------------------------------------------------- |
| `bridge.ready`     | `INativeAppInfo` – nach jedem Seiten-Load                        |
| `app.lifecycle`    | `{ state: resumed \| inactive \| hidden \| paused \| detached }` |
| `notification.tap` | `{ id, data }` – Tipp auf eine Benachrichtigung                  |

## Neue Methode hinzufügen

1. **Flutter** `lib/native_bridge.dart` → in `_methods` eintragen:
   ```dart
   'device.battery': (p) async => {'level': 80},
   ```
2. **React** `types.ts` → in `INativeMethods` ergänzen:
   ```ts
   'device.battery': { params: void; result: { level: number } };
   ```
3. Ältere App-Versionen kennen neue Methoden nicht → `NOT_IMPLEMENTED`.
   Vorher prüfen mit `info.methods.includes('device.battery')`.

Nur Seiten auf erlaubten Hosts (App-URL, `ALLOWED_HOSTS`) dürfen die Bridge nutzen (`FORBIDDEN`).
