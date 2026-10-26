# Kids – Konzept (Kinder-App)

Stand: 19.10.2026 · Status: **Konzept weitgehend umgesetzt** (offene Punkte siehe „Noch nicht umgesetzt“) (Backend + Frontend kompilieren, Lint ok, alle 89 GraphQL-Operationen zwischen Frontend und Backend abgeglichen, 22 neue Logik-Checks für Timer, Abzugs-Limit und Zahler grün) · noch nicht vollständig im Browser durchgeklickt

**Umbau 19.10.2026:** Es gibt keine von Eltern angelegten Kinder-Konten mehr. Kinder registrieren sich ganz normal, Eltern suchen sie und schicken eine Verbindungsanfrage, die das Kind bestätigt (siehe „Konten & Beziehungen“).

- Frontend: `/Volumes/Dev/react-app-v2/apps/kids`
- Backend: `/Volumes/Dev/runtime/src/apps/kids`
- Design: Twitter-Look, Schwarz/Weiß, **Mobile First**, Usability
- Stack zusätzlich: **Tailwind**, **shadcn/ui**, **Formik** (Validierung)

## Umsetzungsstand

**Backend** `runtime/src/apps/kids` – 28 Tabellen (`EntityKids*`), 89 GraphQL-Operationen `kids<Name>`, Live-Kanal `kids`. Cron `kids-tick-cron-job` (jede Minute: Erinnerungen, verpasste Pflichtaufgaben, abgelaufene Reservierungen, Wochenabschluss, vergessene Lern-Timer) und `kids-generate-cron-job` (stündlich: Pflichtaufgaben für heute + morgen, wöchentliches Taschengeld, Wunschlisten-Erinnerungen).
- Services: `kids-family-service` (Haushalte, Verbindungen, **Verbindungsanfragen**, exakte Kind-Suche, Export), `kids-user-service` (Namen/Avatare, Freundschaft, exakte Suche nach Benutzername/E-Mail), `kids-task-service` (Katalog, Aufgaben, Vorschläge, Serien-Bonus), `kids-ledger-service` (Buchungen, Wochen, Auszahlung), `kids-review-service` (Wochenrückblick, Elternbewertung), `kids-money-service` (Taschengeld-Konto, Sparziele, Wünsche), `kids-wish-service` (Wunschliste, Reservierungen, Freigabe-Link), `kids-school-service` (Fächer, Noten, Prüfungen, Hausaufgaben, Zeugnisse), `kids-comfort-service` (Kummerkasten), `kids-media-service` (Fotos + Sprachnachrichten über `mesh-upload-service`)
- Reine Logik getestet (42 + 22 Checks): `utils/permissions.ts` (Rechte, `settle()`, Abzugs-Limit, fester Zahler), `utils/time.ts` (Zeitzone, Zeitumstellung), `utils/schedule.ts`, `utils/school.ts` (gewichteter Schnitt, Verbesserung, Lernzeit-Punkte), `utils/occasion.ts` (Ostern, Geburtstag inkl. 29. Februar)

**Frontend** `react-app-v2/apps/kids` – Routen `/kids` (+ `/kid/<id>`, `/confirm`, `/catalog`, `/family`, `/points`, `/comfort`, `/review`, `/ratings`, `/money`, `/wishes`, `/school`, `/settings`, `/people`) und die öffentliche Freigabe-Seite der Wunschliste (`/kids-wish/<token>`). Formik + Yup in shadcn-Drawern, Wischgesten, Offline-Warteschlange, Notification-Actions, de/en/ru. Als PWA erscheint die App im „Teilen“-Menü des Handys (`share_target` → `/kids/wishes`, Wunsch wird vorausgefüllt).

**Umgesetzt (zusätzlich zum MVP)**
- **Wochenrückblick** als Story: Meine Woche → Selbstbewertung (Stimmung, Aufgaben, Mithelfen, stolz, besser machen; Sichtbarkeit je Altersstufe) → Wochenziel → Eltern bewerten (Kategorien, nur der Bewertete sieht es). Eltern antworten, Wunsch „erfüllt“, Ziel „geschafft“ + optionaler Bonus, Timeline „Meine Wochen“, Seite „Meine Bewertungen“, Stimmungs-Frühwarnung an Erziehungsberechtigte
- **Taschengeld-Konto & Sparziele**: Auszahlung „aufs Konto“ bucht dort, wöchentliche Gutschrift, Ein-/Auszahlungen, Sparziele mit Fortschritt, Wünsche des Kindes (Auszahlung / Belohnung) mit Zustimmung
- **Wunschliste**: Anlässe (Geburtstag, Weihnachten, Ostern, Sonstiges), Foto/Link/Preis/Priorität, „Ich schenke das“ mit Anteil (Kind sieht es nie), Erinnerung 3 Wochen vorher, „Spar ich mir selbst“, erhalten + Danke, Freigabe-Link für Personen ohne Konto
- **Schule**: Fächer, Noten 1–6 oder 0–15 mit Gewichtung und Schnitt, Kind trägt ein – Eltern bestätigen, Foto der Arbeit, Unterschrift, Prüfungen mit automatischen Lern-Aufgaben, Hausaufgaben als Aufgaben, Zeugnisse mit Bonus, Punkte-Regeln (Verbesserung, Lernen, Eintragen, optional feste Notenpunkte / Minuspunkte)
- **Lernzeit-Timer** (19.10.): Kind (oder Guardian bei Kleinen) startet den Timer in „Schule“, optional mit Fach, und tippt „Fertig“. Der Server misst die Zeit (höchstens 120 Min. pro Sitzung, vergessene Timer stoppt der Cron). Punkte pro vollem Block (Standard 20 Min. = +3), Tageslimit (Standard 9, leer = keins), Buchung als Quelle „Lernzeit“, Guardians bekommen eine Info. Einstellbar in den Schul-Einstellungen, 0 Punkte = Timer aus.
- **Abzugs-Limit pro Woche** (19.10.): optional im Punktwert-Formular. Zählt nur Minuspunkte von Hand, verpasste Pflichtaufgaben nicht. Der Minus-Dialog zeigt „noch X von Y“, der Server lehnt mehr ab (`deduct_limit`).
- **Fester Zahler** (19.10.): optional im Punktwert-Formular (Auswahl erscheint ab zwei Guardians). Dann kann nur dieser Guardian auszahlen, die anderen sehen „Auszahlen übernimmt Papa“. Ist der Zahler kein Guardian mehr, dürfen wieder alle. Abzugs-Limit und Zahler laufen wie der Punktwert über die Zustimmung der anderen Guardians.
- **Kleineres**: Nachweis-Foto bei Aufgaben, Kind schlägt Extra-Aufgaben vor, Serien-Bonus, Kind benennt Bezugspersonen um, Sprachnachricht im Kummerkasten, Datenexport pro Kind (JSON)

