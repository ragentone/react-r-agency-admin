# Rollen (`@core/auth/roles`)

Rollenprüfung für den eingeloggten User mit **UND / ODER / NICHT**-Logik.
Grundlage sind die Rollen aus `userMeta.role` – im Backend z. B. `admin:user`, `dev:user`, `default:user`, `google:user`.

```ts
import { hasRoles, useRoles, useHasRoles, RoleGate } from '@core/auth';
```

---

## Inhalt

- [Schnellstart](#schnellstart)
- [Abfrage als Ausdruck (String)](#abfrage-als-ausdruck-string)
- [Abfrage als Objekt](#abfrage-als-objekt)
- [Funktionen](#funktionen)
- [React: Hooks & Komponente](#react-hooks--komponente)
- [Einsatz im Hauptmenü](#einsatz-im-hauptmenü)
- [Verhalten & Regeln](#verhalten--regeln)
- [Typen](#typen)
- [Rezepte](#rezepte)

---

## Schnellstart

```tsx
// Funktion (überall, auch außerhalb von React)
if (hasRoles(userMeta, 'admin:user || dev:user')) {
  // …
}

// Hook
const { can } = useRoles();
const showDebug = can('dev:user && !google:user');

// Komponente
<RoleGate roles="admin:user" fallback={<p>Kein Zugriff</p>}>
  <AdminPanel />
</RoleGate>;
```

---

## Abfrage als Ausdruck (String)

| Bedeutung | Schreibweisen        | Beispiel                           |
| --------- | -------------------- | ---------------------------------- |
| UND       | `&&` · `&` · `AND`   | `admin:user && dev:user`           |
| ODER      | `\|\|` · `\|` · `OR` | `admin:user \|\| dev:user`         |
| NICHT     | `!` · `NOT`          | `!banned:user` · `NOT banned:user` |
| Gruppe    | `( … )`              | `(a \|\| b) && !c`                 |

Schlüsselwörter (`AND`, `OR`, `NOT`) sind nicht case-sensitiv.

**Rangfolge:** `NICHT` → `UND` → `ODER`

```text
a || b && c        ⇔  a || (b && c)
!a && b            ⇔  (!a) && b
```

Im Zweifel Klammern setzen.

### Platzhalter

| Muster    | trifft zu, wenn …                       |
| --------- | --------------------------------------- |
| `admin:*` | der User irgendeine Rolle `admin:…` hat |
| `*:user`  | der User irgendeine Rolle `…:user` hat  |
| `*`       | der User mindestens eine Rolle hat      |

### Beispiele

```ts
hasRoles(user, 'admin:user'); // genau diese Rolle
hasRoles(user, 'admin:user && dev:user'); // beide
hasRoles(user, 'admin:user || dev:user'); // mindestens eine
hasRoles(user, 'admin:user || (dev:user && !google:user)'); // verschachtelt
hasRoles(user, 'admin:* AND NOT banned:user'); // Platzhalter + Wörter
```

Ausdrücke werden beim ersten Aufruf geparst und danach gecacht – sie können also
bedenkenlos in Render-Funktionen stehen.

---

## Abfrage als Objekt

Praktisch, wenn Abfragen dynamisch zusammengesetzt werden. Strings, Arrays und Objekte
lassen sich beliebig verschachteln; jeder String darf selbst wieder ein Ausdruck sein.

| Form                   | Bedeutung                       |
| ---------------------- | ------------------------------- |
| `'rolle'` / `'a && b'` | Ausdruck (siehe oben)           |
| `['a', 'b']`           | **ODER** – eine davon genügt    |
| `{ and: [ … ] }`       | **UND** – alle müssen zutreffen |
| `{ or: [ … ] }`        | **ODER**                        |
| `{ not: … }`           | **NICHT**                       |

```ts
hasRoles(user, ['admin:user', 'dev:user']);
hasRoles(user, { and: ['dev:user', { or: ['admin:user', 'tester:user'] }] });
hasRoles(user, { not: 'banned:user' });
hasRoles(user, { and: ['admin:* || dev:user', { not: 'banned:user' }] });
```

> **Achtung:** Ein Array bedeutet **ODER**. Für „alle“ `{ and: [...] }` oder `hasAllRoles` verwenden.

---

## Funktionen

### `hasRoles(source, query, options?) → boolean`

Zentrale Prüfung. `true`, wenn die Rollen von `source` die `query` erfüllen.

| Parameter | Typ                              | Beschreibung                                |
| --------- | -------------------------------- | ------------------------------------------- |
| `source`  | `RoleSource`                     | `userMeta`, Rollen-Array oder Rollen-String |
| `query`   | `RoleQuery \| null \| undefined` | Ausdruck oder Objekt; leer → `true`         |
| `options` | `IRoleCheckOptions`              | `{ superUserBypass?: boolean }`             |

### `hasAllRoles(source, roles[], options?)`

Alle Einträge müssen zutreffen (UND). Kurzform für `hasRoles(source, { and: roles })`.

### `hasAnyRole(source, roles[], options?)`

Mindestens ein Eintrag muss zutreffen (ODER). Kurzform für `hasRoles(source, { or: roles })`.

### `getRoles(source) → string[]`

Alle Rollen normalisiert (getrimmt, ohne Duplikate).

```ts
getRoles({ role: ['admin:user', 'dev:user'] }); // ['admin:user', 'dev:user']
getRoles('admin:user, dev:user'); // ['admin:user', 'dev:user']
```

### `parseRoleQuery(expression)`

Parst einen Ausdruck in einen Syntaxbaum (gecacht). Wirft bei Syntaxfehlern einen
`RoleQueryError` – nützlich, um Ausdrücke z. B. in Tests oder einer Admin-Oberfläche zu validieren.

```ts
try {
  parseRoleQuery('admin:user &&');
} catch (error) {
  // RoleQueryError: Unexpected end of role query: "admin:user &&"
}
```

---

## React: Hooks & Komponente

Alle drei lesen `userMeta` aus `useAuth()` und rendern neu, sobald sich der User ändert
(Login, Logout, `setUserMeta`). Sie müssen innerhalb des `AuthProvider` verwendet werden.

### `useRoles(options?)`

```tsx
const { roles, can, canAll, canAny, superUser } = useRoles();

can('admin:user || dev:user'); // boolean
canAll(['admin:user', 'dev:user']); // UND
canAny(['admin:user', 'dev:user']); // ODER
roles; // string[]
superUser; // boolean (userMeta.superUser)
```

### `useHasRoles(query, options?)`

Kurzform für eine einzelne Prüfung:

```tsx
const isAdmin = useHasRoles('admin:user');
const isStaff = useHasRoles(['admin:user', 'dev:user'], { superUserBypass: true });
```

### `<RoleGate>`

Rendert `children` nur, wenn die Prüfung besteht.

| Prop              | Typ         | Standard | Beschreibung                                 |
| ----------------- | ----------- | -------- | -------------------------------------------- |
| `roles`           | `RoleQuery` | –        | Ausdruck oder Objekt                         |
| `fallback`        | `ReactNode` | `null`   | Wird gerendert, wenn die Prüfung fehlschlägt |
| `superUserBypass` | `boolean`   | `false`  | `superUser` besteht immer                    |

```tsx
<RoleGate roles="admin:user && !banned:user" fallback={<UpgradeHint />}>
  <AdminTools />
</RoleGate>
```

---

## Einsatz im Hauptmenü

Menü-Einträge und Menü-Komponenten (`src/core/menu`) haben die Option `roles`.
Ein Eintrag mit `roles` ist automatisch nur für eingeloggte User sichtbar.

```ts
import { Shield, Bug } from 'lucide-react';

Core.menu.register({
  id: 'admin',
  label: 'Admin',
  icon: Shield,
  to: '/admin',
  section: 'account',
  roles: 'admin:user',
});

Core.menu.registerComponent({
  id: 'debug-tools',
  component: DebugTools,
  placement: 'footer',
  roles: { and: ['dev:user', { not: 'google:user' }] },
});
```

---

## Verhalten & Regeln

| Situation                                    | Ergebnis                                               |
| -------------------------------------------- | ------------------------------------------------------ |
| `query` ist `undefined` / `null` / `''`      | `true` (keine Einschränkung)                           |
| Leeres Array `[]` / `{ or: [] }`             | `true`                                                 |
| `{ and: [] }`                                | `true`                                                 |
| User nicht eingeloggt (`userMeta` leer)      | hat keine Rollen → nur `!…`-Ausdrücke können zutreffen |
| Ungültiger Ausdruck (z. B. `'a &&'`, `'(a'`) | `false` + `console.warn` (**deny by default**)         |
| `superUser` ohne `superUserBypass`           | wird wie jeder andere User geprüft                     |
| `superUser` mit `superUserBypass: true`      | immer `true`                                           |

**Akzeptierte Formate von `userMeta.role`:**

- Array: `['admin:user', 'dev:user']`
- String: `'admin:user'`
- Getrennte Liste: `'admin:user, dev:user'` (Trenner: Komma, Semikolon, Leerzeichen)
- Objekte im Array: `[{ alias: 'admin:user' }]` (`alias`, `name`, `role` oder `key`)
- Rollen-Map wie vom Backend (`userMeta.role` = `userRole`): `{ 'admin:user': true, 'dev:user': false }` → nur aktive (`true`) Rollen

Zusätzlich werden – falls vorhanden – `roles` und `userRole` am selben Objekt berücksichtigt.

> **Sicherheit:** Die Prüfung im Frontend dient nur der Darstellung (Menüs, Buttons, Seiten).
> Die eigentliche Berechtigung prüft das Backend (`@GraphqlAuth({ role: … })`).

---

## Typen

```ts
type RoleQuery =
  | string
  | readonly RoleQuery[] // ODER
  | { and: readonly RoleQuery[] }
  | { or: readonly RoleQuery[] }
  | { not: RoleQuery };

interface IRoleCheckOptions {
  superUserBypass?: boolean; // Standard: false
}

type RoleSource =
  | { role?: unknown; roles?: unknown; userRole?: unknown; superUser?: boolean | null }
  | readonly string[]
  | string
  | null
  | undefined;

class RoleQueryError extends Error {}
```

---

## Rezepte

**Button nur für Admins oder Entwickler**

```tsx
const { can } = useRoles();
return can('admin:user || dev:user') ? <Button onClick={purge}>Cache leeren</Button> : null;
```

**Ganze Seite schützen**

```tsx
export const PageAdmin = () => (
  <RoleGate roles="admin:user" fallback={<Page404 />}>
    <AdminDashboard />
  </RoleGate>
);
```

**Abfrage dynamisch zusammensetzen**

```ts
const query: RoleQuery = {
  and: [
    requiredRoles, // z. B. ['admin:user', 'dev:user'] → ODER
    ...(allowGoogle ? [] : [{ not: 'google:user' }]),
  ],
};
hasRoles(userMeta, query);
```

**Außerhalb von React (Store, Loader, Utils)**

```ts
import { useAuthStore, hasRoles } from '@core/auth';

const { userMeta } = useAuthStore.getState();
if (!hasRoles(userMeta, 'admin:user')) return;
```

---

## Rollen registrieren (`Core.roles`)

Apps melden die Rollen an, die sie verstehen. Der Admin-Bereich (`/admin`) bietet genau diese
Rollen in seinen Select-Feldern an – gruppiert nach App.

```ts
// apps/timeline/app.tsx
Core.roles.registerGroup('timeline', { label: 'timeline:roles.group', sortOrder: 50 });
Core.roles.register({
  role: 'timeline:moderator:user',
  label: 'timeline:roles.moderator.label',
  description: 'timeline:roles.moderator.description',
  group: 'timeline', // Standard: erstes Segment
});
```

| Methode / Hook              | Beschreibung                                                                     |
| --------------------------- | -------------------------------------------------------------------------------- |
| `register(def \| def[])`    | Registriert Rollen, gibt eine Unregister-Funktion zurück                         |
| `registerGroup(id, config)` | Gruppe im Select (`label`, `sortOrder`)                                          |
| `get(role)` · `has(role)`   | Definition einer Rolle                                                           |
| `getRoles()`                | Alle Rollen, sortiert (Gruppe → `sortOrder` → Name)                              |
| `getAssignableRoles()`      | Ohne `assignable: false` (z. B. `google:user`, vom System gesetzt)               |
| `useUserRoleRegistry()`     | React: `{ roles, assignable, groups, get, groupOf }`, rendert bei Änderungen neu |

- Format: `bereich:…:name`, 2–4 Segmente, Kleinbuchstaben (`USER_ROLE_PATTERN`, wie im Backend).
- Systemrollen (`default:user`, `admin:user`, `dev:user`, `google:user`) sind vorregistriert.
- Registrieren beschreibt nur eine Rolle – wer sie hat, steht am User (`userRole`).
  Rollen, die ein User hat, aber keine App registriert, zeigt der Admin-Bereich als „nicht registriert“.

---

## Dateien

| Datei             | Inhalt                                                  |
| ----------------- | ------------------------------------------------------- |
| `roles.ts`        | Parser, Auswertung, `hasRoles`, `getRoles`, Typen       |
| `use.roles.ts`    | `useRoles`, `useHasRoles`                               |
| `RoleGate.tsx`    | Komponente `<RoleGate>`                                 |
| `role.manager.ts` | `UserRoleManager` (`Core.roles`), `useUserRoleRegistry` |
| `index.ts`        | Exporte (über `@core/auth` verfügbar)                   |
