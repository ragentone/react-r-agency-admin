# Design-Anweisung für KI-Agenten

> Verbindliche Vorgaben für jede KI (Claude, Cursor, Copilot, GPT …), die UI in diesem Projekt baut oder ändert.
> Gilt für **Frontend** (`/Volumes/Dev/react-app-v2`) und **Admin** (`/Volumes/Dev/react-app-admin`).
> Backend (`/Volumes/Dev/runtime`) nur anfassen, wenn die Aufgabe es wirklich verlangt.

---

## 1. Leitbild in einem Satz

**Wie X/Twitter: schwarz-weiß, flach, dicht, schnell, Daumen-freundlich – Mobile First, nur shadcn-Komponenten.**

Bevor du Code schreibst, prüfe jede Entscheidung gegen diese 6 Regeln:

1. **Mobile First** – zuerst für 375 px Breite bauen, dann mit `sm: md: lg:` erweitern. Nie umgekehrt.
2. **Schwarz/Weiß** – Farbe nur über Theme-Tokens. Einzige echte Farbe: Rot (`destructive`) für Löschen/Fehler, plus Status-Tokens (`success`, `warning`, `info`) sparsam.
3. **Nur shadcn** – vorhandene Komponenten aus `@ui/shad-cn/components` verwenden. Nichts Eigenes bauen, wenn es eine Komponente gibt.
4. **Usability vor Optik** – große Touch-Ziele, klare Hierarchie, eine Hauptaktion pro Screen, jeder Zustand (Laden/Leer/Fehler) ist gestaltet.
5. **Konsistenz** – lieber ein bestehendes Muster kopieren als ein neues erfinden.
6. **Kleine Komponenten** – eine Komponente, eine Aufgabe; Logik in Hooks, große Teile aufteilen (siehe 2.4).

---

## 2. Komponenten (shadcn)

### 2.1 Import-Pfade

```tsx
import { Button } from '@ui/shad-cn/components/button';
import { cn } from '@ui/lib/utils';
import { AppDrawer, AppFormDrawer } from '@ui/patterns/drawer';
```

Aliase stehen in `components.json` (`@ui/shad-cn/components`, `@ui/lib`, `@ui/shad-cn/hooks`).

### 2.2 Verfügbare Komponenten – zuerst hier suchen

`src/ui/shad-cn/components/`:

| Zweck | Komponente |
|---|---|
| Aktionen | `button`, `button-group`, `toggle`, `toggle-group`, `toolbar`, `fixed-toolbar` |
| Formulare | `field`, `label`, `input`, `input-group`, `textarea`, `select`, `combobox`, `autocomplete`, `checkbox`, `switch`, `slider`, `input-otp`, `mask-input`, `date-input`, `date-wheel-picker`, `calender`, `tag-group`, `place-autocomplete`, `signature-pad` |
| Overlays | `drawer` (Mobile Standard!), `sheet`, `dialog`, `alert-dialog`, `popover`, `dropdown-menu`, `context-menu`, `hover-card`, `tooltip`, `command` |
| Inhalt | `card`, `item`, `avatar`, `badge`, `status`, `table`, `tabs`, `accordion`, `separator`, `scroll-area`, `carousel`, `aspect-ratio`, `code-block`, `description`, `group`, `frame`, `widget`, `notification-card` |
| Feedback | `skeleton`, `spinner`, `progress`, `circular-progress`, `empty`, `alert`, `sonner` (Toasts) |
| Navigation | `sidebar`, `pagination`, `tabs` |
| Chat | `chat`, `message`, `bubble`, `attachment` |
| Sonstiges | `chart`, `map`, `marker`, `marquee`, `cropper`, `questionnaire` |

Zusätzlich fertige Muster in `src/ui/patterns/`:
- `drawer/AppDrawer`, `drawer/AppFormDrawer` – **Standard für Formulare und Detailansichten auf Mobile**
- `chart/*` – `StatTile`, `Sparkline`, `BarList`, `Funnel`, `Heatmap`, `ChartBlock`
- `loading/Delayed` – Ladezustand erst nach kurzer Verzögerung zeigen (kein Flackern)

### 2.3 Regeln