**Änderungen außerhalb der App**
- `runtime/src/shared/utils/time.zone.ts` (aus My Events verschoben, `apps/my-events/utils/time.ts` re-exportiert nur)
- `react-app-v2/src/ui/base/BaseDateSelector.tsx` (wiederverwendbar)
- `react-app-v2/vite.config.ts` – `share_target` im PWA-Manifest
- `react-app-v2/src/core/notify/locales/*` – Button-Text `default.button.confirm`
- **Beim Umbau 19.10. zurückgebaut:** `registerGraphqlTokenGuard` (`shared/graphql/actions/token.ts`), `registerUserRelationGuard` und die Kind-Sperre für Freundschaften (`shared/user/relation/services/request/…`), Sperre des E-Mail-Logins für Kinder im Kids-Bootloader, Abmelde-Dialog ohne E-Mail bei Kindern, Paket `uqr` (QR-Code). Diese Dateien sind wieder im Stand vor der Kids-App.

**Bewusste Abweichungen vom Konzept**
- Woche = Mo–So, Bestätigen bis **Montag 20:00**, dann Abrechnung
- **Verbindung trennen** (Kind aus seiner letzten Familie entfernen) geht nur, wenn es genau einen Erziehungsberechtigten gibt. Das Konto des Kindes bleibt, alle Kids-Daten werden gelöscht.
- Suche nach Kindern nur **exakt** (Benutzername oder E-Mail), keine Teiltreffer. Das Kind wird auch gefunden, wenn es in der normalen Nutzersuche ausgeblendet ist. Geschützt ist es dadurch, dass es selbst bestätigen muss.

**Noch nicht umgesetzt** (vorgemerkt am 18.10.2026, kommen wir später drauf zurück):
1. Abrechnungszeit einstellbar (aktuell fest Montag 20:00)
2. Helfer sehen nur freigegebene Fächer (z. B. Nachhilfe nur Mathe)
3. Pull-to-refresh und Stern-Animation beim Abhaken
4. Vertrauensperson außerhalb des Haushalts als eigene Funktion (heute nur per Einladung als Zuschauer)
5. Kompletter Durchklick-Test im Browser
6. Offen nach dem Umbau: Darf das Kind eine Verbindung selbst wieder lösen? (Aktuell nein, nur Erwachsene.)

Durch den Umbau entfallen: Biometrie-Login (WebAuthn), Bild-PIN, Familien-Tablet, PIN-/QR-Login, Ablösung ab 16, Freundschafts-Freigaben.

**Testen**
1. Runtime neu starten (DB-Sync legt `EntityKidsConnect` an und entfernt die alten Login-/Tablet-/Freigabe-Spalten und -Tabellen), dann `npm run dev` neu starten – der Mesh-Plugin generiert dabei die GraphQL-Dokumente neu.
2. Zwei Konten normal registrieren: Elternteil und Kind.
3. Als Elternteil `/kids` → Familie anlegen → „Kind verbinden“ → exakten Benutzernamen oder E-Mail des Kindes eingeben → Beziehung + Name („Papa“) → Anfrage senden.
4. Als Kind: Notification „Bestätigen“ oder `/kids` → „Verbindungsanfragen“ → Bestätigen. Danach sieht das Kind seinen „Heute“-Screen.
5. Drittes Konto (z. B. Oma, eigener Haushalt) verbindet sich mit demselben Kind: Kind bestätigt, **und** der erste Elternteil muss unter „Zustimmung nötig“ zustimmen und die Rechte festlegen.
6. Katalog füllen, als Kind abhaken, als Elternteil bestätigen; nach dem Wochenabschluss Rückblick, Auszahlung aufs Konto, Wunschliste und Schule durchspielen.
7. Zweiten Erwachsenen in den Haushalt einladen (muss befreundet sein) für Helfer-Rechte, Zustimmungen und Live-Updates.

## Ziel

Eine App für Familien: Kinder haben eigene Konten, erledigen Aufgaben, sammeln Plus- und Minuspunkte und bekommen am Wochenende einen Bonus in Geld, den die Eltern auszahlen. Dazu kommen Selbstbewertung, Bewertung der Eltern durch das Kind und schulische Leistungen.

## Entscheidungen

