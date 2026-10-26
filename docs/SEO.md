# SEO (Stand: 26.10.2026)

Ideensammlung / Backend: `/Volumes/Dev/runtime/src/shared/seo` (Doku dort: `README.md`).
Vorgaben des Nutzers für UI: Usability, X/Twitter-Look, nur Schwarz/Weiß, möglichst nur shadcn-Komponenten, Mobile First.

## Frontend

| Wo | Was |
| :-- | :-- |
| `src/core/seo/` | `SeoManager` (Extension, sortOrder 210): setzt bei jedem Routenwechsel `<title>` (mit Vorlage), description, canonical, robots, Open Graph, X-Cards, JSON-LD (`@graph`: Organization, WebSite, Seitentyp). Daten: Runtime `seoConfig`. |
| `src/core/seo/resolve.ts` | Reihenfolge: `useSeo()` der Seite → genauer Pfad → längster `/*`-Präfix → Route-`meta.title` → Standardwerte. Private Pfade (admin, auth, login, user, files/s, transfer/…, meet/…) immer `noindex`. |
| `useSeo(meta)` | Seiten mit eigenen Daten überschreiben den Eintrag (genutzt in `module/admin/components/SitePageView.tsx`). |
| `refreshSeoConfig()` | Lädt die Config neu (nach Admin-Änderungen). |
| `src/module/seo/` | Admin `/admin/seo` (Menü „Administration“, sortOrder 25), Tabs: Seiten (Einträge pro Pfad, Drawer mit Google-/X-Vorschau), Allgemein (Website-Name, Titel-Vorlage, Standardwerte, X-Account, Logo, sameAs, Indexierung global), Sitemap (Status, neu erzeugen, Filter nach Quelle). i18n-Namespace `seo` (de/en/ru). |
| `src/module/admin` | Eigene Seiten haben `seoIndex` (Schalter „In Suchmaschinen zeigen“ im Formular, Badge „Nicht in Suche“ in der Liste). Aus = `noindex` + nicht in der Sitemap. Nur-für-Angemeldete-Seiten nie indexiert. |
| `public/robots.txt` | Disallow für private Pfade, `Sitemap:` zeigt auf das Backend (:8032). |

## Wichtig / offen

- `sitemap.xml` wird vom **Backend** erzeugt und ausgeliefert (`ASSETS_HOST` + `HTTP_PORT`, Override `SITEMAP_PUBLIC_URL`), nicht von Vite. Links darin zeigen auf `FRONTEND_URL`.
- SPA: Google rendert JS und sieht die Meta-Tags. X/WhatsApp/Facebook lesen nur das rohe `index.html` → Link-Vorschauen brauchen später Server-Side-Injection (Nginx oder Runtime). Noch nicht gebaut.
- Noch nicht im Browser / gegen echte DB getestet (nur tsc + eslint). Erster Bug-Report des Nutzers: Sitemap-Adresse zeigte auf das Frontend → behoben, Bestätigung steht aus.
