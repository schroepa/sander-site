# Verbesserungsliste – Sander Catering Onepager

| # | Verbesserung | Schwierigkeit | Ausmaß | Aufwand | Typ |
|---|---|---|---|---|---|
| 1 | `grav.ts` aufteilen in `types.ts`, `reader.ts`, `config.ts` | Mittel | Hoch | Mittel | Architektur |
| 2 | Fehlerbehandlung wenn Grav-Dateien fehlen (Build bricht stumm) | Niedrig | Hoch | Niedrig | Code-Qualität |
| 3 | Hardcodierte Pfad-Splits (`split("/").pop()`) durch `path.basename()` ersetzen | Niedrig | Mittel | Niedrig | Code-Qualität |
| 4 | ESLint + Prettier Setup im Root hinzufügen | Niedrig | Mittel | Niedrig | DX |
| 5 | `cookies.txt` aus Git-Repo entfernen (Sicherheitsrisiko) | Niedrig | Hoch | Niedrig | Sicherheit |
| 6 | Hilfsskripte (`convert.py`, `fix_homepage_yaml.py`, `extract-cta.js`) dokumentieren oder entfernen | Niedrig | Niedrig | Niedrig | Code-Qualität |
| 7 | `robots.txt` + `sitemap.xml` im Frontend ergänzen | Niedrig | Mittel | Niedrig | SEO |
| 8 | Hintergrundvideo im Hero mit `preload="none"` optimieren | Niedrig | Mittel | Niedrig | Performance |
| 9 | Bilder auf Astro `<Image />`-Komponente umstellen (automatisch WebP, lazy-load) | Mittel | Hoch | Mittel | Performance |
| 10 | `HeroCanvas.tsx` mit `client:visible` als Astro Island laden | Niedrig | Mittel | Niedrig | Performance |
| 11 | WebGL-Fallback für `HeroCanvas.tsx` (Geräte ohne WebGL-Support) | Mittel | Mittel | Mittel | UX |
| 12 | i18n vollständig abschließen (alle Inhalte übersetzen, Routing testen) | Hoch | Hoch | Hoch | Architektur |
| 13 | TypeScript-Interfaces in `grav.ts` strenger typen (weniger optionale `?`-Felder) | Mittel | Mittel | Mittel | Code-Qualität |
| 14 | Interaktions-Logik aus `SmartCatering.astro` und `StickyScroll.astro` in eigene `.ts`-Dateien auslagern | Mittel | Mittel | Mittel | Architektur |
| 15 | Grav-Admin unter `/admin` absichern (IP-Whitelist oder HTTP-Auth) | Mittel | Hoch | Niedrig | Sicherheit |
| 16 | CI/CD-Pipeline (`deploy.yml`) wiederherstellen und testen | Mittel | Hoch | Mittel | DX |
| 17 | Build-Cache für Markdown-to-HTML-Konversion einführen | Hoch | Mittel | Hoch | Performance |
| 18 | E2E-Tests (z. B. Playwright) für kritische Sektionen einrichten | Hoch | Hoch | Hoch | Code-Qualität |
| 19 | Component-Dokumentation / Storybook einrichten | Hoch | Mittel | Hoch | DX |

---

**Legende**

- **Schwierigkeit:** Niedrig = straightforward, wenig Domänenwissen nötig · Mittel = Refactoring/Konfiguration · Hoch = strukturelle Änderungen, viel Abstimmung
- **Ausmaß:** Wie stark die Verbesserung das Projekt positiv beeinflusst
- **Aufwand:** Geschätzte Implementierungszeit (Niedrig < 1h · Mittel 1–4h · Hoch > 4h)
- **Typ:** Architektur · Code-Qualität · DX (Developer Experience) · Performance · SEO · Sicherheit · UX
