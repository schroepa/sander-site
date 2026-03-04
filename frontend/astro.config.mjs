// @ts-check
import { defineConfig } from 'astro/config';
import path from 'node:path';

import tailwindcss from '@tailwindcss/vite';

// Resolve path to Grav content directory for file watching
const gravPagesDir = path.resolve(import.meta.dirname, '../cms/user/pages');

// https://astro.build/config
export default defineConfig({
  vite: {
    plugins: [tailwindcss()],

    // Watch Grav content files for hot reload during development
    server: {
      watch: {
        // Include the Grav pages directory in the file watcher
        ignored: [`!${gravPagesDir}/**`],
      },
    },
  },
});