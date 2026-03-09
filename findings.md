# 🔍 Findings — Sander Catering

## 2026-02-22 — Initial Discovery

### Project Structure

- **Monorepo** with two workspaces: `cms/` (Grav) and `frontend/` (Astro)
- Root `package.json` uses npm workspaces pointing to `frontend/`
- `concurrently` installed for running both servers

### Frontend

- **Astro 5.17** with React integration and Tailwind CSS v4 (Vite plugin)
- Single page: `index.astro` — renders Hero + content sections + markdown body
- Two components: `Hero.astro` (layout) and `SpotlightText.tsx` (interactive React)
- Design tokens in `tokens.css` — full dark/light theme, Geist font, all spacing/radius/shadow tokens from Figma
- Layout in `layouts/Layout.astro`
- Grav data helper in `lib/grav.ts`

### CMS (Grav)

- Content pages: `01.home/` and `02.typography/`
- Grav serves as headless backend — Astro reads content at dev/build time
- Grav file watcher configured in `astro.config.mjs` for hot reload

### Design System

- Colors: Warm mauve/purple palette (`#402e3a` → `#f1eef0`)
- Font: Geist (display, heading, body, action, caption)
- Tokens: 40+ CSS custom properties for colors, 12 for typography, 10 for spacing, 6 for radius
- Dark mode default, light mode via `data-theme="light"`

## 2026-02-22 — Existing Site Analysis (sander-catering.com)

### Company Profile

- **Sander Betriebsgastronomie** — corporate catering (B2B)
- Family company, 50+ years history, 250+ operated gastronomies
- Own **Frische-Manufaktur** (fresh production facility)
- Certifications: DIN EN ISO 9001:2015, EG-Öko-Verordnung, IFS Food v6.1

### Existing Site Content Areas

1. Hero slider with rotating slogans
2. **Betriebsrestaurant** — core offering: corporate restaurant operations
3. **Lunchbox** — flexible delivery solution (app-based ordering)
4. **Services list:** Mittagessen, Frühstück, Konferenzservice, Events, Automatenservice
5. **Frische-Manufaktur** — in-house food production, sous-vide, cook & chill
6. **Sustainability & quality** — regional sourcing, transparency, allergen declaration
7. **References:** BRITA Taunusstein, VRM Mainz, Ski jumping Willingen, Nürburgring
8. **Team:** 6 contact persons (Jens Dülme, Melanie Kneip, Christine Dörnbach, etc.)
9. **Contact form** — server-side with privacy policy agreement
10. **Footer:** Legal links to sander-gruppe.com (Impressum, Datenschutz, AGB, etc.)

### Key Observations

- Site uses old-style WordPress/CMS carousel and expand/collapse accordions
- Lot of text-heavy content — needs consolidation for onepager format
- Product differentiation: Frische-Manufaktur is the strongest USP
- B2B tone but speaks to "Mitarbeiter" (employees) as end users
