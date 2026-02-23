ARCHITECTURE: HEADLESS MULTI-SITE LOGIC (v1.1)

1. LOKALE QUELLEN-STRUKTUR

Das Projekt ist als Monorepo organisiert. Der /cms Ordner ist eine lokale Abhängigkeit.

Root: /project-root

CMS Path: /project-root/cms (Enthält Grav-Core und User-Daten).

Frontend Path: /project-root/frontend (Astro-Projekt).

2. BUILD-PIPELINE (SSG FLOW)

Redaktion: Inhalte werden im lokalen Grav-Admin (PHP-basiert) gepflegt.

Abruf: Während des npm run build im Frontend greift Astro über das Dateisystem direkt auf die Markdown-Dateien in ../../cms/user/pages zu.

Ausgabe: Astro generiert statische Assets in /frontend/dist.

3. MULTI-SITE & ASSETS

Globale Assets: Gespeichert in /cms/user/pages/shared/.

Lokale Assets: Markenspezifische Medien in /cms/user/pages/[site-folder]/.

Routing: Die Umgebungsvariable SITE_CONTEXT steuert, welcher Content-Zweig gebaut wird.

4. SERVER-ANFORDERUNGEN

Lokal: PHP 8.2+, Composer.

Produktion: Hetzner VPS (Ubuntu 24.04), Nginx als Reverse Proxy.