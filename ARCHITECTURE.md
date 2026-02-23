# Architecture: Headless CMS + Astro Frontend

## Stack

| Layer    | Technology       | Version   | Directory  |
|----------|------------------|-----------|------------|
| Backend  | Grav CMS         | 1.7.49.5  | `/cms`     |
| Frontend | Astro            | 5.17.x    | `/frontend`|
| UI       | React + Tailwind | 19 / v4   | `/frontend`|
| Runtime  | PHP              | 8.5.1     | system     |
| Runtime  | Node.js          | 22.18.0   | system     |

## Structure

```
sander-site/              ← Monorepo root
├── cms/                  ← Grav CMS (headless backend)
│   ├── user/             ← Content, config, themes, plugins
│   └── system/           ← Grav core (do not modify)
├── frontend/             ← Astro (public-facing frontend)
│   └── src/
│       ├── pages/        ← Route-based pages
│       ├── layouts/      ← Page layout templates
│       ├── components/   ← React / Astro components
│       ├── styles/       ← Global CSS (Tailwind)
│       ├── lib/          ← Utilities, API helpers
│       └── content/      ← Local content collections
└── package.json          ← Monorepo workspace config
```

## Data Flow

Astro reads content from Grav during build or at dev-time via local file reads or API calls.

## Domain Mapping

The build process uses `SITE_CONTEXT` env var to select which Grav content path renders for which domain.

## i18n

Native Astro routing (`/de`, `/en`). Grav provides language-specific files (e.g., `item.de.md`).