| Frage | Entscheidung |
|---|---|
| Abhängigkeit zu My Events? | **Keine.** Kein Import aus `apps/my-events`, kein Familien-Kalender. Gemeinsames wandert nach `shared/` |
| Haben Kinder eigene Konten? | **Ja, ganz normale User-Konten.** Das Kind registriert sich selbst, Eltern legen kein Konto an |
| Wie kommen Eltern und Kind zusammen? | Elternteil sucht das Kind (Benutzername / E-Mail exakt), schickt eine Anfrage, **das Kind bestätigt** |
| Kind hat schon Erwachsene | Kind bestätigt **und** ein bestehender Guardian stimmt zu und legt die Rechte fest |
| Login | Normaler Login der Plattform – kein PIN, kein QR, kein Familien-Tablet |
| Sonderregeln für Kinder auf der Plattform | **Keine.** Kids ist nur eine App, mit der das Kind verbunden ist (andere Apps, Freundschaften, Suche wie bei allen) |
| Belohnungssystem | Punkte → Wochenabschluss → Bonus in Geld, ausgezahlt durch die Eltern |
| Wer legt den Punktwert fest? | Die Eltern, **pro Kind** (Familien-Standard überschreibbar) |
| Minuspunkte | **Ja**: automatisch bei versäumter Pflichtaufgabe und manuell durch Eltern (mit Pflicht-Grund) |
| Woche endet im Minus | **Minus wird in die nächste Woche übertragen** (Kinder sollen aus Fehlern lernen) |
| Patchwork (zwei Haushalte) | **Ein gemeinsames Punktekonto** pro Kind über alle Haushalte |
| Aufgaben | Eltern pflegen einen **Katalog**; Pflichtaufgaben werden zugeteilt, **Zusatzaufgaben sucht sich das Kind selbst aus** |
| Kind ↔ Eltern | Beziehung („Papa“) und Rechte (`guardian`/`helper`/`viewer`) sind getrennt |
| Kind bewertet Eltern | **Ja**, jeden Elternteil einzeln, im Wochenrückblick |
| Selbstbewertung | **Ja**, im Wochenrückblick, mit Wochenziel |
| Schulische Leistungen | Noten, Prüfungen, Hausaufgaben, Zeugnisse; Kopplung an Punkte einstellbar |
| Geräte | Mobile First, als PWA installierbar |

## Konten & Beziehungen

### Kind = normales Konto
- Das Kind **registriert sich ganz normal** (E-Mail, Passwort, Benutzername) und meldet sich wie alle an.
- Eltern legen **kein** Konto an und verwalten weder Login noch Passwort noch Benutzernamen des Kindes.
- Im Kids-Profil (`KidProfile`) pflegen Guardians nur App-Daten: Anzeigename in der App, Altersstufe, Symbol, Geburtstag, Punktwert usw. Das Profil entsteht, wenn die **erste** Verbindung bestätigt ist.
- Auf der leeren Startseite sieht ein noch nicht verbundenes Kind den Hinweis „Sag Mama oder Papa deinen Benutzernamen“.

### Verbindungsanfrage (`ConnectRequest`)

1. Ein Guardian eines Haushalts tippt „Kind verbinden“ und gibt den **exakten Benutzernamen oder die E-Mail** ein (keine Teiltreffer, Kinder lassen sich nicht durchstöbern).
2. Treffer zeigt Avatar + Name und den Zustand: *noch mit niemandem verbunden* · *schon mit Erwachsenen verbunden* · *schon in dieser Familie* · *Anfrage läuft*. Wer in einem Haushalt **Erwachsener** ist, kann nicht als Kind verbunden werden.
3. Der Erwachsene wählt Beziehung (Mutter, Vater, Oma …), Namen („Papa“) und – falls das Kind schon Erwachsene hat – seine gewünschten Rechte.
4. **Das Kind bestätigt** (Notification-Action oder Karte „Verbindungsanfragen“ oben in `/kids`). Hinweis: „Bestätige nur Menschen, die du wirklich kennst.“
5. Hat das Kind schon Guardians, muss **einer von ihnen zustimmen** und legt dabei die Rechte des Neuen fest (`guardian`/`helper`/`viewer`; aus der Notification heraus gilt der Vorschlag).
6. Sobald alles bestätigt ist: Kind wird Mitglied im Haushalt, die Verbindungen zu den Erwachsenen entstehen. Andere Erwachsene dieses Haushalts bekommen **höchstens** die Rechte, die der Anfragende bekommen hat.
7. Ablehnen (Kind oder Guardian) oder Zurückziehen (Anfragender / Guardian des Haushalts) löscht die Anfrage.

Das **erste** verbundene Elternteil ist immer `guardian` (jedes Kind braucht einen).

### Verbindung trennen
- Kind aus einem von mehreren Haushalten entfernen: wie bisher durch einen Guardian.
- Kind aus seinem **letzten** Haushalt entfernen = **Verbindung trennen**: nur, wenn der Handelnde der **einzige** Guardian ist (Bestätigungs-Dialog). Das Konto des Kindes bleibt, alle Kids-Daten werden gelöscht.
- Löscht ein Kind sein Plattform-Konto, verschwinden seine Kids-Daten mit.

### Altersstufen (von Eltern eingestellt, nicht automatisch)

| Stufe | Typisches Alter | Ansicht | Darf |
|---|---|---|---|
| **Klein** | bis ~7 | nur Symbole, sehr große Kacheln | abhaken, „Was ist heute?“ |
| **Schulkind** | ~8–12 | einfacher Text | abhaken, Zusatzaufgaben wählen, Wünsche schicken, Noten eintragen |
| **Teen** | ~13+ | fast normale App | zusätzlich private Inhalte, mehr Selbstbestimmung |

### Verbindung Kind ↔ Erwachsener

Ein Eintrag pro Kind und Erwachsenem:

| Feld | Beispiel | Zweck |
|---|---|---|
| `kidUserId` | Lena | das Kind |
| `adultUserId` | Thomas | der Erwachsene |
| `relation` | `father` | Mutter, Vater, Stiefmutter, Stiefvater, Oma, Opa, Tante, Onkel, Babysitter, Sonstige |
| `label` | „Papa“ | wie das Kind ihn sieht, frei änderbar |
| `access` | `guardian` | Rechte-Stufe |
| `status` | `accepted` | angenommen |

Das Kind sieht überall den `label` („**Papa** hat ‚Zimmer aufräumen‘ bestätigt“).

