#!/bin/bash
# Synchronisiert CMS-Inhalte vom Live-Server für lokale Entwicklung.
# Lädt Markdown-Seiten und .meta.yaml-Dateien herunter (keine Bilder).
# Bilder werden im Dev-Server via Proxy vom Live-Server geladen (LIVE_SERVER_URL).
#
# Voraussetzung: lftp installiert (macOS: brew install lftp)
# Einrichtung:   .env.local anlegen (siehe .env.local.example)

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
ENV_FILE="$ROOT_DIR/.env.local"

if [ ! -f "$ENV_FILE" ]; then
    echo "Fehler: $ENV_FILE nicht gefunden."
    echo "Kopiere .env.local.example nach .env.local und trage die FTP-Zugangsdaten ein."
    exit 1
fi

set -a; source "$ENV_FILE"; set +a

: "${FTP_SERVER:?FTP_SERVER fehlt in .env.local}"
: "${FTP_USERNAME:?FTP_USERNAME fehlt in .env.local}"
: "${FTP_PASSWORD:?FTP_PASSWORD fehlt in .env.local}"
: "${FTP_CMS_PATH:?FTP_CMS_PATH fehlt in .env.local}"

echo "Synchronisiere CMS-Inhalte von $FTP_SERVER..."

lftp -u "$FTP_USERNAME,$FTP_PASSWORD" \
    -e "set ftp:ssl-allow no;
        set net:timeout 30;
        set net:max-retries 3;
        set net:connection-limit 4;
        mirror --verbose --no-perms \
            --exclude-glob=*.jpg \
            --exclude-glob=*.jpeg \
            --exclude-glob=*.png \
            --exclude-glob=*.gif \
            --exclude-glob=*.webp \
            --exclude-glob=*.svg \
            --exclude-glob=*.ico \
            --exclude-glob=*.mp4 \
            --exclude-glob=*.pdf \
            --exclude-glob=*.save \
            ${FTP_CMS_PATH}pages $ROOT_DIR/cms/user/pages;
        mirror --no-recursion --no-perms \
            --include-glob=site.yaml \
            ${FTP_CMS_PATH}config/ $ROOT_DIR/cms/user/config/;
        quit" \
    "$FTP_SERVER"

MD_COUNT=$(find "$ROOT_DIR/cms/user/pages" -name '*.md' | wc -l | tr -d ' ')
META_COUNT=$(find "$ROOT_DIR/cms/user/pages" -name '*.meta.yaml' | wc -l | tr -d ' ')

echo "Fertig: $MD_COUNT Markdown-Dateien, $META_COUNT Meta-Dateien geladen."
echo "Dev-Server starten: cd frontend && npm run dev"
