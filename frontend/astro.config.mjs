// @ts-check
import { defineConfig } from 'astro/config';
import path from 'node:path';
import sitemap from '@astrojs/sitemap';

import tailwindcss from '@tailwindcss/vite';

// Resolve path to Grav content directory for file watching
const gravPagesDir = path.resolve(import.meta.dirname, '../cms/user/pages');

// https://astro.build/config
export default defineConfig({
  site: process.env.SITE_URL || undefined,
  integrations: [sitemap()],
  vite: {
    plugins: [tailwindcss()],

    // Watch Grav content files for hot reload during development
    server: {
      // Proxy /cms/ requests to the live server so images load locally
      proxy: process.env.LIVE_SERVER_URL ? {
        '/cms': {
          target: process.env.LIVE_SERVER_URL,
          changeOrigin: true,
        },
      } : undefined,
      watch: {
        // Include the Grav pages directory in the file watcher
        ignored: [`!${gravPagesDir}/**`],
      },
    },
  },
});