### Haushalt
- „Familie Müller“ mit Erwachsenen und Kindern. Wer in den Haushalt eingeladen wird, bekommt die Verbindung zu allen Kindern; Rechte pro Kind feinjustierbar.
- Geschwister ergeben sich aus dem Haushalt (wichtig für Reservierung von Zusatzaufgaben).
- **Patchwork:** Ein Kind kann in zwei Haushalten sein (zweiter Haushalt verbindet sich per Anfrage, Kind + ein Guardian stimmen zu). Jeder Haushalt hat seinen eigenen Aufgaben-Katalog, aber **alle Punkte laufen auf ein gemeinsames Konto des Kindes** (ein Punktwert, ein Wochenabschluss, ein Übertrag).

## Rechte-Regeln (`utils/permissions.ts`, serverseitig geprüft)

**Stufen:**
- `guardian` (erziehungsberechtigt): Kids-Profil verwalten (Altersstufe, Name in der App, Verbindung trennen), Katalog, Punktwert, Abzüge, Wochenabschluss, Auszahlung, Einladen, Verbindungsanfragen zustimmen
- `helper` (z. B. Oma, Babysitter, Stiefelternteil): Aufgaben bestätigen, Bonuspunkte geben; Minuspunkte nur, wenn die Guardians es erlauben; keine Geld-/Konto-Einstellungen
- `viewer` (z. B. Pate): Fortschritt sehen, optional Lob-Punkte schicken

**Regeln:**
1. Wer als Erster mit dem Kind verbunden wird (Kind bestätigt), ist der erste `guardian`.
2. Jedes Kind hat mindestens einen `guardian`; der letzte kann nicht austreten.
3. Kinder verbinden nur per Anfrage, die **das Kind bestätigt** (+ ein Guardian, falls vorhanden). Erwachsene einladen nur durch `guardian` und nur von Freunden; Annahme per Notification-Action.
4. Guardians können sich **nicht gegenseitig entfernen**, nur selbst austreten (Schutz bei getrennten Eltern). `helper`/`viewer` kann jeder Guardian entfernen.
5. Freundschaft beendet (`relation_ended`) → `helper`/`viewer` werden entfernt, `guardian` bleibt.
6. Kinder sehen nicht: Mitglieder-/Rechteverwaltung, Verlauf, Ausgaben zwischen Eltern, Privates der Geschwister.
7. Jede Änderung an Verbindungen, Anfragen und Rechten landet im Verlauf.

## Aufgaben

### Katalog (Eltern)
Jeder Eintrag (`TaskTemplate`) hat:
- Titel + Symbol (für Kinder, die noch nicht lesen)
- Pluspunkte beim Erledigen, Minuspunkte bei Versäumnis (nur Pflicht)
- Art: `required` (Pflicht) oder `extra` (Zusatz)
- Für wen: alle Kinder, bestimmte Kinder oder ab Altersstufe
- Wiederholung (täglich, bestimmte Wochentage …) und Frist in Ortszeit
- Optional Nachweis-Foto
- Bei Zusatzaufgaben: Limit pro Woche für die ganze Familie (z. B. „Auto waschen 1×“)

Vorlagen-Pakete zum Start („Haushalt Grundschule“, „Haushalt Teen“), von Eltern anpassbar.

### Pflichtaufgaben
- Von den Eltern zugeteilt, mit Frist.
- Erinnerung vor der Frist („Noch 1 Stunde: Hamster füttern“).
- Frist verpasst → Cron bucht automatisch die Minuspunkte.
- **Entschuldigt:** Eltern setzen die Aufgabe auf `excused` (krank, bei Oma) → kein Abzug.
- **Einspruch:** Kind widerspricht („Ich war beim Training!“), Eltern entscheiden mit einem Tippen.

### Zusatzaufgaben (Kind wählt)
1. Kind öffnet „Extra verdienen“ und sieht den Katalog als Karten mit Punkten.
2. „Ich mach's“ **reserviert** die Aufgabe; Geschwister sehen „Max macht das“.
3. Reservierung läuft ab (Standard: Tagesende) → wieder frei, **keine Minuspunkte**.
4. Abhaken → Bestätigung durch Eltern → Punkte.

Einstellbar durch Eltern: max. Zusatzaufgaben pro Tag/Woche, **„erst Pflicht, dann Extra“**.

Kinder können eigene Extra-Aufgaben vorschlagen („Ich hab das Auto gewaschen“), Eltern vergeben die Punkte.

### Status einer Aufgabe (`TaskInstance`)
`open` → `reserved` (nur Zusatz) → `done` → `confirmed`
sowie `rejected` (Eltern lehnen ab), `missed` (Frist verpasst), `excused`.

Abhaken rückgängig machen geht nur, solange noch nicht bestätigt. Bestätigen mehrere Eltern gleichzeitig, gewinnt der erste (Live-Update an die anderen).

## Punkte & Geld

### Buchungen (`PointEntry`)
- Jede Buchung: `+`/`−`, Punkte, Grund, Quelle (`task`, `manual`, `streak`, `goal`, `school`, …), gebucht von, Zeitpunkt.
- **Nur anhängen, nie ändern.** Korrektur nur per Gegenbuchung (wie ein Kontoauszug).
- Manuelle Abzüge brauchen immer einen Grund, den das Kind sieht. Grund-Vorschläge als Chips („Nicht gemacht“, „Zu spät“, „Gestritten“).
- Optional Abzugs-Limit pro Woche (nur manuelle Abzüge) – umgesetzt.

### Punktwert
- Pro Kind, z. B. 1 Punkt = 0,10 €. Währung pro Familie (Standard €).
- Intern **nur ganze Zahlen in Cent**.
- Änderungen gelten **sofort**, auch für die laufende Woche (Stand 19.10.2026): Punkte-Stand und € werden direkt neu berechnet. Bereits abgerechnete Wochen behalten ihren Punktwert. Gibt es mehrere Guardians, gilt die Änderung erst nach Zustimmung.
- Optional Wochen-Maximum für den Bonus.