- **Erst suchen, dann bauen:** `src/ui/shad-cn/components` und `src/ui/patterns` prüfen.
- Fehlt etwas: per shadcn-CLI aus der offiziellen Registry bzw. den in `components.json` eingetragenen Registries hinzufügen – **nicht** frei nachbauen. Danach auf Schwarz/Weiß-Tokens anpassen.
- **Keine** weiteren UI-Libraries einführen (kein MUI, Chakra, Ant, Bootstrap …). Radix/Base-UI/Ark nur indirekt über shadcn-Komponenten.
- Komponenten **nicht kopieren und abwandeln** – Varianten über `variant`/`size`-Props bzw. `className` lösen.
- Frontend und Admin haben dieselbe Komponentenbasis. Änderungen an einer shadcn-Komponente in **beiden** Projekten nachziehen.

### 2.4 Komponenten klein halten

- **Eine Komponente = eine Aufgabe.** Richtwert: max. ~150 Zeilen pro Datei, der JSX-Return max. ~50 Zeilen. Wird es länger → aufteilen.
- **Logik raus aus dem JSX:** Daten laden, Formular-Logik, Berechnungen und Effekte in einen eigenen Hook (`use-<name>.ts`) neben der Komponente.
- **Seiten setzen nur zusammen:** Eine Page-Komponente enthält Layout + Unterkomponenten, keine Details (keine Listenzeilen, keine Formularfelder inline).
- **Wiederkehrende Teile** (Header, Listenzeile, Leerzustand, Aktionsleiste) als eigene Unterkomponente im selben Feature-Ordner.
- **Schlanke Props:** max. ~5–7 Props. Mehr → Komposition über `children`/Slots statt immer neuer Konfigurations-Props.
- **Keine Modus-Monster:** viele `if (mode === …)`-Zweige in einer Komponente → getrennte Komponenten.
- **Kein Prop-Drilling** über mehr als 2 Ebenen → Context oder Hook.
- Teile, die in mehreren Features gebraucht werden, nach `src/ui/patterns/` verschieben – nicht kopieren.

Beispiel-Struktur pro Feature:

```
module/<feature>/components/
  FeedPage.tsx      // setzt nur zusammen
  FeedHeader.tsx
  FeedList.tsx
  FeedItem.tsx
  FeedEmpty.tsx
  use-feed.ts       // Daten + Logik
```

---

## 3. Farben – Schwarz/Weiß

Farben **ausschließlich über Tokens** aus `src/index.css`. Keine Hex-Werte, kein `bg-blue-500`, kein `text-gray-600`.

| Token (Tailwind) | Verwendung |
|---|---|
| `bg-background` / `text-foreground` | Seite, Haupttext (Hell: Weiß/Schwarz, Dunkel: umgekehrt) |
| `bg-primary` / `text-primary-foreground` | **Eine** Hauptaktion pro Screen (schwarzer Pill-Button) |
| `bg-secondary`, `bg-muted`, `bg-accent` | Ruhige Flächen, Hover, ausgewählte Zeilen |
| `text-muted-foreground` | Sekundärtext: Zeitstempel, @handle, Hinweise, Zähler |
| `border-border` | Alle Trennlinien und Rahmen (1 px) |
| `ring-ring` | Fokus |
| `destructive` | **Einzige Akzentfarbe:** Löschen, Fehler, Validierung |
| `success` / `warning` / `info` | Nur für Status-Badges/Meldungen, nie für Flächen oder Buttons |

Regeln:
- **Dark Mode ist Pflicht.** Durch Tokens automatisch erfüllt – jede neue UI in hell **und** dunkel prüfen (`.dark`-Klasse).
- Transparenz statt neuer Grautöne: `bg-foreground/5`, `border-foreground/10`.
- Bilder, Avatare und Medien sind die einzige „Farbe“ im Interface – das UI selbst bleibt neutral.
- Kontrast mindestens WCAG AA (4.5:1 Text, 3:1 Icons/Rahmen).

---

## 4. Typografie

Eine Schrift: **Inter** (bereits eingebunden). Nur die definierten Größen benutzen – keine `text-[13px]`.

