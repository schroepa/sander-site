#!/bin/bash
# VIBE-ELITE Local Grav Setup
# Installs Grav Core + Admin into /cms

set -e

# Directories
PROJECT_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
CMS_DIR="$PROJECT_ROOT/cms"

echo "🚀 Starting Local Grav Setup..."

# 1. Clean existing CMS dir if empty or partial (safety check)
if [ -z "$(ls -A "$CMS_DIR" 2>/dev/null)" ]; then
    echo "📂 CMS directory is empty. Proceeding..."
else
    echo "⚠️  CMS directory is not empty. Checking for Grav..."
    if [ -f "$CMS_DIR/system/defines.php" ]; then
        echo "✅ Grav seems to be installed. Skipping download."
    else
        echo "⚠️  Directory not empty but Grav not found. Please clean manually."
        exit 1
    fi
fi

# 2. Download specific Grav version (latest stable)
if [ ! -f "$CMS_DIR/system/defines.php" ]; then
    echo "⬇️  Downloading Grav Core + Admin..."
    curl -L -o grav-admin.zip https://getgrav.org/download/core/grav-admin/latest
    unzip -q grav-admin.zip
    
    # Move files to CMS_DIR
    echo "📂 Extracting to $CMS_DIR..."
    # Unzip creates a 'grav-admin' folder. Move contents to CMS_DIR.
    # Note: CMS_DIR needs to exist.
    mkdir -p "$CMS_DIR"
    cp -r grav-admin/* "$CMS_DIR"/
    cp -r grav-admin/.* "$CMS_DIR"/ 2>/dev/null || true
    
    # Cleanup
    rm -rf grav-admin grav-admin.zip
    echo "✅ Grav installed."
fi

# 3. Link Blueprints
echo "🔗 Linking Custom Blueprints..."
BLUEPRINTS_SRC="$CMS_DIR/user/blueprints"
mkdir -p "$BLUEPRINTS_SRC"

# If we have local footprints to copy/link
# (Currently, I created cms/user/blueprints/pages/default.yaml in step 46, but it might have been overwritten by the fresh install if not careful. 
# actually, the fresh install creates 'user' folder. I should preserve it or overwrite it carefully.
# The previous step 46 wrote to `cms/user/blueprints/pages/default.yaml`.
# If I just unzipped grav-admin, it typically contains a fresh `user` folder. 
# My logic above `cp -r grav-admin/* "$CMS_DIR"/` might overwrite existing user folder if not careful or merge.
# `cp -r` usually merges directories on Mac/Linux.
# Let's verify if blueprints exist, if not, recreate them.)

if [ ! -f "$CMS_DIR/user/blueprints/pages/default.yaml" ]; then
    echo "⚠️  Blueprints missing. Re-creating Content-Lock blueprint..."
    mkdir -p "$CMS_DIR/user/blueprints/pages"
    
cat > "$CMS_DIR/user/blueprints/pages/default.yaml" <<EOF
title: Default Page
form:
  fields:
    tabs:
      type: tabs
      active: 1
      fields:
        content:
          type: tab
          title: Content
          fields:
            content:
              type: markdown
              label: Page Content
              validate:
                type: textarea
        
        settings:
          type: tab
          title: Settings
          fields:
            header.title:
              type: text
              label: Page Title
            header.slug:
              type: text
              label: URL Slug
EOF
    echo "✅ Blueprint recreated."
fi

# 4. Success
echo "🎉 Grav Setup Complete!"
echo "👉 Run 'cd cms && php -S localhost:8000 system/router.php' to start Grav Admin."