### Wochenabschluss (`WeekSettlement`)
1. Cron rechnet zur eingestellten Zeit ab (Standard: Sonntag 18:00, Zeitzone des Kindes).
2. Nicht bestätigte Punkte: Nachfrist bis Montagabend, danach verfallen sie.
3. Ergebnis: `Übertrag + Plus − Minus = Saldo`, z. B. `0 + 48 − 6 = 42 Punkte → 4,20 €`.
4. **Saldo im Minus:** keine Auszahlung, das Minus wird als **Übertrag** in die nächste Woche mitgenommen (z. B. `−8` → nächste Woche startet bei `−8`). Ein positiver Saldo wird ausgezahlt, danach startet die neue Woche bei 0.
5. Ein Guardian (aus einem beliebigen Haushalt des Kindes; mit festem Zahler nur dieser) tippt „Ausgezahlt“ (bar oder aufs Taschengeld-Konto). Erst dann ist die Woche abgeschlossen.
6. Verlauf jeder Woche: Übertrag, Punkte, Punktwert (beim Abrechnen festgeschrieben), Betrag, wer ausgezahlt hat.

**Übertrag sichtbar machen:** Auf dem Kind-Screen steht ein Minus-Übertrag ehrlich, aber motivierend da („Du startest bei −8. Noch 8 Punkte, dann bist du wieder im Plus“). Damit ein Kind nicht dauerhaft im Loch steckt, können die Eltern optional eine Untergrenze festlegen (z. B. höchstens −50 Übertrag).

Der Cron ist **idempotent**: keine Doppelbuchungen, auch nicht bei Neustart.

### Motivation
- Serien-Bonus (z. B. 7 Tage alle Pflichtaufgaben → +5)
- Fortschrittsbalken bis Wochen-Maximum oder Sparziel
- Spontane Bonuspunkte durch Eltern mit Grund

### Taschengeld-Konto & Sparziele
- Konto pro Kind mit Ein-/Auszahlungen, optional automatische wöchentliche Gutschrift.
- Sparziele („Lego-Set: 34 € von 60 €“).
- Kind kann Wünsche schicken (Auszahlung, Belohnung einlösen).

## Wochenrückblick (Story-Format)

Ein Schritt pro Screen, Tippen rechts = weiter, jederzeit abbrechbar, Zwischenstand bleibt.

1. **Meine Woche:** Punkte, erledigte Aufgaben, Bonus in € (automatisch)
2. **Selbstbewertung**
3. **Wochenziel** für die nächste Woche
4. **Eltern bewerten** (optional)

### Selbstbewertung (`SelfReview`)
- Stimmung, Aufgaben geschafft, Mithelfen (Symbole/Sterne je nach Stufe)
- „Darauf bin ich stolz“ (Bild-Auswahl oder Freitext)
- „Das will ich besser machen“ → wird zum Wochenziel
- **Keine Punkte für die Selbstbewertung**, sonst bewertet sich jedes Kind mit 5 Sternen
- Eltern antworten mit „Darauf bin ich stolz bei dir“, **kein Gegen-Sterne-Vergleich**
- Timeline „Meine Wochen“ für das Kind
- Stimmungs-Frühwarnung: mehrere Wochen schlecht → dezenter Hinweis an Guardians ohne Inhalte (bei Teens nur mit Erlaubnis)

### Wochenziel (`WeekGoal`)
- Vom Kind selbst gesetzt, steht die ganze Woche oben auf dem Kind-Screen.
- Beim nächsten Rückblick: „Geschafft?“. Eltern **können** Bonuspunkte vergeben (nicht automatisch).

### Eltern bewerten (`AdultRating`)
- Jeder Erwachsene **einzeln**, nach dem Wochenabschluss, freiwillig.
- Kategorien statt Gesamtnote: Zeit, Fair, Zuhören, Versprechen, Schnell bestätigt. Eltern können Kategorien ausblenden.
- Immer positiv starten: „Was war toll?“, dann „Was wünschst du dir?“.
- **Jeder Erwachsene sieht nur seine eigene Bewertung**, keine Vergleiche, keine Rangliste. Das Kind sieht vor dem Absenden „Nur Papa sieht das“.
- Eltern können antworten („Danke!“, Vorsatz) und einen Wunsch als „erfüllt“ markieren (`RatingReply`).
- Bewertungen sind für Eltern nicht änderbar und nicht löschbar.
- **Technisch komplett getrennt von Punkten und Geld.**
- Teen: optional „anonym“, nur wenn mehrere Kinder im Haushalt.

### Sichtbarkeit Selbstbewertung

| Stufe | Standard |
|---|---|
| Klein | Guardians sehen alles |
| Schulkind | Guardians sehen alles, Freitext optional „nur für mich“ |
| Teen | privat, Kind entscheidet pro Woche, mit wem es teilt |

## Schule

### Fächer & Noten
- Fächer pro Kind und Schuljahr, Vorlagen nach Schulart (Grundschule, Mittelschule, Realschule, Gymnasium).
- Notensystem: 1–6 (mit +/−) oder 0–15 Punkte.
- Arten mit Gewichtung pro Fach (Schulaufgabe, Ex, Abfrage, mündlich, Referat).
- Schnitt pro Fach und gesamt; optional „Was brauche ich für eine 2?“.
- Foto der Arbeit anhängen.
- Kind trägt ab Schulkind selbst ein, Eltern bestätigen. Klein-Modus: Eltern tragen ein.

### Prüfungen, Lernen, Hausaufgaben
- **Prüfungstermine** als eigenes schlankes Modell (kein Kalender): Fach, Art, Datum, Themen, Erinnerungen.
- **Lernplan:** Zu einer Prüfung schlägt die App Lern-Aufgaben vor, die als Zusatzaufgaben mit Punkten laufen.
- **Lernzeit-Timer** mit Punkten (Anstrengung belohnen) – umgesetzt, siehe Umsetzungsstand.
- **Hausaufgaben** als Pflichtaufgaben mit Frist; „Unterschrift nötig“ als Eltern-Aufgabe.