| Klasse | Größe | Einsatz |
|---|---|---|
| `text-display` | 28/32 | Seitentitel, große Zahlen (sparsam) |
| `text-title` | 17/24 | Header-Titel, Abschnittstitel, Drawer-Titel |
| `text-body` | 15/20 | **Standard** für Inhalt, Listen, Posts |
| `text-caption` | 13/18 | Meta-Infos, Labels, Hilfetexte |
| `text-micro` | 11/16 | Badges, Zähler |

- Gewichte: `font-bold` für Titel, Namen, Buttons · `font-normal` für Text · `font-medium` für Labels. Nicht mehr.
- Inputs bleiben auf Mobile bei `text-base` (16 px) – sonst zoomt iOS.
- Twitter-Muster für Personen: **Name** `font-bold text-foreground` · `@handle · 2 Std.` in `text-muted-foreground`.
- Lange Texte: `line-clamp-*` oder `truncate`, niemals horizontal überlaufen lassen.

---

## 5. Layout & Abstände – Mobile First

### 5.1 Grundraster
- Abstände im 4-px-Raster: `gap-1 2 3 4 6 8`, `p-3`/`p-4` als Standard-Innenabstand.
- Seitenränder auf Mobile: `px-4`. Nie Inhalt bis an den Rand (außer Medien/Listen-Trennlinien).
- Inhalt auf großen Screens begrenzen: zentrale Spalte `max-w-[600px]` wie bei X; Admin-Tabellen dürfen breiter sein.

### 5.2 Breakpoints
Basis-Klassen = Mobile. Erweiterung nur nach oben: `sm` 640 · `md` 768 · `lg` 1024 · `xl` 1280.
In JS: `useBreakpoints()` aus `@ui/lib` (nur wenn CSS nicht reicht).

### 5.3 Twitter-Struktur
| Bereich | Mobile (< md) | Desktop (≥ lg) |
|---|---|---|
| Navigation | Bottom-Tab-Bar (max. 5 Icons) + Header | Linke Spalte, Icons + Labels |
| Header | Sticky, `bg-background/80 backdrop-blur`, Titel + max. 1–2 Icon-Buttons | Sticky über der Hauptspalte |
| Inhalt | Volle Breite | Mittlere Spalte max. 600 px, `border-x` |
| Kontext | – (in Drawer/Tab verschoben) | Rechte Spalte (Suche, Trends, Infos) |
| Hauptaktion | Floating-Button rechts unten über der Tab-Bar | Großer Button in der linken Navigation |

### 5.4 Listen statt Karten
- Feeds und Listen: **Zeilen mit `border-b`**, keine schwebenden Karten mit Schatten.
- Ganze Zeile klickbar, Hover `hover:bg-accent/50`, Aktionen als Icon-Buttons in der Zeile.
- Schatten nur für Overlays (Popover, Dropdown) – sonst **flach**.

### 5.5 Safe Areas
Bei fixierten Leisten oben/unten: `pb-[env(safe-area-inset-bottom)]` bzw. `pt-[env(safe-area-inset-top)]`. Höhen mit `dvh`, nicht `vh`.

---

## 6. Formen, Radien, Icons

- **Buttons:** Pill-Look, fett, flach – kommt aus `button.tsx`. Varianten:
  - `default` (schwarz) = eine Hauptaktion · `outline` = Nebenaktion · `secondary`/`ghost` = ruhig, Toolbars, Schließen · `destructive` = endgültiges Löschen · `link`.
  - Größen: Mobile Hauptaktion `lg` (44) oder `xl` (48), Icons `icon-md`/`icon-lg`.
- **Avatare:** immer rund.
- **Radius:** über Tokens (`rounded-md`, `rounded-lg`, `rounded-xl`). Kein `rounded-[7px]`.
- **Icons:** `lucide-react` (Projektstandard). Größe `size-5` in Navigation/Headern, `size-4` in Buttons/Zeilen. Strichstärke nicht verändern. Keine Emojis als Icons.
- Ausgewählter Nav-Tab: Icon gefüllt/fett + `font-bold`; nicht ausgewählt: Outline-Icon.

---

## 7. Usability – Pflichtregeln

