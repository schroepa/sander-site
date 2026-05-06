# Server-Migration — Vollständiger Plan

**Projekt:** Sander Catering Onepager  
**Ziel:** Migration von SiteGround (FTP + GitHub Actions) auf neuen VPS (alles lokal)  
**Datum:** 2026-05  

---

## Übersicht: Was sich ändert

| Komponente | Vorher | Nachher |
|---|---|---|
| Grav CMS | SiteGround | Neuer Server |
| Astro-Build | GitHub Actions (Ubuntu) | Neuer Server (lokal) |
| Deploy | FTP-Upload | Lokales rsync |
| Build-Trigger | GitHub `repository_dispatch` | Lokaler Webhook-Endpunkt |
| Pages-Download | FTP-Mirror | Entfällt (Grav ist lokal) |
| `GRAV_PAGES_DIR` | `../../../cms/user/pages` | Absoluter Pfad zu Grav |
| `GRAV_MEDIA_BASE` | `/cms/user/pages/01.home` | Unverändert |
| `SITE_URL` | GitHub Secret | `.env`-Datei auf Server |
| URL-Struktur | `/cms/` für Grav | Unverändert |

---

## Phase 1 — Voraussetzungen prüfen (vor der Migration)

### 1.1 Node.js-Version
```bash
node --version   # Muss >= 22.0.0 sein
npm --version
```
Das Projekt benötigt **Node 22**. Bei älterer Version:
```bash
# Via nvm (empfohlen)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
nvm install 22
nvm use 22
nvm alias default 22
```

### 1.2 RAM-Anforderungen
Astro-Build mit Tailwind und ~200 Komponenten:
- **Minimum:** 1 GB RAM
- **Empfohlen:** 2 GB RAM
- **Prüfen:** `free -h`

Bei weniger als 1 GB RAM schlägt `npm run build` mit `Killed` oder `JavaScript heap out of memory` fehl.

**Lösung bei RAM-Engpass:**
```bash
# Swap einrichten (temporärer Workaround)
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
# Permanent (in /etc/fstab eintragen):
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

Node.js Build-Memory-Limit erhöhen:
```bash
export NODE_OPTIONS="--max-old-space-size=1536"
```

### 1.3 Disk-Space
```bash
df -h
```
- Grav-Installation: ~500 MB (inkl. Medien)
- Node-Module: ~500 MB
- Build-Output: ~100 MB
- Gesamt: **mind. 2 GB frei**

### 1.4 Webserver
```bash
apache2 -v    # oder
nginx -v
```
Muss konfiguriert sein für:
- PHP (für Grav)
- Statische Dateien (für Astro-Output)
- `/cms/` → Grav-Webroot
- `/` → Astro `dist/`

### 1.5 PHP-Version für Grav
```bash
php --version  # Grav 1.7+ benötigt PHP 7.3.6+, empfohlen PHP 8.x
```

### 1.6 Git
```bash
git --version
```

### 1.7 Composer (für Grav-Dependencies)
```bash
composer --version
```

---

## Phase 2 — Server-Setup

### 2.1 Grav CMS installieren/migrieren
```bash
# Grav-Dateien vom alten Server holen (via rsync oder FTP-Export)
# Alternativ: frische Grav-Installation + Content übertragen

# Grav-Webroot (Beispielpfad — anpassen):
/var/www/grav/

# Berechtigungen setzen:
chown -R www-data:www-data /var/www/grav
find /var/www/grav -type d -exec chmod 755 {} \;
find /var/www/grav -type f -exec chmod 644 {} \;
```

**Wichtig:** Grav-spezifische Verzeichnisse brauchen Schreibrechte:
```bash
chmod -R 775 /var/www/grav/cache
chmod -R 775 /var/www/grav/logs
chmod -R 775 /var/www/grav/tmp
chmod -R 775 /var/www/grav/backup
chmod -R 775 /var/www/grav/user/data
```

### 2.2 Repo klonen
```bash
cd /var/www
git clone https://github.com/schroepa/sander-site.git project
cd project
```

SSH-Key für GitHub hinterlegen falls privates Repo:
```bash
ssh-keygen -t ed25519 -C "server@domain.de"
cat ~/.ssh/id_ed25519.pub   # → als Deploy Key in GitHub hinzufügen
```

### 2.3 `.env`-Datei anlegen
```bash
cat > /var/www/project/.env << 'EOF'
SITE_URL=https://domain.de
GRAV_PAGES_DIR=/var/www/grav/user/pages
GRAV_MEDIA_BASE=/cms/user/pages/01.home
NODE_OPTIONS=--max-old-space-size=1536
EOF
chmod 600 /var/www/project/.env
```

### 2.4 Node-Dependencies installieren
```bash
cd /var/www/project/frontend
npm ci
```

---

## Phase 3 — deploy.sh anpassen

`scripts/deploy.sh` ersetzen mit:

```bash
#!/bin/bash
set -euo pipefail