### Zeugnisse
- Foto ablegen, Noten übernehmen, einmaliger Zeugnis-Bonus durch Eltern, Verlauf über die Jahre.

### Noten und Punkte (Standard-Regeln, von Eltern änderbar)

| Regel | Beispiel | Standard |
|---|---|---|
| Verbesserung gegenüber Fach-Schnitt | 4 → 3: +10 | an |
| Lernen (Lernaufgaben, Timer) | 20 min: +3 | an |
| Note eingetragen (Ehrlichkeit) | +1 | an |
| Feste Punkte pro Note | 1: +15, 2: +10 … | aus |
| Minuspunkte für schlechte Noten | 5: −5 | aus, Hinweis beim Aktivieren |
| Verheimlichte Arbeit | manueller Abzug | möglich |

### Sichtbarkeit
- Guardians sehen alles. Helfer (z. B. Nachhilfe) nur freigeschaltete Fächer. Teen: Noten für Guardians sichtbar, Lernnotizen privat.

## Wunschliste

### Für das Kind
- Listen nach Anlass: **Weihnachten**, **Geburtstag** (Datum aus dem Profil), **Ostern**, **„Einfach so“**
- Pro Wunsch: Titel, Foto, Link, ungefährer Preis, Priorität (1–3 Herzen), Notiz („in Blau, Größe 140“)
- **Teilen aus dem Shop:** Die PWA erscheint im „Teilen“-Menü des Handys (Web Share Target), ein geteiltes Produkt landet direkt auf der Liste
- Klein-Modus: nur Fotos, Eltern tragen ein oder bestätigen

### Für die Familie
- Bezugspersonen (`guardian`, `helper`, `viewer`) sehen die Liste und tippen **„Ich schenke das“** → für andere Schenkende reserviert, nichts wird doppelt gekauft
- **Das Kind sieht Reservierungen nie** (Überraschung bleibt)
- Zusammenlegen möglich („Oma + Pate je 50 %“)
- Erinnerung an Bezugspersonen vor dem Anlass (Standard: 3 Wochen vor dem Geburtstag bzw. Weihnachten)
- Optional Freigabe per Link für Personen ohne Verbindung in der App (nur lesen + reservieren)

### Verbindung zum Punktesystem
- **„Spar ich mir selbst“:** Aus einem Wunsch wird mit einem Tippen ein Sparziel mit Fortschrittsbalken
- Nach dem Anlass hakt das Kind ab, was es bekommen hat, und kann sich bedanken („Danke Oma!“ als Notification)

## Kummerkasten

Ein Ort, an dem Kinder etwas loswerden können, ohne es aussprechen zu müssen. **Wichtig:** Der Kummer kann auch die Eltern selbst betreffen. Die App darf ein Kind nie in eine Lage bringen, in der seine Nachricht genau bei der Person landet, um die es geht, ohne dass es einen anderen Weg kennt.

### Funktion
- Das Kind wählt selbst, **an wen** die Nachricht geht: eine oder mehrere Personen. Niemand sonst sieht sie, auch nicht andere Guardians.
- Text, Sprachnachricht oder (Klein-Modus) Gefühls-Symbol + Bild („Ich bin traurig“)
- Optional „Ich will darüber reden“ / „Ich will nur, dass du es weißt“
- Empfänger antwortet persönlich, das Kind sieht „gelesen“
- Optional eine **Vertrauensperson außerhalb des Haushalts** (z. B. Tante, Pate), die beim Einrichten festgelegt wird und die das Kind direkt anschreiben kann

### Schutzregeln
- **Keine Kopplung an Punkte oder Geld**, niemals Abzüge wegen Inhalten (technisch getrennt)
- Erwachsene können Nachrichten **nicht löschen oder bearbeiten**
- **Immer sichtbar im Kummerkasten:** Hinweis „Du kannst auch mit jemandem außerhalb der Familie reden“ mit der **Nummer gegen Kummer 116 111** (kostenlos, anonym) und deren Online-Beratung; ein Tippen startet den Anruf
- Die App verspricht keine Hilfe, die sie nicht leisten kann: Sie ist ein Weg zu einer Vertrauensperson, keine Beratungsstelle
- Nachrichten erscheinen nicht im allgemeinen Verlauf und nicht in Eltern-Übersichten

## Mobile & Usability

### Grundregeln
- **Daumenzone:** Hauptaktionen in der unteren Bildschirmhälfte, oben nur Info.
- Tippflächen mindestens 48 px, im Klein-Modus 72 px+.
- **Bottom-Sheets (Drawer)** statt neuer Seiten für alles Kurze.
- Eine Hauptaktion pro Screen, groß und schwarz.
- Safe Areas beachten, Plattform-Navigation (Dock/Menü) mitnutzen, keine eigene untere Leiste.
- Basisbreite **375 px**, dann 390–430 px, dann Tablet (quer zweispaltig).

### Gesten (immer mit Button-Alternative)
- Aufgabe nach rechts wischen = erledigt (Haptik, Stern-Animation)
- Eltern: wischen = bestätigen/ablehnen, „Alle bestätigen“ als Button
- Pull-to-refresh auf Listen

### Tempo
- Notification-Actions „Bestätigen“/„Ablehnen“ direkt aus der Push-Nachricht (Aufgaben, Einladungen, Verbindungsanfragen)
- Optimistische UI, bei Fehler Toast mit „Nochmal“
- Offline-Warteschlange fürs Abhaken (IndexedDB), Duplikat-Erkennung über Client-ID
- Skeletons statt Spinner, letzter Stand sofort aus dem Cache
- Live-Updates über den WebSocket-Kanal (auch `connect:changed`)

### PWA
- „Zum Homescreen hinzufügen“ aktiv anbieten
- Web-Push, Offline-Cache, Splash-Screen, Vollbild

