import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'node:url'

/**
 * Dev-only config for the mock-data harness (`npm run dev` / `npm run dev:build`).
 * It aliases the two host-provided SDK specifiers to local stubs so the real
 * App component renders standalone, and serves src/dev/harness.tsx via
 * index.html. The PRODUCTION bundle is built by vite.config.ts (library mode,
 * entry src/App.tsx) and knows nothing about these aliases or src/dev/, so the
 * harness cannot leak into dist/index.mjs.
 */
const r = (p: string) => fileURLToPath(new URL(p, import.meta.url))

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // Order matters: the more specific '/ui' subpath must precede the base.
      '@kirocrew/app-sdk/ui': r('./src/dev/ui-stub.tsx'),
      '@kirocrew/app-sdk': r('./src/dev/sdk-stub.tsx'),
    },
  },
  build: {
    // A plain SPA build of the harness for the screenshot script to serve as
    // static files. Writes to dist-dev/ so it never touches the shipped
    // dist/index.mjs library bundle.
    outDir: 'dist-dev',
    emptyOutDir: true,
  },
})
