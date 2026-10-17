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

/** Each entry is one PNG. The harness renders a single route; `prepare` drives
 *  the UI into the state a view needs (clicking a project row, opening the
 *  New-project dialog) before the capture. `prepare` receives the Playwright
 *  page and must leave the view painted. */
const VIEWS = [
  // The default: the project list (folders) + the first project's page header,
  // which spans multiple repos and shows read-only instructions.
  { name: 'projects-overview', width: 1280, height: 900 },
  { name: 'projects-overview-narrow', width: 760, height: 900 },
  // The per-project GOALS view: a project with multiple LIVE goals (each with
  // its sub-team/worker rollup) and ARCHIVED goals below them.
  {
    name: 'project-goals',
    width: 1280,
    height: 1200,
    prepare: async page => clickProjectByName(page, 'Verify telemetry parsers'),
  },
  // A single-repo project (the extra_repos degrade path) that also shows one
  // live and one archived goal, selected by name.
  {
    name: 'project-single-repo',
    width: 1280,
    height: 900,
    prepare: async page => clickProjectByName(page, 'TrackOut braking coaching'),
  },
  // A folder with no directory set: the Set-directory prompt, never a guess.
  {
    name: 'project-set-directory',
    width: 1280,
    height: 900,
    prepare: async page => clickProjectByName(page, 'Mobile companion app'),
  },
  // The New-project flow: name, one-or-more directories, fixed default agent.
  {
    name: 'new-project-dialog',
    width: 1280,
    height: 900,
    prepare: async page => {
      await page.getByRole('button', { name: 'New project' }).first().click()
      await page.waitForSelector('.tp-dialog', { timeout: 10_000 })
      // Add a second directory row so the multi-repo affordance is visible.
      await page.getByRole('button', { name: 'Add directory' }).click()
      await page.waitForTimeout(150)
    },
  },
]

/** Click the project row whose title matches `name`. */
async function clickProjectByName(page, name) {
  const row = page.locator('.tp-prow', { hasText: name }).first()
  await row.click()
  await page.waitForTimeout(200)
}

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
      await page.goto(url, { waitUntil: 'networkidle' })
      // Let the first React Query fetch resolve and the list paint.
      await page.waitForSelector('.tp-root', { timeout: 10_000 })
      await page.waitForTimeout(400)
      if (view.prepare) await view.prepare(page)
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