# ── Konfiguration ────────────────────────────────────────────────
PROJECT_DIR="/var/www/project"
WEBROOT="/var/www/webroot"
LOCKFILE="/tmp/sander-deploy.lock"
LOGFILE="/var/log/sander-deploy.log"
ENV_FILE="$PROJECT_DIR/.env"

# ── Lock gegen parallele Builds ──────────────────────────────────
if [ -f "$LOCKFILE" ]; then
    echo "[$(date)] Build läuft bereits, abgebrochen." >> "$LOGFILE"
    exit 0
fi
touch "$LOCKFILE"
trap "rm -f $LOCKFILE" EXIT

# ── Logging ──────────────────────────────────────────────────────
exec >> "$LOGFILE" 2>&1
echo "=========================================="
echo "Build gestartet: $(date)"

# ── Env laden ────────────────────────────────────────────────────
set -a; source "$ENV_FILE"; set +a

# ── Rollback vorbereiten ─────────────────────────────────────────
if [ -d "$WEBROOT" ]; then
    rsync -a --delete "$WEBROOT/" "${WEBROOT}.bak/"
fi
rollback() {
    echo "FEHLER – Rollback wird ausgeführt: $(date)"
    if [ -d "${WEBROOT}.bak" ]; then
        rsync -a --delete "${WEBROOT}.bak/" "$WEBROOT/"
        echo "Rollback abgeschlossen."
    fi
}
trap rollback ERR

# ── Code aktualisieren ───────────────────────────────────────────
cd "$PROJECT_DIR"
git pull origin main

# ── Build ────────────────────────────────────────────────────────
cd frontend
npm ci --prefer-offline
npm run build

# ── Deploy ───────────────────────────────────────────────────────
rsync -a --delete dist/ "$WEBROOT/"

