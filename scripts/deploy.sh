#!/bin/bash
# NATIVES DEPLOYMENT SCRIPT FÜR HETZNER VPS (Ubuntu 24.04)

PROJECT_NAME="vibe-elite"
WEB_ROOT="/var/www/vibe-elite"

echo "Checking for updates..."
git pull origin main

echo "Building Frontend..."
cd frontend
npm install
npm run build

echo "Syncing to Webroot..."
rsync -avz --delete dist/ $WEB_ROOT/public/

echo "Setting Permissions for Grav CMS..."
chown -R www-data:www-data ../cms/user/storage

echo "🚀 Deployment erfolgreich!"