import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    lib: {
      entry: 'src/App.tsx',
      formats: ['es'],
      fileName: () => 'index.mjs',
    },
    outDir: 'dist',
    rollupOptions: {
      // Provided by the host through its import map; bundling a copy would
      // break hooks (second React) and React Query (second provider).
      external: [
        'react', 'react-dom', 'react/jsx-runtime',
        // lucide-react is BUNDLED, not external: the host's /vendor stub
        // re-exports only a fixed subset of icons, and an import it lacks
        // (FolderKanban, Satellite, ...) fails the whole page at load.
        // Tree-shaking keeps just the icons used; React stays the host's.
        '@kirocrew/app-sdk', '@kirocrew/app-sdk/ui',
        '@tanstack/react-query',
      ],
    },
  },
})