# ── Grav-Cache leeren ────────────────────────────────────────────
rm -rf /var/www/grav/cache/doctrine/*
rm -rf /var/www/grav/cache/compiled/*
rm -rf /var/www/grav/cache/twig/*

echo "Deploy abgeschlossen: $(date)"
```

---

## Phase 4 — Webhook-Endpunkt einrichten

### 4.1 PHP-Webhook-Script
```bash
cat > /var/www/grav/webhook-build.php << 'EOF'
<?php
// Webhook-Empfänger: triggert den lokalen Build
$secret = getenv('WEBHOOK_SECRET') ?: 'DEIN-GEHEIMER-TOKEN';

$receivedSecret = $_SERVER['HTTP_X_WEBHOOK_SECRET'] 
    ?? $_GET['secret'] 
    ?? '';

if (!hash_equals($secret, $receivedSecret)) {
    http_response_code(403);
    die('Forbidden');
}

// Build asynchron starten (nicht auf Ergebnis warten)
$cmd = 'bash /var/www/project/scripts/deploy.sh > /dev/null 2>&1 &';
exec($cmd);

http_response_code(200);
echo json_encode(['status' => 'build_started', 'time' => date('c')]);
EOF
```

**Fallstrick:** PHP `exec()` muss erlaubt sein (`disable_functions` in `php.ini` prüfen):
```bash
php -r "echo exec('echo test');"   # Muss "test" ausgeben
```

Falls `exec()` deaktiviert ist, Alternative via `proc_open()` oder ein separater Node.js-Webhook-Server.

### 4.2 Grav Webhook-Plugin umstellen
Im Grav-Admin → Plugins → Nav-Webhook (oder das verwendete Webhook-Plugin):

- **Alte URL:** `https://api.github.com/repos/schroepa/sander-site/dispatches`
- **Neue URL:** `https://domain.de/cms/webhook-build.php`
- **Header:** `X-Webhook-Secret: DEIN-GEHEIMER-TOKEN`

---

## Phase 5 — Webserver-Konfiguration

### Apache (Beispiel)
```apache
# Astro-Frontend (Hauptdomain)
<VirtualHost *:443>
    ServerName domain.de
    DocumentRoot /var/www/webroot

    # Grav unter /cms/
    Alias /cms /var/www/grav
    <Directory /var/www/grav>
        AllowOverride All
        Require all granted
    </Directory>

    # Astro SPA-Fallback (falls Client-Side-Routing)
    <Directory /var/www/webroot>
        AllowOverride All
        Require all granted
    </Directory>
</VirtualHost>
```

### Nginx (Beispiel)
```nginx
server {
    listen 443 ssl;
    server_name domain.de;
    root /var/www/webroot;

    # Grav unter /cms/
    location /cms/ {
        alias /var/www/grav/;
        try_files $uri $uri/ /cms/index.php?$query_string;
        
        location ~ \.php$ {
            fastcgi_pass unix:/var/run/php/php8.1-fpm.sock;
            fastcgi_param SCRIPT_FILENAME $request_filename;
            include fastcgi_params;
        }
    }

    # Astro static files
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

---

## Phase 6 — Testbuild (vor DNS-Umzug)

```bash
# Manuell ausführen und Output prüfen
bash /var/www/project/scripts/deploy.sh

# Prüfen ob Build erfolgreich war
ls -la /var/www/webroot/
curl -s http://localhost/ | grep -i "sander"

# Logs prüfen
tail -50 /var/log/sander-deploy.log
```

---

## Phase 7 — DNS-Umzug

1. **TTL vorab reduzieren** (mind. 24h vorher auf 300s setzen)
2. **Neuen Server testen** via `/etc/hosts` Eintrag:
   ```
   NEUE-IP   domain.de
   ```
3. **DNS-Record umstellen** auf neue IP
4. **Propagation abwarten** (`dig domain.de` prüfen)
5. **SSL-Zertifikat** auf neuem Server einrichten (Let's Encrypt):
   ```bash
   certbot --apache -d domain.de
   # oder
   certbot --nginx -d domain.de
   ```

---

## Phase 8 — Nach der Migration

### 8.1 GitHub Actions deaktivieren
```bash
# Workflow-Datei leeren oder Trigger entfernen
# .github/workflows/deploy.yml → on: [] setzen oder Datei löschen
```

**Wichtig:** Solange der Grav-Webhook noch auf GitHub zeigt UND der neue Webhook noch nicht aktiv ist, könnte ein fehlgeschlagener GitHub-Build getriggert werden. Grav-Webhook sofort umstellen.

### 8.2 Monitoring einrichten
```bash
# Einfaches Deploy-Log-Monitoring
tail -f /var/log/sander-deploy.log

# Prüfen ob Webroot aktuell ist
stat /var/www/webroot/index.html
```

### 8.3 Alten Server
- Grav-Admin-Passwörter ändern (falls gleiche genutzt wurden)
- FTP-Zugänge deaktivieren
- GitHub Secrets bereinigen (FTP-Credentials entfernen)
- Erst abschalten wenn neuer Server 1-2 Wochen stabil läuft

---

## Mögliche Fehler und Lösungen

### Build schlägt fehl: `JavaScript heap out of memory`
```bash
export NODE_OPTIONS="--max-old-space-size=1536"
# In .env eintragen
```

### Build schlägt fehl: `Killed` (OOM)
RAM zu gering. Swap einrichten (siehe Phase 1.2).

### `GRAV_PAGES_DIR` nicht gefunden
```bash
ls -la $GRAV_PAGES_DIR
# Pfad in .env korrigieren
```

### Bilder werden nicht angezeigt (`404`)
`GRAV_MEDIA_BASE` stimmt nicht mit dem tatsächlichen Grav-Webpfad überein. Prüfen:
```bash
curl -I https://domain.de/cms/user/pages/01.home/frischfleisch.jpg
```

### Webhook kommt nicht an
```bash
# PHP exec() testen
php -r "echo exec('echo test');"

# Webhook-Log prüfen
tail -f /var/log/apache2/error.log   # oder nginx

# Manuell testen
curl -X POST https://domain.de/cms/webhook-build.php \
  -H "X-Webhook-Secret: DEIN-TOKEN"
```

### Parallele Builds (Lock-Datei hängt)
```bash
rm -f /tmp/sander-deploy.lock
```

### Git pull schlägt fehl (Merge-Konflikt)
```bash
cd /var/www/project
git fetch origin
git reset --hard origin/main
```

### Grav-Cache nicht gelöscht → altes Frontend sichtbar
```bash
rm -rf /var/www/grav/cache/*
```

### PHP `exec()` deaktiviert
Alternative: Webhook-Empfänger als eigenständiger Node.js-Prozess:
```javascript
// webhook-server.js — Port 3001
const http = require('http');
const { exec } = require('child_process');

http.createServer((req, res) => {
    const secret = req.headers['x-webhook-secret'];
    if (secret !== process.env.WEBHOOK_SECRET) {
        res.writeHead(403); res.end(); return;
    }
    exec('bash /var/www/project/scripts/deploy.sh');
    res.writeHead(200); res.end('ok');
}).listen(3001);
```
Als systemd-Service laufen lassen.

### SSL-Zertifikat fehlt nach DNS-Umzug
```bash
certbot --apache -d domain.de --non-interactive --agree-tos -m admin@domain.de
```

### `npm ci` schlägt fehl: `package-lock.json` nicht synchron
```bash
cd /var/www/project/frontend
npm install   # einmalig, danach wieder npm ci
git add package-lock.json
git commit -m "fix: package-lock.json synchronisieren"
git push
```

### Grav-Admin nicht erreichbar nach Migration
Grav-Konfiguration prüfen: `user/config/system.yaml` → `session.path` muss beschreibbar sein.

### Build dauert sehr lange (>5 Minuten)
```bash
# node_modules cachen zwischen Builds
# npm ci --prefer-offline nutzen (bereits im deploy.sh)
# Prüfen ob Netzwerk langsam ist (npm registry Zugriff)
```

---

## Checkliste Migration

### Vor dem Umzug
- [ ] Node.js >= 22 installiert und verifiziert
- [ ] RAM >= 1 GB (oder Swap eingerichtet)
- [ ] Disk >= 2 GB frei
- [ ] PHP-Version kompatibel mit Grav
- [ ] Webserver konfiguriert (Apache/Nginx)
- [ ] SSL-Zertifikat bereit (certbot)
- [ ] Grav erfolgreich auf neuem Server installiert
- [ ] Repo geklont, `.env`-Datei angelegt
- [ ] `deploy.sh` angepasst und getestet
- [ ] Webhook-Script installiert und getestet
- [ ] Manueller Testbuild erfolgreich
- [ ] Website via `/etc/hosts` auf neuem Server verifiziert
- [ ] DNS-TTL auf 300s reduziert (mind. 24h vorher)

### DNS-Umzug
- [ ] DNS-Record auf neue IP umgestellt
- [ ] SSL-Zertifikat auf neuem Server aktiv
- [ ] Website über echte Domain erreichbar
- [ ] Grav-Admin erreichbar (`/cms/admin`)
- [ ] Content-Save triggert Build (Webhook testen)
- [ ] Bilder werden korrekt geladen
- [ ] Alt-Tags kommen an (Split-Section testen)

### Nach dem Umzug
- [ ] GitHub Actions Workflow deaktiviert
- [ ] Grav-Webhook von GitHub-URL auf lokale URL umgestellt
- [ ] GitHub Secrets (FTP-Credentials) entfernt
- [ ] Deploy-Log läuft sauber (`/var/log/sander-deploy.log`)
- [ ] Rollback-Backup vorhanden (`/var/www/webroot.bak`)
- [ ] Alter Server noch 1-2 Wochen erreichbar (Fallback)
- [ ] Alter Server abgeschaltet

---

## Rollback-Plan

Falls die Migration fehlschlägt:
1. DNS sofort zurück auf alte IP (TTL ist niedrig → schnell)
2. Alter Server läuft noch → keine Downtime
3. Fehler analysieren, neuen Server fixen
4. Erneut versuchen