### Eingaben
- Kind-Suche: ein Feld „Benutzername oder E-Mail“, `autoCapitalize`/`autoCorrect` aus, Suchen per Enter
- Eingaben mindestens 16 px Schrift (kein iOS-Zoom), passendes `inputMode` (`numeric`, `decimal`)
- Kamera direkt für Nachweis-Fotos
- Speichern-Button klebt unten im Drawer über der Tastatur
- Validierung beim Verlassen des Feldes und beim Absenden, nicht bei jedem Tastendruck
- Bei Fehler zum ersten fehlerhaften Feld scrollen und fokussieren

### Design (Schwarz/Weiß)
- Nur `foreground`/`background`-Tokens, Dark Mode automatisch
- Unterscheidung über Symbole, Avatare und Strichstärke, nicht über Farbe
- **Plus = schwarz gefüllt, Minus = umrandet/durchgestrichen**
- Große fette Zahlen für Punkte und €, Buttons `rounded-full`, Karten mit feinem Rahmen statt Schatten
- Ruhige Animationen, `prefers-reduced-motion` beachten
- Teens bekommen den normalen Twitter-Look, keine „Baby-App“

## Screens

**Kind**
1. **Heute:** oben „42 Punkte = 4,20 €“ + Wochenziel + Countdown „Abrechnung in 2 Tagen“; darunter Pflichtaufgaben (Countdown bei naher Frist), dann „Extra verdienen“ als horizontale Karten-Leiste; ausstehende Punkte grau. Offene **Verbindungsanfragen** stehen ganz oben.
2. **Extra verdienen:** Katalog-Karten, „Ich mach's“
3. **Meine Punkte:** Wochenbilanz mit aufklappbarer Liste aller Plus/Minus samt Grund, Einspruch
4. **Taschengeld & Sparziele**
5. **Schule:** Fächer mit Schnitt + Trend-Pfeil, Note eintragen (Drawer: Fach → Art → Note → Foto), Prüfungen
6. **Wochenrückblick** (Story)
7. **Meine Wochen** (Timeline)
8. **Wunschliste:** Listen nach Anlass, Wunsch hinzufügen (auch über „Teilen“), „Spar ich mir selbst“
9. **Kummerkasten:** Empfänger wählen, Nachricht/Sprachnachricht/Gefühl, Antworten; Nummer gegen Kummer immer sichtbar

**Eltern**
1. **Heute:** oben „Zustimmung nötig“ (Anfragen anderer Erwachsener für meine Kinder); pro Kind eine Karte mit Punkten, € und Badge „X wartet auf Bestätigung“; Tippen → Drawer mit Wisch-Liste; „+“ unten rechts für Bonus, Abzug, neue Aufgabe
2. **Katalog:** Aufgaben anlegen/bearbeiten, Vorlagen
3. **Kind-Detail:** Buchungen, Wochenverlauf, Schule, Selbstbewertungen
4. **Wochenabschluss:** Betrag pro Kind, „Ausgezahlt“ (bar/Konto)
5. **Meine Bewertungen:** eigene Bewertungen + Trend, antworten
6. **Familie verwalten:** Haushalt, „Kind verbinden“ (Suche + Anfrage), offene Anfragen mit Status und „Zurückziehen“, Kids-Profil (Name, Altersstufe), Verbindung trennen, Bezugspersonen + Rechte, Einladungen
7. **Einstellungen:** Punktwert pro Kind, Wochen-Maximum, Abrechnungszeit, Regeln (erst Pflicht, Limits, Helfer-Abzüge, Noten-Regeln), Bewertungsfragen, Datenexport

## Tech-Stack

### Übernommen von der Plattform
- **Frontend** (`react-app-v2/apps/kids`): React, Aufbau wie `apps/forum`/`apps/my-events`: `app.tsx`, `api/`, `store/` (zustand), `hooks/`, `components/`, `pages/`, `locales/` (de, en, ru)
- **Backend** (`runtime/src/apps/kids`): TypeScript, `types/`, `orm/entities/`, `services/`, `handler/`, Resolver-Import, `boot.loader.ts`
- GraphQL mit Antwortformat `success`, `error`, `field`; Operationen mit Präfix `kids<Name>`
- can-bus, Cron, Notify (Inbox + Web-Push + Live), WebSocket-Kanal `kids`
- Login, Registrierung, Nutzerkonten: komplett von der Plattform, Kids hat keine eigene Anmeldung

### Neu
- **Tailwind:** Mobile-First-Klassen, Theme nur aus Graustufen auf `foreground`/`background`, Safe-Area-Utilities
- **shadcn/ui** (Basisfarbe `neutral`):

| Zweck | Komponente |
|---|---|
| Bottom-Sheets | Drawer (vaul) |
| Noten-Chips, Bewertungs-Symbole, Altersstufe | ToggleGroup |
| Zusatzaufgaben-Leiste | Carousel (embla) |
| Kinder-Umschalter, Treffer der Kind-Suche | Avatar |
| Wochen-Maximum, Sparziel | Progress |
| Laden | Skeleton |
| Toasts, „Rückgängig“ | Sonner |
| Einstellungen | Switch, Select, Input, Textarea |
| Kritische Bestätigungen (z. B. Verbindung trennen) | AlertDialog |
| Trends | Chart (recharts), nur dort geladen |

- **Formik + Yup:** shadcns `Form` (react-hook-form) wird **nicht** verwendet. Eigene Wrapper (`FormikField`, `FormikToggleGroup` …) verbinden Formik mit den shadcn-Eingaben (Label, Fehlertext, `aria-invalid`). Fehlertexte als i18n-Keys. Server-Fehler (`error` + `field`) per Helper mit `setFieldError` ans richtige Feld. Der Server bleibt maßgeblich.
- **Gesten/Haptik:** Pointer Events + `navigator.vibrate`, nur falls nötig eine kleine Gesten-Lib

