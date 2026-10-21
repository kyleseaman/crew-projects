import { defineConfig, mergeConfig } from 'vitest/config'
import { fileURLToPath } from 'node:url'
import viteConfig from './vite.config'

/**
 * Test config. Same plugins as the library build, plus the dev harness's SDK
 * stubs so component tests can server-render the real components. The aliases
 * live ONLY here (and in vite.dev.config.ts): the production build reads
 * vite.config.ts, which keeps the SDK external.
 */
const r = (p: string) => fileURLToPath(new URL(p, import.meta.url))

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      alias: [
        { find: /^@kirocrew\/app-sdk\/ui$/, replacement: r('./src/dev/ui-stub.tsx') },
        { find: /^@kirocrew\/app-sdk$/, replacement: r('./src/dev/sdk-stub.tsx') },
      ],
    },
  }),
)
