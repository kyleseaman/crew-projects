/**
 * Screenshot the dev harness.
 *
 * Builds the harness (vite.dev.config.ts -> dist-dev/), serves it with Vite's
 * preview server, loads it in Playwright's bundled Chromium, and writes PNGs to
 * ../screenshots/. Step 1 captures the current App view; later steps add more
 * captures to the VIEWS list below.
 *
 * Run from ui/:  npm run screenshot
 * It builds first, so you do not need a running dev server.
 */
import { preview } from 'vite'
import { chromium } from 'playwright'
import { mkdir } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import { execFileSync } from 'node:child_process'

const here = dirname(fileURLToPath(import.meta.url))
const uiDir = resolve(here, '..')
const outDir = resolve(uiDir, '..', 'screenshots')

/** Each entry is one PNG. `path` is the harness route (hash/query) to load;
 *  the harness renders a single route today, so step 1 captures it at two
 *  widths. Later steps push more entries as views land. */
const VIEWS = [
  { name: 'projects-overview', path: '/', width: 1280, height: 900 },
  { name: 'projects-overview-narrow', path: '/', width: 760, height: 900 },
]

async function main() {
  await mkdir(outDir, { recursive: true })

  // Build the harness to dist-dev/ (plain SPA; never touches dist/index.mjs).
  execFileSync('npm', ['run', 'dev:build'], { cwd: uiDir, stdio: 'inherit' })

  const server = await preview({
    configFile: resolve(uiDir, 'vite.dev.config.ts'),
    root: uiDir,
    preview: { port: 4317, strictPort: true },
  })
  const url = server.resolvedUrls.local[0].replace(/\/$/, '')

  const browser = await chromium.launch()
  try {
    for (const view of VIEWS) {
      const page = await browser.newPage({
        viewport: { width: view.width, height: view.height },
        deviceScaleFactor: 2,
      })
      await page.goto(`${url}${view.path}`, { waitUntil: 'networkidle' })
      // Let the first React Query fetch resolve and the list paint.
      await page.waitForSelector('.tp-root', { timeout: 10_000 })
      await page.waitForTimeout(400)
      const file = resolve(outDir, `${view.name}.png`)
      await page.screenshot({ path: file, fullPage: true })
      // eslint-disable-next-line no-console
      console.log('wrote', file)
      await page.close()
    }
  } finally {
    await browser.close()
    await server.httpServer.close()
  }
}

main().then(
  () => process.exit(0),
  err => {
    // eslint-disable-next-line no-console
    console.error(err)
    process.exit(1)
  },
)