### Grundsätze
- Keine Imports aus `apps/my-events`. `recurrence.ts` und `time.ts` werden nach `shared/` verschoben (nur Import-Pfade in My Events ändern sich).
- Rechte nur serverseitig in `utils/permissions.ts`; das Frontend blendet nur aus.
- Zeiten in UTC speichern, Familie hat eine Zeitzone (Standard Europe/Berlin).
- Geld nur als ganze Cent-Beträge.
- Spätere Verbindung zu anderen Apps nur lose über can-bus-Events.
- Kids greift nicht in Plattform-Konten ein (kein eigener `userType`, keine Sperren, keine Änderungen an Alias/Passwort).

### Änderungen außerhalb der App
- `shared/`: `time.zone.ts`
- `user/before_delete_users`: Kids-Daten, Verbindungen und Anfragen mit aufräumen
- Ggf. plattformweit: Tailwind-Einführung, PWA (Manifest, Service Worker)

## Datenmodell (grob)

| Entity | Inhalt |
|---|---|
| `Household` | Name, Zeitzone, Währung, Abrechnungszeit, Regeln |
| `HouseholdMember` | Haushalt, User, Rolle im Haushalt, Status |
| `ConnectRequest` | Haushalt, Kind, Anfragender, `relation`, `label`, vorgeschlagene Rechte, Kind bestätigt, Guardian zugestimmt (von wem), Guardians benachrichtigt |
| `KidLink` | Kind, Erwachsener, `relation`, `label`, `access`, `status` |
| `KidProfile` | Kind (normales Konto), Anzeigename in der App, Altersstufe, Zeitzone, Punktwert (Cent), Wochen-Maximum, Minus-Untergrenze, Abzugs-Limit, fester Zahler, Sichtbarkeits-Einstellungen (gilt haushaltsübergreifend) |
| `TaskTemplate` | Katalog-Eintrag (s. o.) |
| `TaskInstance` | konkretes Vorkommen, Status, Frist, reserviert von, Nachweis-Foto |
| `TaskObjection` | Einspruch des Kindes, Entscheidung |
| `PointEntry` | Buchung (nur anhängen) |
| `WeekSettlement` | Kind, Woche, Übertrag, Plus, Minus, Saldo, Punktwert (offen: aktueller Wert, abgerechnet: fest), Betrag, Status, ausgezahlt von |
| `AllowanceAccount` / `AllowanceEntry` | Taschengeld-Konto und Buchungen |
| `SavingsGoal` | Sparziel |
| `SelfReview` | Selbstbewertung, Sichtbarkeit |
| `WeekGoal` | Wochenziel, geschafft, Bonus |
| `ReviewReply` | Eltern-Antwort auf Selbstbewertung |
| `AdultRating` / `RatingReply` | Elternbewertung und Antwort |
| `Subject`, `Grade`, `Exam`, `Report` | Schule |
| `Study` | Lernzeit: Kind, Fach, Tag, Start, Ende, Minuten, Punkte, Status (läuft/fertig/abgebrochen) |
| `WishList` / `Wish` | Anlass, Datum; Wunsch mit Foto, Link, Preis, Priorität, Notiz, erhalten |
| `WishReservation` | Wunsch, Schenkende(r), Anteil in % (für Kind unsichtbar) |
| `ComfortMessage` / `ComfortReply` | Kummerkasten: Kind, Empfänger, Inhalt (Text/Audio/Symbol), Wunsch „reden“, gelesen, Antworten |
| `KidsLog` | Verlauf (wer, was, wann) |

## MVP

1. Haushalt, Eltern einladen (Freunde), **Kinder verbinden** (Suche + Anfrage, Kind bestätigt, ggf. Guardian stimmt zu), Altersstufe, Verbindungen + Rechte
2. Aufgaben-Katalog mit Vorlagen
3. Pflichtaufgaben mit Frist, Erinnerung, automatischen Minuspunkten, Entschuldigt, Einspruch
4. Zusatzaufgaben mit Reservieren, Limits, „erst Pflicht, dann Extra“
5. Bestätigen (auch gesammelt, auch aus der Notification), Buchungen als Kontoauszug
6. Wochenabschluss mit festgeschriebenem Punktwert, „Ausgezahlt“
7. Heute-Screens für Kind und Eltern, PWA-Installation
8. Kummerkasten mit Nummer gegen Kummer (wenig Aufwand, großer Nutzen)

**Danach:** Wochenrückblick (Selbstbewertung, Wochenziel, Elternbewertung) → Taschengeld-Konto & Sparziele → Wunschliste → Schule → Offline-Warteschlange

## Offene Punkte (mit Empfehlung)

| Frage | Empfehlung |
|---|---|
| Wer zahlt beim gemeinsamen Konto aus? | Jeder Guardian darf; optional fester „Zahler“ pro Kind – umgesetzt |
| Wer ändert Punktwert/Wochen-Maximum beim gemeinsamen Konto? | Änderung durch einen Guardian, die anderen Guardians müssen zustimmen (Schutz bei getrennten Eltern) – so umgesetzt |
| Untergrenze für Minus-Übertrag | Optional, von Eltern einstellbar (Vorschlag −50) |
| Darf das Kind eine Verbindung selbst lösen? | Offen (aktuell nein). Mit eigenem Konto spräche viel dafür, ab Teen-Stufe |
| Wunschliste per Link für Personen ohne Verbindung? | Ja, optional durch Guardian aktivierbar, nur lesen + reservieren, Link widerrufbar |
| Sichtbarkeit der Elternbewertung | Nur der bewertete Erwachsene; Kind kann per Schalter beide Guardians freigeben |
| Noten direkt an Punkte koppeln? | Standard: Anstrengung + Verbesserung belohnen, feste Notenpunkte optional |
| DSGVO | Einwilligung der Eltern unter 16 (Kind registriert sich selbst – Altersprüfung der Plattform beachten), Export und Löschung pro Kind, Fotos/Gesundheit/Noten nur für Berechtigte |