### 7.1 Touch & Daumen
- Touch-Ziele **mindestens 44 × 44 px** (`button.tsx` vergrößert kleine Buttons auf Touch automatisch – kein eigenes Kleinst-Element bauen).
- Hauptaktionen in die **Daumenzone** (unten): Sticky-Footer im Drawer, Floating-Button.
- Abstand zwischen klickbaren Elementen ≥ 8 px.

### 7.2 Overlays
- **Mobile:** Formulare, Details und Auswahl im `AppDrawer` / `AppFormDrawer` (Bottom-Sheet). Kein zentriertes Modal auf dem Handy.
- **Desktop:** Drawer darf als Dialog/Sheet erscheinen.
- Jeder Overlay muss sich über **Zurück-Taste/Wischgeste** schließen lassen (`BackCloseRoot` aus `@ui/lib` – ist in den Drawer-Mustern bereits enthalten).
- Während des Speicherns `locked` setzen, damit nichts versehentlich schließt.
- Endgültige Aktionen (Löschen) immer mit `alert-dialog` bestätigen.

### 7.3 Zustände – jeder Screen hat alle vier
| Zustand | Umsetzung |
|---|---|
| Laden | `skeleton` in der Form des echten Inhalts (kein Spinner für ganze Seiten); mit `Delayed` kurz verzögern |
| Leer | `empty` mit Icon, kurzer Erklärung und **einer** Aktion |
| Fehler | Klarer Text + „Erneut versuchen“-Button; Feldfehler direkt am Feld (`field`) |
| Erfolg | `toast` aus `sonner` – kurz, ohne Pflicht-Klick |

### 7.4 Formulare
- Labels immer sichtbar über dem Feld (`field` + `label`), Platzhalter sind kein Label-Ersatz.
- Richtige Tastatur: `type="email"`, `inputMode="numeric"`, `autoComplete` setzen.
- Validierung beim Verlassen des Feldes, nicht bei jedem Tastendruck.
- Speichern-Button: zeigt Ladezustand, ist bei ungültigen Daten deaktiviert, sitzt unten in der Daumenzone.

### 7.5 Feedback & Bewegung
- Jede Interaktion gibt sofort Feedback (Hover, `active:`-Zustand, Ladezustand).
- Optimistische Updates für Likes/Toggles wie bei X.
- Animationen kurz (150–250 ms), dezent; `motion-reduce:` respektieren.

### 7.6 Barrierefreiheit
- Icon-only-Buttons brauchen `aria-label` (übersetzt).
- Fokus sichtbar lassen (`focus-visible:ring`) – nie `outline-none` ohne Ersatz.
- Semantisches HTML: `<button>` für Aktionen, `<a>`/Router-Link für Navigation, Überschriften in Reihenfolge.
- Bilder mit `alt`.

### 7.7 Texte & Sprache
- **Keine hartcodierten Texte.** Alles über `react-i18next` (`useTranslation`), Sprachen: `de`, `en`, `ru`. Neue Keys in allen drei Dateien anlegen.
- Kurz und aktiv: „Speichern“, „Posten“, „Löschen“ – nicht „Hier klicken, um zu speichern“.

---

## 8. Admin-spezifisch

Gleiche Gestaltung wie das Frontend, zusätzlich:
- Datenlisten auf Mobile als **Zeilenliste** (`item`), ab `md` als `table`.
- Filter/Suche oben sticky; Massenaktionen in einer Leiste, die erst bei Auswahl erscheint.
- Kennzahlen mit `@ui/patterns/chart` (`StatTile`, `Sparkline`) – Diagramme in Graustufen, Farbe nur für Hervorhebung.
- Destruktive Admin-Aktionen immer mit Bestätigung und klarer Folgenbeschreibung.

---

## 9. Beispiel-Vorlagen

### 9.1 Seite mit Sticky-Header (Mobile First)

```tsx
import { Button } from '@ui/shad-cn/components/button';
import { ArrowLeft, Settings } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export function ExamplePage() {
  const { t } = useTranslation('example');

  return (
    <div className="mx-auto min-h-dvh w-full max-w-[600px] md:border-x md:border-border">
      <header className="sticky top-0 z-10 flex h-14 items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur">
        <Button variant="ghost" size="icon-md" aria-label={t('back')}>
          <ArrowLeft className="size-5" />
        </Button>
        <h1 className="flex-1 truncate text-title font-bold">{t('title')}</h1>
        <Button variant="ghost" size="icon-md" aria-label={t('settings')}>
          <Settings className="size-5" />
        </Button>
      </header>

      <main>{/* Liste / Inhalt */}</main>
    </div>
  );
}
```

