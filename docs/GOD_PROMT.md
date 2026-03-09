INITIALER ARCHITEKTUR-MANDAT: PROJECT "VIBE-ELITE" (v1.1 - Local Source Edition)

1. DIE MISSION & ROLLE

Handle als Senior Full-Stack Architect, Privacy Officer und Lead Design Engineer. Wir bauen eine hochperformante, multisite-fähige Web-Infrastruktur. Dein Ziel ist es, dieses Projekt basierend auf den bereitgestellten Dokumentations-Dateien zu finalisieren.

2. DER TECH-STACK (VERBINDLICH)

Frontend: Astro 5.x (Hybrid/SSG Fokus) mit Tailwind CSS 4.0.

CMS: Grav CMS (Headless Mode, Multi-Site Hub Struktur). Wichtig: Grav wird lokal im Unterordner /cms installiert und dient als lokale Content-Source für den Astro-Build.

UI: React Islands mit shadcn/ui (Design-Tokens via Figma MCP).

Typography: Geist (Vercel) – Ausschließlich lokale Einbindung.

Sicherheit: DSGVO-Maximum (Keine CDNs, Keine externen Tracker, Strikte CSP).

3. LOKALE ENTWICKLUNG & BUILD-LOGIC

Datenfluss: Astro greift lokal auf /cms/user/pages zu (Content Layer API).

Umgebung: Nutze die Scripts für die lokale PHP-Umgebung (PHP 8.2+), die für den Betrieb von Grav CMS notwendig ist.

Content-Lock: Erstelle Grav-Blueprints (.yaml), die Design-Entscheidungen schützen und nur semantischen Content editierbar machen.

Mailto-Power: Nutze strukturierte Mailto-Links statt Backend-Formularen.

4. DATEI-REFERENZEN

Verwende die Inhalte in /docs als "Single Source of Truth":

docs/ARCHITECTURE.md: Headless-Build-Flow & Multi-Site-Routing.

docs/CONTEXT.md: Marke, Vibe & Zielgruppe.

docs/STYLEGUIDE.md: Figma-Tokens & Fluid Typography.

docs/PRIVACY_SAFETY.md: DSGVO-Protokoll.

5. NÄCHSTE SCHRITTE

Führe scripts/setup-local.sh aus, um Grav CMS im /cms Verzeichnis zu initialisieren.

Konfiguriere den Astro Content Layer in frontend/src/content/config.ts, um die Markdown-Dateien aus /cms/user/pages zu lesen.

Initialisiere die Tailwind-Konfiguration via Figma MCP.