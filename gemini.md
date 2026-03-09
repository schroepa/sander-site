# 🧭 Sander Catering — Project Constitution

> This file is **law**. All schemas, rules, and architectural invariants live here.

---

## Architecture

| Layer    | Technology       | Version  | Directory   |
| -------- | ---------------- | -------- | ----------- |
| Backend  | Grav CMS         | 1.7.49.5 | `/cms`      |
| Frontend | Astro            | 5.17.x   | `/frontend` |
| UI       | React + Tailwind | 19 / v4  | `/frontend` |
| Runtime  | PHP              | 8.5.1    | system      |
| Runtime  | Node.js          | 22.18.0  | system      |

## North Star

Transform sander-catering.com from an outdated digital business card into a **product-offering site** that showcases Sander Betriebsgastronomie's services as concrete, bookable products. Zero external integrations — Grav CMS is the sole source of truth.

## Behavioral Rules

1. **Tone:** Professional & premium, yet warm and welcoming
2. **Language:** German only, "Du" (informell/professional)
3. **Images:** NO stock photos — AI-generated imagery workflow required
4. **Integrations:** Minimize to zero; everything runs through Grav
5. **Content source:** Grav CMS is the single source of truth

## Data Schema

### Homepage Frontmatter (`homepage.md`)

```yaml
title: string # Page title / meta title
meta_description: string # SEO meta description

hero:
  headline: string # Main H1 headline
  subline: string # Subtitle text
  spotlight_text: string # Background effect text (multiline)
  spotlight_line_height: string # line-height for spotlight
  spotlight_blur: string # blur amount for base text
  spotlight_softness: string # edge softness (0-100)
  cta_text: string # Button label
  cta_link: string # Button href

services: # Product offerings (the core pivot)
  - title: string # Service name
    description: string # Short description
    icon: string # Icon identifier or emoji
    features: string[] # Bullet points / key features

usps: # Unique Selling Propositions
  - title: string
    description: string
    icon: string

references: # Client references / logos
  - name: string
    logo: string # Path to logo image in Grav
    quote: string # Optional testimonial

team: # Contact persons
  - name: string
    role: string
    image: string # Path to portrait in Grav

about:
  headline: string
  body: string # Markdown body text
  stats: # Key company numbers
    - label: string
      value: string

contact:
  headline: string
  subline: string
  email: string
  phone: string

footer:
  legal_links: # Impressum, Datenschutz, etc.
    - label: string
      url: string
  sister_sites: # Sander Gruppe, Sander Gourmet, etc.
    - label: string
      url: string
```

### TypeScript Interfaces (in `grav.ts`)

Must mirror the YAML schema above. All fields optional except `title`.

## Design Tokens

- **Source:** Figma (extracted via MCP Server)
- **Font:** Geist (system-ui fallback)
- **Theme:** Dark mode default, Light mode opt-in (`data-theme="light"`)
- **Token file:** `frontend/src/styles/tokens.css` (178 lines)
- **Global styles:** `frontend/src/styles/global.css`
- **Color palette:** Warm mauve/purple (#402e3a → #f1eef0)

## Maintenance Log

| Date       | Change                                        | Author |
| ---------- | --------------------------------------------- | ------ |
| 2026-02-22 | Protocol 0 initialized                        | System |
| 2026-02-22 | Discovery answers received, data schema added | System |