### 9.2 Listenzeile im Twitter-Stil

```tsx
<article className="flex gap-3 border-b border-border px-4 py-3 transition-colors hover:bg-accent/50">
  <Avatar className="size-10 shrink-0">{/* … */}</Avatar>
  <div className="min-w-0 flex-1">
    <div className="flex items-center gap-1 text-body">
      <span className="truncate font-bold">{name}</span>
      <span className="truncate text-muted-foreground">@{handle} · {time}</span>
    </div>
    <p className="mt-0.5 text-body whitespace-pre-line break-words">{text}</p>
    <div className="mt-2 flex max-w-sm justify-between text-muted-foreground">
      {/* Icon-Buttons: variant="ghost" size="icon-sm" + aria-label */}
    </div>
  </div>
</article>
```

### 9.3 Formular im Drawer

```tsx
<AppFormDrawer
  open={open}
  onOpenChange={setOpen}
  title={t('edit.title')}
  locked={isSaving}
  footer={
    <Button size="xl" className="w-full" disabled={!isValid} data-state={isSaving ? 'loading' : undefined}>
      {t('save')}
    </Button>
  }
>
  {/* field + label + input … */}
</AppFormDrawer>
```

### 9.4 Leerer Zustand

```tsx
<Empty>
  <EmptyHeader>
    <EmptyMedia><Inbox className="size-6" /></EmptyMedia>
    <EmptyTitle>{t('empty.title')}</EmptyTitle>
    <EmptyDescription>{t('empty.description')}</EmptyDescription>
  </EmptyHeader>
  <EmptyContent>
    <Button>{t('empty.action')}</Button>
  </EmptyContent>
</Empty>
```

---

## 10. Verboten ❌

- Hex-/RGB-Farben, Tailwind-Standardfarben (`bg-blue-500`, `text-gray-500`) statt Tokens
- Neue UI-Bibliotheken oder selbstgebaute Kopien von shadcn-Komponenten
- Desktop-First-CSS (`max-*:`-Breakpoints als Grundlage, feste Pixelbreiten)
- Willkürliche Werte (`text-[14px]`, `p-[13px]`, `rounded-[7px]`)
- Schatten und Verläufe auf normalen Flächen, Karten-in-Karten
- Zentrierte Modals auf Mobile für Formulare
- Hartcodierte Texte, fehlende `aria-label` bei Icon-Buttons
- Mehr als eine schwarze Hauptaktion pro Screen
- Seiten ohne Lade-, Leer- und Fehlerzustand
- `outline-none` ohne sichtbaren Fokus-Ersatz
- Riesen-Komponenten (> ~150 Zeilen, mehrere Aufgaben, Logik und JSX vermischt)

---

## 11. Checkliste vor Abgabe ✅

- [ ] Auf **375 px** geprüft, kein horizontales Scrollen, dann `md` und `lg`
- [ ] **Hell und Dunkel** geprüft
- [ ] Nur Komponenten aus `@ui/shad-cn/components` / `@ui/patterns`
- [ ] Komponenten klein: eine Aufgabe, ≤ ~150 Zeilen, Logik in Hooks ausgelagert
- [ ] Nur Theme-Tokens und definierte Textgrößen
- [ ] Touch-Ziele ≥ 44 px, Hauptaktion in Daumenzone
- [ ] Lade-, Leer-, Fehler- und Erfolgszustand vorhanden
- [ ] Overlays schließen mit Zurück/Wischen, Löschen wird bestätigt
- [ ] Alle Texte übersetzt (`de`, `en`, `ru`), `aria-label` gesetzt
- [ ] Tastatur-Navigation und Fokus sichtbar
- [ ] Bei Änderungen an shadcn-Komponenten: Frontend **und** Admin angepasst
- [ ] `npm run lint` und `npm run format:check` ohne Fehler
