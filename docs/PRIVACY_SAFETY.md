PRIVACY & SECURITY PROTOCOL

DSGVO-MAXIMUM

Hosting: Ausschließlich in Deutschland (Hetzner VPS).

Fonts: Lokal gehostet im /public/fonts Ordner.

Scripts: Keine CDNs. Alles wird über node_modules gebündelt.

Analytics: Umami (Selbstgehostet) – keine Cookies, kein Consent-Banner nötig.

SECURITY

Generiere eine Caddyfile oder nginx.conf mit strengen CSP-Headern:

default-src 'self'

img-src 'self' data:

script-src 'self' 'unsafe-inline' (nur wo für Astro/React nötig).